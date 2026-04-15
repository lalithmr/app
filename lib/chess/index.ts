import { Chess } from "chess.js";
import type { PuzzleData } from "@/types";

export function loadPuzzleFEN(puzzleData: PuzzleData): string | null {
  if (!puzzleData?.game?.pgn) return null;
  try {
    const chess = new Chess();
    chess.loadPgn(puzzleData.game.pgn);
    return chess.fen();
  } catch (error) {
    console.error("Error loading PGN", error);
    return null;
  }
}

export function validateMove(fen: string, moveTarget: string, expectedUci: string): { isValid: boolean; newFen: string | null } {
  try {
    const chess = new Chess(fen);
    // expectedUci is something like "f6f1" or "e2d2"
    // To move UCI in chess.js v1+, we can pass { from: "f6", to: "f1", promotion: "q" }
    const from = moveTarget.substring(0, 2);
    const to = moveTarget.substring(2, 4);
    const promotion = moveTarget.length === 5 ? moveTarget.substring(4, 5) : undefined;
    
    // Check if expected move matches
    if (moveTarget !== expectedUci) {
      return { isValid: false, newFen: null };
    }
    
    const move = chess.move({ from, to, promotion });
    if (move) {
      return { isValid: true, newFen: chess.fen() };
    }
    return { isValid: false, newFen: null };
  } catch (error) {
    return { isValid: false, newFen: null };
  }
}

export function playOpponentMove(fen: string, uci: string): { fen: string | null, moveValid: boolean } {
  try {
    const chess = new Chess(fen);
    const from = uci.substring(0, 2);
    const to = uci.substring(2, 4);
    const promotion = uci.length === 5 ? uci.substring(4, 5) : undefined;
    
    const move = chess.move({ from, to, promotion });
    if (move) {
      return { fen: chess.fen(), moveValid: true };
    }
    return { fen: null, moveValid: false };
  } catch (err) {
    return { fen: null, moveValid: false };
  }
}
