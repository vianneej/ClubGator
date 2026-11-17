import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Look up a registered user by their username
 */
export async function findUserByUsername(username) {
  const cleanName = username.trim();
  if (!cleanName) return null;

  // Queries the users collection by username
  const q = query(
    collection(db, 'users'),
    where('username', '==', cleanName)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];
  return {
    uid: userDoc.id,
    ...userDoc.data()
  };
}

/**
 * Send a friend request from current user to target user
 */
export async function sendFriendRequest(fromUser, toUser) {
  if (!fromUser?.uid || !toUser?.uid || fromUser.uid === toUser.uid) {
    throw new Error('Invalid user IDs for friend request.');
  }

  const requestId = `${fromUser.uid}_${toUser.uid}`;
  const requestRef = doc(db, 'friendRequests', requestId);

  const existing = await getDoc(requestRef);
  if (existing.exists() && existing.data().status === 'pending') {
    throw new Error('Friend request already sent.');
  }

  await setDoc(requestRef, {
    fromUid: fromUser.uid,
    fromUsername: fromUser.username || 'Gator',
    toUid: toUser.uid,
    toUsername: toUser.username || 'Gator',
    status: 'pending',
    createdAt: serverTimestamp()
  });

  return requestId;
}

/**
 * Fetch incoming pending friend requests for a user
 */
export async function getIncomingRequests(uid) {
  const q = query(
    collection(db, 'friendRequests'),
    where('toUid', '==', uid),
    where('status', '==', 'pending')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}

/**
 * Accept a friend request and add bidirectional friend records
 */
export async function acceptFriendRequest(requestId) {
  const requestRef = doc(db, 'friendRequests', requestId);
  const requestSnap = await getDoc(requestRef);

  if (!requestSnap.exists()) {
    throw new Error('Friend request not found.');
  }

  const { fromUid, fromUsername, toUid, toUsername } = requestSnap.data();

  // 1. Mark request as accepted
  await updateDoc(requestRef, { status: 'accepted' });

  // 2. Add each user to the other's friends subcollection
  const now = serverTimestamp();
  await Promise.all([
    setDoc(doc(db, 'users', toUid, 'friends', fromUid), {
      friendUid: fromUid,
      username: fromUsername,
      addedAt: now
    }),
    setDoc(doc(db, 'users', fromUid, 'friends', toUid), {
      friendUid: toUid,
      username: toUsername,
      addedAt: now
    })
  ]);
}

/**
 * Decline or cancel a friend request
 */
export async function declineFriendRequest(requestId) {
  const requestRef = doc(db, 'friendRequests', requestId);
  await updateDoc(requestRef, { status: 'declined' });
}

/**
 * Fetch a user's accepted friends list
 */
export async function getFriendsList(uid) {
  const friendsRef = collection(db, 'users', uid, 'friends');
  const snapshot = await getDocs(friendsRef);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data()
  }));
}

/**
 * Remove a friend from both users' lists
 */
export async function removeFriend(uid, friendUid) {
  await Promise.all([
    deleteDoc(doc(db, 'users', uid, 'friends', friendUid)),
    deleteDoc(doc(db, 'users', friendUid, 'friends', uid))
  ]);
}