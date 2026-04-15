import type { PuzzleData } from "@/types";

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
  const puzzleLink = puzzle?.puzzle?.id
    ? `https://lichess.org/training/${puzzle.puzzle.id}`
    : "https://lichess.org/training";

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="muted-label">Puzzle relay</p>
          <h2>Daily tactical challenge</h2>
        </div>
        <button type="button" className="ghost-button" onClick={onRefresh} disabled={loading}>
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

          <p className="muted-copy">
            Open the puzzle on Lichess, solve it there, then mark it complete to keep your
            Eternix task board in sync.
          </p>

          <div className="inline-actions">
            <a
              href={puzzleLink}
              target="_blank"
              rel="noreferrer"
              className="primary-button link-button"
            >
              Open puzzle
            </a>
            <button type="button" className="secondary-button" onClick={onMarkSolved}>
              Mark solved
            </button>
          </div>
        </div>
      ) : (
        <p className="muted-copy">Load the next puzzle to fill the current level task board.</p>
      )}
    </section>
  );
}
