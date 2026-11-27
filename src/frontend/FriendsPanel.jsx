import { useState, useEffect, useCallback } from 'react';
import {
  findUserByUsername,
  sendFriendRequest,
  getIncomingRequests,
  acceptFriendRequest,
  declineFriendRequest,
  getFriendsList,
  removeFriend
} from '../services/friendsService';
import './FriendsPanel.css';

export default function FriendsPanel({ currentUser }) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetUsername, setTargetUsername] = useState('');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  const refreshSocialData = useCallback(async () => {
    if (!currentUser?.uid) return;
    try {
      const [reqs, friendsList] = await Promise.all([
        getIncomingRequests(currentUser.uid),
        getFriendsList(currentUser.uid)
      ]);
      setIncomingRequests(reqs);
      setFriends(friendsList);
    } catch (err) {
      console.error('Failed to load friends data:', err);
      setFeedback({ type: 'error', text: err.message || 'Could not load friends.' });
    }
  }, [currentUser?.uid]);

  useEffect(() => {
    if (currentUser?.uid) {
      refreshSocialData();
    }
  }, [currentUser?.uid, isOpen, refreshSocialData]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', text: '' });

    const cleanName = targetUsername.trim();
    if (!cleanName) return;

    if (cleanName.toLowerCase() === currentUser?.username?.toLowerCase()) {
      setFeedback({ type: 'error', text: "You can't add yourself!" });
      return;
    }

    if (friends.some((f) => f.username?.toLowerCase() === cleanName.toLowerCase())) {
      setFeedback({ type: 'error', text: `${cleanName} is already on your friends list.` });
      return;
    }

    setLoading(true);
    try {
      const targetUser = await findUserByUsername(cleanName);
      if (!targetUser) {
        setFeedback({ type: 'error', text: `Player "${cleanName}" not found.` });
        setLoading(false);
        return;
      }

      await sendFriendRequest(
        { uid: currentUser.uid, username: currentUser.username },
        { uid: targetUser.uid, username: targetUser.username }
      );

      setTargetUsername('');
      setFeedback({ type: 'success', text: `Friend request sent to ${targetUser.username}!` });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Failed to send request.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setFeedback({ type: '', text: '' });
    try {
      await acceptFriendRequest(requestId);
      setFeedback({ type: 'success', text: 'Friend request accepted!' });
      await refreshSocialData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Could not accept request.' });
    }
  };

  const handleDecline = async (requestId) => {
    setFeedback({ type: '', text: '' });
    try {
      await declineFriendRequest(requestId);
      setFeedback({ type: 'success', text: 'Friend request declined.' });
      await refreshSocialData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Could not decline request.' });
    }
  };

  const handleRemoveFriend = async (friendUid, friendName) => {
    try {
      await removeFriend(currentUser.uid, friendUid);
      setFeedback({ type: 'success', text: `Removed ${friendName}.` });
      await refreshSocialData();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message || 'Could not remove friend.' });
    }
  };

  if (!currentUser) return null;

  return (
    <>
      <button
        type="button"
        className="friends-toggle-btn"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        Friends ({friends.length})
        {incomingRequests.length > 0 && (
          <span className="friends-badge">+{incomingRequests.length}</span>
        )}
      </button>

      {isOpen && (
        <div className="friends-panel">
          <div className="friends-header">
            <h3>Gator Friends</h3>
            <button
              type="button"
              className="friends-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close friends panel"
            >
              ✕
            </button>
          </div>

        <form className="friends-add-form" onSubmit={handleSendRequest}>
            <input
              type="text"
              className="friends-add-input"
              placeholder="Enter Gator username..."
              value={targetUsername}
              onChange={(e) => setTargetUsername(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !targetUsername.trim()}>
              {loading ? '...' : 'Add'}
            </button>
          </form>

          {feedback.text && (
            <div className={`friends-status-msg ${feedback.type}`}>
              {feedback.text}
            </div>
          )}

          <div className="friends-section">
            <h4>Incoming Requests ({incomingRequests.length})</h4>
            {incomingRequests.length === 0 ? (
              <p className="friends-empty">No pending requests.</p>
            ) : (
              <ul className="friends-list">
                {incomingRequests.map((req) => (
                  <li key={req.id} className="friends-item">
                    <span>{req.fromUsername}</span>
                    <div className="friends-actions">
                      <button
                        type="button"
                        className="btn-accept"
                        onClick={() => handleAccept(req.id)}
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        className="btn-decline"
                        onClick={() => handleDecline(req.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="friends-section">
            <h4>My Friends ({friends.length})</h4>
            {friends.length === 0 ? (
              <p className="friends-empty">No friends added yet.</p>
            ) : (
              <ul className="friends-list">
                {friends.map((friend) => (
                  <li key={friend.id} className="friends-item">
                    <span>{friend.username}</span>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => handleRemoveFriend(friend.friendUid || friend.id, friend.username)}
                      title="Remove friend"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}