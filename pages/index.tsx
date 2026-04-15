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


// ✅ GLOBAL SAFE ERROR HANDLER
function getErrorMessage(payload: unknown, fallback: string): string {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as any).error === "string"
  ) {
    return (payload as any).error;
  }
  return fallback;
}

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
    () =>
      getAllLevels().find((level) => level.id === selectedLevelId) ??
      currentLevel,
    [currentLevel, selectedLevelId]
  );

  const selectedTaskState = selectedLevel
    ? profile?.taskProgress?.[
    getLevelId(selectedLevel.league, selectedLevel.level)
    ]
    : undefined;

  // 🔥 LOAD PUZZLE
  const loadPuzzle = useCallback(async () => {
    setPuzzleLoading(true);
    setPuzzleError("");

    try {
      const response = await fetch("/api/puzzle/next");
      const payload = (await response.json()) as
        | PuzzleData
        | ApiErrorResponse;

      if (!response.ok) {
        throw new Error(getErrorMessage(payload, "Could not fetch puzzle."));
      }

      setPuzzle(payload as PuzzleData);
    } catch (err) {
      setPuzzleError(
        err instanceof Error ? err.message : "Could not fetch puzzle."
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

  // 🔥 SAVE LICHESS USERNAME
  async function handleSaveLichessUsername() {
    if (!user) return;

    setSavingLichess(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        `/api/validate-lichess?username=${encodeURIComponent(
          lichessUsername.trim()
        )}`
      );

      const payload = (await response.json()) as
        | Record<string, unknown>
        | ApiErrorResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(payload, "Invalid Lichess username.")
        );
      }

      await updateUserProfile(user.uid, {
        lichessUsername: lichessUsername.trim(),
      });

      setStatusMessage("Lichess profile linked successfully.");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Failed to validate the Lichess username."
      );
    } finally {
      setSavingLichess(false);
    }
  }

  // 🔥 SYNC GAME
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
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = (await response.json()) as
        | Record<string, unknown>
        | ApiErrorResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(payload, "Could not sync the latest game.")
        );
      }

      if (
        typeof payload === "object" &&
        payload !== null &&
        "updated" in payload &&
        (payload as any).updated === false
      ) {
        setStatusMessage(
          "Latest game was already processed. No duplicate reward applied."
        );
        return;
      }

      const didWin =
        typeof payload === "object" &&
        payload !== null &&
        "didWin" in payload &&
        (payload as any).didWin === true;

      setStatusMessage(
        didWin
          ? "Latest game processed as a win. Eternix progression updated."
          : "Latest game processed, but it was not a win. Streak reset."
      );
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "Could not sync the latest game."
      );
    } finally {
      setSyncingGame(false);
    }
  }

  // 🔥 MARK PUZZLE SOLVED (FIXED ERROR HERE)
  async function handleMarkPuzzleSolved() {
    if (!user || !currentLevel) return;

    setStatusMessage("");
    setErrorMessage("");

    try {
      const token = await user.getIdToken();

      const response = await fetch("/api/puzzle/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          puzzleId: puzzle?.puzzle?.id,
        }),
      });

      const payload = (await response.json()) as
        | Record<string, unknown>
        | ApiErrorResponse;

      if (!response.ok) {
        throw new Error(
          getErrorMessage(payload, "Could not mark the puzzle solved.")
        );
      }

      setStatusMessage("Puzzle task marked complete for the active level.");
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
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
              <h2>Connect and progress</h2>

              <input
                value={lichessUsername}
                onChange={(e) => setLichessUsername(e.target.value)}
                placeholder="Enter Lichess username"
              />

              <button onClick={handleSaveLichessUsername}>
                Save Username
              </button>

              <button onClick={handleSyncLatestGame}>
                Sync Game
              </button>

              {statusMessage && <p>{statusMessage}</p>}
              {errorMessage && <p>{errorMessage}</p>}
            </section>

            <ProfileCard profile={profile} />
          </div>

          <TaskPanel level={selectedLevel ?? currentLevel} taskState={selectedTaskState} />

          <PuzzleCard
            puzzle={puzzle}
            loading={puzzleLoading}
            error={puzzleError}
            onRefresh={loadPuzzle}
            onMarkSolved={handleMarkPuzzleSolved}
          />

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