import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";

import { PuzzleCard } from "@/components/dashboard/puzzle-card";
import { AppShell } from "@/components/layout/app-shell";
import { ProfileCard } from "@/components/profile/profile-card";
import { useAuth } from "@/context/auth-context";
import { persistCompletedPuzzle, requestNextPuzzle } from "@/services/puzzle";
import type { PuzzleData } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [puzzleLoading, setPuzzleLoading] = useState(false);
  const [puzzleError, setPuzzleError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      void router.replace("/login");
    }
  }, [loading, router, user]);

  const loadPuzzle = useCallback(async () => {
    setPuzzleLoading(true);
    setPuzzleError("");

    try {
      const nextPuzzle = await requestNextPuzzle();
      setPuzzle(nextPuzzle);
    } catch (error) {
      setPuzzleError(
        error instanceof Error ? error.message : "Could not fetch puzzle."
      );
    } finally {
      setPuzzleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void loadPuzzle();
    }
  }, [loadPuzzle, user]);

  const handleMarkPuzzleSolved = useCallback(
    async (puzzleId: string) => {
      if (!user) {
        return;
      }

      setStatusMessage("");
      setErrorMessage("");

      try {
        const token = await user.getIdToken();
        await persistCompletedPuzzle(puzzleId, token);
        setStatusMessage("Puzzle completed and saved to Firebase progress.");
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Could not save puzzle progress."
        );
      }
    },
    [user]
  );

  return (
    <AppShell
      title="Self-contained chess tactics"
      subtitle="Fetch Lichess puzzle data, render the board locally, and solve every line inside your own app UI."
    >
      {loading || !profile ? (
        <div className="panel">
          <p className="muted-copy">Loading your tactics workspace...</p>
        </div>
      ) : (
        <>
          <div className="content-grid">
            <ProfileCard profile={profile} />

            <section className="panel control-panel">
              <div>
                <p className="muted-label">Puzzle mode</p>
                <h2>In-app gameplay only</h2>
                <p className="muted-copy">
                  Drag pieces on the board, validate moves with `chess.js`, and
                  auto-play the puzzle response without leaving the app.
                </p>
              </div>

              <div className="pill-row">
                <span className="status-pill">No redirects</span>
                <span className="status-pill">FEN board state</span>
                <span className="status-pill">SAN validation</span>
              </div>

              <div className="status-stack">
                {statusMessage ? (
                  <div className="inline-success">{statusMessage}</div>
                ) : null}
                {errorMessage ? (
                  <div className="inline-error">{errorMessage}</div>
                ) : null}
              </div>
            </section>
          </div>

          <PuzzleCard
            puzzle={puzzle}
            loading={puzzleLoading}
            error={puzzleError}
            onRefresh={loadPuzzle}
            onMarkSolved={handleMarkPuzzleSolved}
          />
        </>
      )}
    </AppShell>
  );
}
