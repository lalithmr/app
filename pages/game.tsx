import { AppShell } from "@/components/layout/app-shell";
import { GameBoard } from "@/components/game/GameBoard";

export default function GamePage() {
  return (
    <AppShell 
      title="Live Arena" 
      subtitle="Play against the Stockfish Engine locally."
    >
      <GameBoard />
    </AppShell>
  );
}
