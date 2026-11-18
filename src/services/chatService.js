import {
    addDoc,
    collection,
    doc,
    getDoc,
    limit,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";

export const MAX_CHAT_LENGTH = 300;

async function requirePlayer(expectedUid) {
    await auth.authStateReady();

    const user = auth.currentUser;

    if (!user || (expectedUid !== undefined && user.uid !== expectedUid)) {
        throw new Error("Log in to use chat.");
    }

    return user;
}

function checkRoomId(roomId) {
    if (typeof roomId !== "string" ||
        (roomId !== "campus" && !/^location:[^/]+$/u.test(roomId))) {
        throw new Error("Invalid chat room.");
    }
}

export async function joinChatRoom(roomId, expectedUid, signal) {
    checkRoomId(roomId);

    const user = await requirePlayer(expectedUid);

    signal?.throwIfAborted();
    await setDoc(doc(db, "chatSessions", user.uid), {
        roomId,
        updatedAt: serverTimestamp(),
    });
}

export async function sendChatMessage(roomId, text, expectedUid, signal) {
    checkRoomId(roomId);

    const user = await requirePlayer(expectedUid);
    const cleanText = typeof text === "string" ? text.trim() : "";

    if (!cleanText || cleanText.length > MAX_CHAT_LENGTH) {
        throw new Error(`Messages must contain 1–${MAX_CHAT_LENGTH} characters.`);
    }

    const profile = await getDoc(doc(db, "users", user.uid));

    if (!profile.exists() || profile.data().role !== "player") {
        throw new Error("Finish registration before using chat.");
    }

    signal?.throwIfAborted();
    if (auth.currentUser !== user) {
        throw new Error("Your account changed. Log in to use chat.");
    }

    await addDoc(
        collection(db, "chatRooms", roomId, "messages"),
        {
            senderUid: user.uid,
            senderUsername: profile.data().username,
            text: cleanText,
            createdAt: serverTimestamp(),
        }
    );
}

export function subscribeToChatMessages(roomId, onMessages, onError) {
    checkRoomId(roomId);

    const messagesQuery = query(
        collection(db, "chatRooms", roomId, "messages"),
        orderBy("createdAt", "desc"),
        limit(50)
    );

    return onSnapshot(
        messagesQuery,
        { includeMetadataChanges: true },
        (snapshot) => {
            if (snapshot.metadata.fromCache) {
                onMessages(null);
                return;
            }

            const messages = snapshot.docs
                .filter((message) => !message.metadata.hasPendingWrites)
                .map((message) => ({ ...message.data(), id: message.id }));

            onMessages(messages.reverse());
        },
        onError
    );
}

export function subscribeToChatRoom(uid, onRoom, onError) {
    return onSnapshot(
        doc(db, "chatSessions", uid),
        { includeMetadataChanges: true },
        (snapshot) => {
            if (snapshot.metadata.hasPendingWrites) return;
            onRoom(snapshot.metadata.fromCache ? undefined : snapshot.data()?.roomId ?? null);
        },
        onError
    );
}
