import { normalizePuzzleResponse } from "@/lib/chess";
import type { ApiErrorResponse, PuzzleData } from "@/types";

import { fetchNextPuzzle } from "../lichess";

function getErrorMessage(payload: unknown, fallback: string) {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as ApiErrorResponse).error === "string"
  ) {
    return (payload as ApiErrorResponse).error;
  }

  return fallback;
}

export async function getNextPuzzle(): Promise<PuzzleData> {
  const rawPuzzle = await fetchNextPuzzle();
  return normalizePuzzleResponse(rawPuzzle);
}

export async function requestNextPuzzle(): Promise<PuzzleData> {
  const response = await fetch("/api/puzzle/next");
  const payload = (await response.json()) as PuzzleData | ApiErrorResponse;

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Could not fetch puzzle."));
  }

  return payload as PuzzleData;
}

export async function persistCompletedPuzzle(puzzleId: string, token: string) {
  const response = await fetch("/api/puzzle/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      puzzleId
    })
  });

  const payload = (await response.json()) as Record<string, unknown> | ApiErrorResponse;

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Could not update puzzle progress."));
  }

  return payload;
}
