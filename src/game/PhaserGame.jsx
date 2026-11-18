import { useEffect, useRef, useState } from "react";
import RoomChat from "../frontend/RoomChat";
import StartGame from "./main";

export default function PhaserGame({ uid, children }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [roomId, setRoomId] = useState(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const game = StartGame(containerRef.current);
    gameRef.current = game;
    game.events.on("chat-room-change", setRoomId);

    return () => {
      game.events.off("chat-room-change", setRoomId);
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  function resetGameKeys() {
    for (const scene of gameRef.current?.scene.getScenes(true) ?? []) {
      scene.input.keyboard?.resetKeys();
    }
  }

  return (
    <>
      <div ref={containerRef} id="game-container" className="cg-game-canvas" />
      <aside className="cg-game-sidebar" aria-label="Player and chat">
        {children}
        {roomId && (
          <RoomChat key={roomId} roomId={roomId} uid={uid} onFocus={resetGameKeys} />
        )}
      </aside>
    </>
  );
}
