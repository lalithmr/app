import { fetchNextPuzzle } from "../lichess";
import type { PuzzleData } from "@/types";

export async function getDailyPuzzle(): Promise<PuzzleData> {
  return fetchNextPuzzle();
}

/**
 * Validates a submitted answer array against the puzzle solution.
 * Not strictly needed since client validates, but useful for backend checks.
 */
export function validatePuzzleSolution(puzzle: PuzzleData, userMoves: string[]): boolean {
  if (!puzzle?.puzzle?.solution) return false;
  
  const expected = puzzle.puzzle.solution;
  if (userMoves.length !== expected.length) return false;
  
  for (let i = 0; i < expected.length; i++) {
    if (userMoves[i] !== expected[i]) {
      return false;
    }
  }
  return true;
}
