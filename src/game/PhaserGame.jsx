import { useEffect, useRef } from "react";
import StartGame from "./main";
export default function PhaserGame() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    gameRef.current = StartGame(containerRef.current);
    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);
  return (
    <div
      ref={containerRef}
      id="game-container"
      className="cg-game-canvas"
    />
  );
}
