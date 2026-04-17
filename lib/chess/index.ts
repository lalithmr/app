import { Chess } from "chess.js";

import type { LichessPuzzleResponse, PuzzleData } from "@/types";

type MoveDescriptor = {
  from: string;
  to: string;
  promotion?: string;
};

type ValidatePuzzleMoveArgs = {
  fen: string;
  expectedUci: string;
  sourceSquare: string;
  targetSquare: string;
  piece: string;
};

export type PuzzleMoveValidation =
  | {
      status: "correct";
      expectedSan: string;
      attemptedSan: string;
      nextFen: string;
    }
  | {
      status: "illegal" | "incorrect";
      expectedSan: string;
      attemptedSan?: string;
    };

function parseUciMove(uci: string): MoveDescriptor {
  const normalized = uci.trim();

  if (normalized.length < 4) {
    throw new Error("Invalid UCI move.");
  }

  return {
    from: normalized.slice(0, 2),
    to: normalized.slice(2, 4),
    promotion: normalized.length > 4 ? normalized.slice(4, 5) : undefined
  };
}

function getReplayBaseGame(pgn: string) {
  const sourceGame = new Chess();
  sourceGame.loadPgn(pgn);

  const headers = sourceGame.getHeaders();
  const baseGame = headers.FEN ? new Chess(headers.FEN) : new Chess();

  return {
    baseGame,
    history: sourceGame.history()
  };
}

export function getBoardOrientation(fen: string): "white" | "black" {
  return fen.split(" ")[1] === "b" ? "black" : "white";
}

export function buildPuzzleInitialFen(payload: LichessPuzzleResponse): string {
  const directFen = payload.puzzle?.fen ?? payload.game?.fen ?? payload.fen;

  if (directFen) {
    return new Chess(directFen).fen();
  }

  if (!payload.game?.pgn) {
    throw new Error("Puzzle response did not include a starting position.");
  }

  const { baseGame, history } = getReplayBaseGame(payload.game.pgn);
  const initialPly = Math.max(payload.puzzle?.initialPly ?? history.length, 0);
  const replayLength = Math.min(initialPly, history.length);

  for (let moveIndex = 0; moveIndex < replayLength; moveIndex += 1) {
    baseGame.move(history[moveIndex]);
  }

  return baseGame.fen();
}

export function normalizePuzzleResponse(payload: LichessPuzzleResponse): PuzzleData {
  const puzzleId = payload.puzzle?.id?.trim();
  const solution = payload.puzzle?.solution?.filter(Boolean) ?? [];

  if (!puzzleId || solution.length === 0) {
    throw new Error("Puzzle response was missing required data.");
  }

  const initialFen = buildPuzzleInitialFen(payload);

  return {
    id: puzzleId,
    rating: payload.puzzle?.rating,
    plays: payload.puzzle?.plays,
    themes: payload.puzzle?.themes ?? [],
    solution,
    initialFen,
    orientation: getBoardOrientation(initialFen),
    sourceGameId: payload.game?.id,
    perfName: payload.game?.perf?.name,
    clock: payload.game?.clock
  };
}

export function getExpectedSan(fen: string, uci: string) {
  const chess = new Chess(fen);
  const move = chess.move(parseUciMove(uci));

  if (!move) {
    throw new Error("Expected puzzle move is illegal from the current position.");
  }

  return move.san;
}

function getPromotionPiece(piece: string, targetSquare: string, expectedUci: string) {
  const expectedPromotion = expectedUci.trim().length > 4
    ? expectedUci.trim().slice(4, 5)
    : undefined;

  if (expectedPromotion) {
    return expectedPromotion;
  }

  const isPawn = piece.toLowerCase().endsWith("p");
  const promotionRank = targetSquare[1];

  if (isPawn && (promotionRank === "1" || promotionRank === "8")) {
    return "q";
  }

  return undefined;
}

export function validatePuzzleMove({
  fen,
  expectedUci,
  sourceSquare,
  targetSquare,
  piece
}: ValidatePuzzleMoveArgs): PuzzleMoveValidation {
  try {
    const expectedSan = getExpectedSan(fen, expectedUci);
    const chess = new Chess(fen);
    const move = chess.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: getPromotionPiece(piece, targetSquare, expectedUci)
    });

    if (!move) {
      return {
        status: "illegal",
        expectedSan
      };
    }

    if (move.san !== expectedSan) {
      return {
        status: "incorrect",
        attemptedSan: move.san,
        expectedSan
      };
    }

    return {
      status: "correct",
      attemptedSan: move.san,
      expectedSan,
      nextFen: chess.fen()
    };
  } catch {
    return {
      status: "illegal",
      expectedSan: ""
    };
  }
}

export function applySolutionMove(fen: string, uci: string) {
  const chess = new Chess(fen);
  const move = chess.move(parseUciMove(uci));

  if (!move) {
    throw new Error("Could not apply the next puzzle move.");
  }

  return {
    fen: chess.fen(),
    san: move.san
  };
}
