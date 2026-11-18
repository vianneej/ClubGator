import { useLayoutEffect, useRef, useState } from "react";
import { auth } from "../firebase";
import {
    MAX_CHAT_LENGTH,
    joinChatRoom,
    sendChatMessage,
    subscribeToChatMessages,
    subscribeToChatRoom,
} from "../services/chatService";

export default function RoomChat({ roomId, uid, onFocus }) {
    const [attempt, setAttempt] = useState(0);

    return (
        <ChatPanel
            key={attempt}
            roomId={roomId}
            uid={uid}
            onFocus={onFocus}
            onRetry={() => setAttempt((current) => current + 1)}
        />
    );
}

function ChatPanel({ roomId, uid, onFocus, onRetry }) {
    const [messages, setMessages] = useState(null);
    const [roomError, setRoomError] = useState("");
    const [sendError, setSendError] = useState("");
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const lifetime = useRef(null);
    const sendPending = useRef(false);
    const history = useRef(null);

    useLayoutEffect(() => {
        const controller = new AbortController();
        const { signal } = controller;
        lifetime.current = signal;
        let stopMessages;
        let stopRoom;
        const isCurrent = () => !signal.aborted && auth.currentUser?.uid === uid;

        function failRoom(message) {
            stopMessages?.();
            stopMessages = undefined;
            setMessages(null);
            setRoomError(message);
        }

        const stopAuth = auth.onAuthStateChanged((user) => {
            if (!signal.aborted && user?.uid !== uid) {
                controller.abort();
                stopRoom?.();
                failRoom("Log in to use chat.");
            }
        });

        async function connect() {
            try {
                await joinChatRoom(roomId, uid, signal);
                if (!isCurrent()) return;

                stopRoom = subscribeToChatRoom(uid, (currentRoom) => {
                    if (!isCurrent()) return;
                    if (currentRoom !== roomId) {
                        failRoom(currentRoom === undefined
                            ? "Chat is offline."
                            : "Your account switched chat rooms. Rejoin to chat here.");
                        return;
                    }

                    setRoomError("");
                    stopMessages ??= subscribeToChatMessages(
                        roomId,
                        (nextMessages) => {
                            if (isCurrent()) setMessages(nextMessages);
                        },
                        () => {
                            if (isCurrent()) failRoom("Couldn't read messages. Rejoin to try again.");
                        }
                    );
                }, () => {
                    if (isCurrent()) failRoom("Couldn't verify your room. Rejoin to try again.");
                });
            } catch {
                if (isCurrent()) failRoom("Couldn't join this room. Rejoin to try again.");
            }
        }

        void connect();

        return () => {
            controller.abort();
            stopAuth();
            stopRoom?.();
            stopMessages?.();
        };
    }, [roomId, uid]);

    useLayoutEffect(() => {
        const list = history.current;
        if (list) list.scrollTop = list.scrollHeight;
    }, [messages]);

    async function handleSend(event) {
        event.preventDefault();
        const signal = lifetime.current;
        if (!signal || signal.aborted || sendPending.current || !messages || !text.trim()) return;

        sendPending.current = true;
        setSending(true);
        setSendError("");
        try {
            await sendChatMessage(roomId, text, uid, signal);
            if (!signal.aborted && auth.currentUser?.uid === uid) setText("");
        } catch {
            if (!signal.aborted && auth.currentUser?.uid === uid) {
                setSendError("Message couldn't be sent. Try again when chat is connected.");
            }
        } finally {
            if (!signal.aborted && auth.currentUser?.uid === uid) {
                sendPending.current = false;
                setSending(false);
            }
        }
    }

    const roomName = roomId === "campus" ? "Campus" : roomId.slice("location:".length).replaceAll("-", " ");

    return (
        <section
            className="cg-room-chat"
            aria-label="Location chat"
            onFocus={onFocus}
            onKeyDown={(event) => event.stopPropagation()}
            onKeyUp={(event) => event.stopPropagation()}
        >
            <h2>{roomName} chat</h2>
            {roomError ? (
                <p role="alert">{roomError} <button onClick={onRetry}>Rejoin</button></p>
            ) : messages ? (
                <div ref={history} className="cg-chat-history" aria-live="polite" tabIndex={0}>
                    {messages.length === 0 ? (
                        <p>No messages yet.</p>
                    ) : (
                        <ul>
                            {messages.map((message) => (
                                <li key={message.id}>
                                    <strong>{message.senderUsername}</strong> {message.text}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            ) : (
                <p role="status">Connecting to chat…</p>
            )}
            <form onSubmit={handleSend}>
                <input
                    aria-label="Chat message"
                    aria-describedby="chat-character-count"
                    placeholder="Type a message"
                    value={text}
                    maxLength={MAX_CHAT_LENGTH}
                    onChange={(event) => setText(event.target.value)}
                    disabled={!messages || sending}
                />
                <button type="submit" disabled={!messages || !text.trim() || sending}>
                    {sending ? "Sending…" : "Send"}
                </button>
            </form>
            <p id="chat-character-count">{text.length} / {MAX_CHAT_LENGTH} characters</p>
            {sendError && <p role="alert">{sendError}</p>}
        </section>
    );
}
