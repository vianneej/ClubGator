# Friends & Friend Requests Firestore Model

# `friendRequests` Collection
- **Document ID:** `${fromUid}_${toUid}` (prevents duplicate requests between the same two players)
- **Fields:**
  - `fromUid` (string): Sender's Firebase Auth UID
  - `fromUsername` (string): Sender's display username
  - `toUid` (string): Recipient's Firebase Auth UID
  - `toUsername` (string): Recipient's display username
  - `status` (string): `"pending"` | `"accepted"` | `"declined"`
  - `createdAt` (timestamp): `serverTimestamp()`

# User Friends Subcollection: `users/{uid}/friends/{friendUid}`
Storing accepted friendships as a subcollection under each user allows single-query friend list reads and clean security rules.
- **Document ID:** `friendUid`
- **Fields:**
  - `friendUid` (string): The friend's Firebase Auth UID
  - `username` (string): The friend's display username
  - `addedAt` (timestamp): `serverTimestamp()`