import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";

import { PuzzleCard } from "@/components/dashboard/puzzle-card";
import { TaskPanel } from "@/components/dashboard/task-panel";
import { AppShell } from "@/components/layout/app-shell";
import { LeagueMap } from "@/components/map/league-map";
import { ProfileCard } from "@/components/profile/profile-card";
import { useAuth } from "@/context/auth-context";
import { getActiveLevel, getAllLevels, getLevelId } from "@/lib/level-utils";
import { updateUserProfile } from "@/services/user-service";
import type { ApiErrorResponse, PuzzleData } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [lichessUsername, setLichessUsername] = useState("");
  const [savingLichess, setSavingLichess] = useState(false);
  const [syncingGame, setSyncingGame] = useState(false);
  const [puzzleLoading, setPuzzleLoading] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState("pawn-1");
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [puzzleError, setPuzzleError] = useState("");
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      void router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    if (profile) {
      setLichessUsername(profile.lichessUsername || "");
      setSelectedLevelId(getLevelId(profile.league, profile.level));
    }
  }, [profile]);

  const currentLevel = getActiveLevel(profile);
  const selectedLevel = useMemo(
    () => getAllLevels().find((level) => level.id === selectedLevelId) ?? currentLevel,
    [currentLevel, selectedLevelId]
  );

  const selectedTaskState = selectedLevel
    ? profile?.taskProgress?.[getLevelId(selectedLevel.league, selectedLevel.level)]
    : undefined;

  const loadPuzzle = useCallback(async () => {
    setPuzzleLoading(true);
    setPuzzleError("");

    try {
      const response = await fetch("/api/puzzle/next");
      const payload = (await response.json()) as PuzzleData | ApiErrorResponse;

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Could not fetch puzzle.");
      }

      setPuzzle(payload as PuzzleData);
    } catch (puzzleLoadError) {
      setPuzzleError(
        puzzleLoadError instanceof Error
          ? puzzleLoadError.message
          : "Could not fetch puzzle."
      );
    } finally {
      setPuzzleLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile) {
      void loadPuzzle();
    }
  }, [loadPuzzle, profile]);

  async function handleSaveLichessUsername() {
    if (!user) {
      return;
    }

    setSavingLichess(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/validate-lichess?username=${encodeURIComponent(lichessUsername.trim())}`
      );
      const payload = (await response.json()) as Record<string, unknown> | ApiErrorResponse;

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Invalid Lichess username.");
      }

      await updateUserProfile(user.uid, {
        lichessUsername: lichessUsername.trim()
      });

      setStatusMessage("Lichess profile linked successfully.");
    } catch (validationError) {
      setErrorMessage(
        validationError instanceof Error
          ? validationError.message
          : "Failed to validate the Lichess username."
      );
    } finally {
      setSavingLichess(false);
    }
  }

  async function handleSyncLatestGame() {
    if (!user || !profile?.lichessUsername) {
      setErrorMessage("Link a valid Lichess username before syncing progress.");
      return;
    }

    setSyncingGame(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/progress/sync", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const payload = (await response.json()) as Record<string, unknown> | ApiErrorResponse;

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Could not sync the latest game.");
      }

      if (payload.updated === false) {
        setStatusMessage("Latest game was already processed. No duplicate reward applied.");
        return;
      }

      const didWin = payload.didWin === true;
      setStatusMessage(
        didWin
          ? "Latest game processed as a win. Eternix progression updated."
          : "Latest game processed, but it was not a win. Streak reset."
      );
    } catch (syncError) {
      setErrorMessage(
        syncError instanceof Error ? syncError.message : "Could not sync the latest game."
      );
    } finally {
      setSyncingGame(false);
    }
  }

  async function handleMarkPuzzleSolved() {
    if (!user || !currentLevel) {
      return;
    }

    setStatusMessage("");
    setErrorMessage("");

    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/puzzle/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          puzzleId: puzzle?.puzzle?.id
        })
      });

      const payload = (await response.json()) as Record<string, unknown> | ApiErrorResponse;

      if (!response.ok) {
        throw new Error("error" in payload ? payload.error : "Could not mark the puzzle solved.");
      }

      setStatusMessage("Puzzle task marked complete for the active level.");
    } catch (completionError) {
      setErrorMessage(
        completionError instanceof Error
          ? completionError.message
          : "Could not mark the puzzle solved."
      );
    }
  }

  function handlePlayMatch() {
    window.open("https://lichess.org", "_blank", "noopener,noreferrer");
  }

  return (
    <AppShell
      title="A premium chess progression loop"
      subtitle="Link your Lichess account, climb the map, and turn each real game into an RPG-style advancement system."
    >
      {loading || !profile ? (
        <div className="panel">
          <p className="muted-copy">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="content-grid">
            <section className="panel control-panel">
              <div className="section-heading">
                <div>
                  <p className="muted-label">Mission control</p>
                  <h2>Connect and progress</h2>
                </div>
              </div>

              <label className="field">
                <span>Lichess username</span>
                <input
                  value={lichessUsername}
                  onChange={(event) => setLichessUsername(event.target.value)}
                  placeholder="Enter your Lichess handle"
                />
              </label>

              <div className="inline-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={handleSaveLichessUsername}
                  disabled={savingLichess || !lichessUsername.trim()}
                >
                  {savingLichess ? "Validating..." : "Validate and save"}
                </button>
                <button type="button" className="primary-button" onClick={handlePlayMatch}>
                  Play match
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={handleSyncLatestGame}
                  disabled={syncingGame}
                >
                  {syncingGame ? "Checking latest game..." : "Sync latest game"}
                </button>
              </div>

              {statusMessage ? <p className="inline-success">{statusMessage}</p> : null}
              {errorMessage ? <p className="inline-error">{errorMessage}</p> : null}

              <div className="task-list">
                <div className="task-item">
                  <div className="task-indicator" />
                  <div>
                    <strong>Duplicate-safe game rewards</strong>
                    <p>Only unprocessed games update points, streak, and level progression.</p>
                  </div>
                </div>
                <div className="task-item">
                  <div className="task-indicator" />
                  <div>
                    <strong>Live Lichess validation</strong>
                    <p>Usernames are checked against the public Lichess user API before saving.</p>
                  </div>
                </div>
              </div>

              <Link href="/profile" className="ghost-button link-button">
                Open full profile
              </Link>
            </section>

            <ProfileCard profile={profile} />
          </div>

          <div className="content-grid">
            <TaskPanel level={selectedLevel ?? currentLevel} taskState={selectedTaskState} />
            <PuzzleCard
              puzzle={puzzle}
              loading={puzzleLoading}
              error={puzzleError}
              onRefresh={loadPuzzle}
              onMarkSolved={handleMarkPuzzleSolved}
            />
          </div>

          <LeagueMap
            profile={profile}
            selectedLevelId={selectedLevelId}
            onSelectLevel={setSelectedLevelId}
          />
        </>
      )}
    </AppShell>
  );
}
