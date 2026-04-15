import type { PuzzleData } from "@/types";
import { PuzzleEngine } from "@/components/puzzle/PuzzleEngine";
import { useState } from "react";

type PuzzleCardProps = {
  puzzle: PuzzleData | null;
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
  onMarkSolved: () => Promise<void>;
};

export function PuzzleCard({
  puzzle,
  loading,
  error,
  onRefresh,
  onMarkSolved
}: PuzzleCardProps) {
  const [solvedState, setSolvedState] = useState(false);

  const handleSolved = async () => {
    setSolvedState(true);
    await onMarkSolved();
  };

  const handleRefresh = async () => {
    setSolvedState(false);
    await onRefresh();
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="muted-label">Puzzle relay</p>
          <h2>Daily tactical challenge</h2>
        </div>
        <button type="button" className="ghost-button" onClick={handleRefresh} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh puzzle"}
        </button>
      </div>

      {error ? <p className="inline-error">{error}</p> : null}

      {puzzle ? (
        <div className="puzzle-card">
          <div className="stats-grid">
            <div className="stat-card">
              <span>Rating</span>
              <strong>{puzzle.puzzle?.rating ?? "Unknown"}</strong>
            </div>
            <div className="stat-card">
              <span>Themes</span>
              <strong>{puzzle.puzzle?.themes?.slice(0, 3).join(", ") || "Mixed"}</strong>
            </div>
            <div className="stat-card">
              <span>Solution length</span>
              <strong>{puzzle.puzzle?.solution?.length ?? 0} moves</strong>
            </div>
          </div>

          <p className="muted-copy" style={{ marginBottom: "1rem" }}>
            Solve the puzzle directly on the board below to complete your task.
          </p>
          
          <PuzzleEngine puzzle={puzzle} onSolved={handleSolved} />
        </div>
      ) : (
        <p className="muted-copy">Load the next puzzle to fill the current level task board.</p>
      )}
    </section>
  );
}
