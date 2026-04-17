import type { PuzzleData } from "@/types";
import { PuzzleEngine } from "@/components/puzzle/PuzzleEngine";
import { useEffect, useState } from "react";

type PuzzleCardProps = {
  puzzle: PuzzleData | null;
  loading: boolean;
  error: string;
  onRefresh: () => Promise<void>;
  onMarkSolved: (puzzleId: string) => Promise<void>;
};

export function PuzzleCard({
  puzzle,
  loading,
  error,
  onRefresh,
  onMarkSolved
}: PuzzleCardProps) {
  const [solvedState, setSolvedState] = useState(false);

  useEffect(() => {
    setSolvedState(false);
  }, [puzzle?.id]);

  const handleSolved = async () => {
    if (!puzzle || solvedState) {
      return;
    }

    setSolvedState(true);
    await onMarkSolved(puzzle.id);
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
              <strong>{puzzle.rating ?? "Unknown"}</strong>
            </div>
            <div className="stat-card">
              <span>Puzzle</span>
              <strong>#{puzzle.id}</strong>
            </div>
            <div className="stat-card">
              <span>Solution line</span>
              <strong>{puzzle.solution.length} plies</strong>
            </div>
          </div>

          <div className="theme-row">
            {puzzle.themes.slice(0, 5).map((theme) => (
              <span key={theme} className="theme-pill">
                {theme}
              </span>
            ))}
            {puzzle.perfName ? <span className="theme-pill">{puzzle.perfName}</span> : null}
          </div>

          <p className="muted-copy" style={{ marginBottom: "1rem" }}>
            All gameplay stays inside this board. Your move is checked with `chess.js`, then the puzzle line answers automatically.
          </p>
          
          <PuzzleEngine puzzle={puzzle} onSolved={handleSolved} />

          {solvedState ? (
            <p className="inline-success">Puzzle completion saved. Load another puzzle to keep the streak alive.</p>
          ) : null}
        </div>
      ) : (
        <p className="muted-copy">Load the next puzzle to fill the current level task board.</p>
      )}
    </section>
  );
}
