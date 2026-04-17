import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { ChessBoard } from "@/components/chess/chess-board";
import { applySolutionMove, validatePuzzleMove, getExpectedSan } from "@/lib/chess";
import type { PuzzleData } from "@/types";

interface PuzzleEngineProps {
  puzzle: PuzzleData | null;
  onSolved: (puzzleId: string) => Promise<void> | void;
}

export function PuzzleEngine({ puzzle, onSolved }: PuzzleEngineProps) {
  const replyTimeoutRef = useRef<number | null>(null);
  const [fen, setFen] = useState("start");
  const [moveIndex, setMoveIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [feedbackTone, setFeedbackTone] = useState<"neutral" | "success" | "error">("neutral");
  const [feedbackTitle, setFeedbackTitle] = useState("Find the best move");
  const [feedbackCopy, setFeedbackCopy] = useState("Your move is validated inside the app against the puzzle line.");
  const [squareStyles, setSquareStyles] = useState<Record<string, CSSProperties>>({});

  const resetPuzzle = useCallback(() => {
    if (!puzzle) {
      return;
    }

    if (replyTimeoutRef.current) {
      window.clearTimeout(replyTimeoutRef.current);
      replyTimeoutRef.current = null;
    }

    setFen(puzzle.initialFen);
    setMoveIndex(0);
    setSolved(false);
    setIsReplying(false);
    setFeedbackTone("neutral");
    setFeedbackTitle("Find the best move");
    setFeedbackCopy("Play the top engine move and the board will answer automatically.");
    setSquareStyles({});
  }, [puzzle]);

  useEffect(() => {
    resetPuzzle();
  }, [resetPuzzle]);

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        window.clearTimeout(replyTimeoutRef.current);
      }
    };
  }, []);

  const handleShowSolution = useCallback(() => {
    if (!puzzle || solved || isReplying) {
      return;
    }

    try {
      const expectedUci = puzzle.solution[moveIndex];
      if (!expectedUci) return;
      const expectedSan = getExpectedSan(fen, expectedUci);
      
      setFeedbackTone("neutral");
      setFeedbackTitle("Solution");
      setFeedbackCopy(`The expected move is ${expectedSan}.`);

      const from = expectedUci.slice(0, 2);
      const to = expectedUci.slice(2, 4);
      setSquareStyles({
        [from]: { backgroundColor: "rgba(255, 255, 0, 0.6)" },
        [to]: { backgroundColor: "rgba(255, 255, 0, 0.6)" }
      });
    } catch (err) {
      console.error(err);
    }
  }, [fen, isReplying, moveIndex, puzzle, solved]);

  const moveProgress = useMemo(() => {
    const totalTurns = Math.max(Math.ceil((puzzle?.solution.length ?? 0) / 2), 1);
    const completedTurns = Math.min(Math.floor(moveIndex / 2), totalTurns);

    return {
      totalTurns,
      completedTurns
    };
  }, [moveIndex, puzzle]);

  const markSolved = useCallback((lastMoveSan?: string) => {
    if (!puzzle || solved) {
      return;
    }

    setSolved(true);
    setIsReplying(false);
    setFeedbackTone("success");
    setFeedbackTitle("Puzzle completed");
    setFeedbackCopy(
      lastMoveSan
        ? `You found ${lastMoveSan}! The solve has been recorded in your Firebase progress.`
        : "The solve has been recorded in your Firebase progress."
    );
    void onSolved(puzzle.id);
  }, [onSolved, puzzle, solved]);

  const handlePieceDrop = useCallback(
    ({
      piece,
      sourceSquare,
      targetSquare
    }: {
      piece: string;
      sourceSquare: string;
      targetSquare: string;
    }) => {
      if (!puzzle || solved || isReplying) {
        return false;
      }

      const expectedMove = puzzle.solution[moveIndex];

      if (!expectedMove) {
        return false;
      }

      const validation = validatePuzzleMove({
        fen,
        expectedUci: expectedMove,
        sourceSquare,
        targetSquare,
        piece
      });

      if (validation.status !== "correct") {
        setFeedbackTone("error");
        setFeedbackTitle("Try again");
        setFeedbackCopy(
          validation.status === "illegal"
            ? "That move is not legal in this position."
            : `Incorrect. The correct move was ${validation.expectedSan}.`
        );
        setSquareStyles({
          [sourceSquare]: { backgroundColor: "rgba(255, 135, 135, 0.55)" },
          [targetSquare]: { backgroundColor: "rgba(255, 135, 135, 0.55)" }
        });
        return false;
      }

      const nextMoveIndex = moveIndex + 1;

      setFen(validation.nextFen);
      setMoveIndex(nextMoveIndex);
      setFeedbackTone("success");
      setFeedbackTitle("Correct move");
      setFeedbackCopy(`You found ${validation.attemptedSan}.`);
      setSquareStyles({
        [sourceSquare]: { backgroundColor: "rgba(116, 226, 157, 0.55)" },
        [targetSquare]: { backgroundColor: "rgba(116, 226, 157, 0.55)" }
      });

      if (nextMoveIndex >= puzzle.solution.length) {
        markSolved(validation.attemptedSan);
        return true;
      }

      setIsReplying(true);
      replyTimeoutRef.current = window.setTimeout(() => {
        const opponentMove = puzzle.solution[nextMoveIndex];
        const reply = applySolutionMove(validation.nextFen, opponentMove);
        const upcomingMoveIndex = nextMoveIndex + 1;

        setFen(reply.fen);
        setMoveIndex(upcomingMoveIndex);
        setIsReplying(false);
        setSquareStyles({});

        if (upcomingMoveIndex >= puzzle.solution.length) {
          markSolved();
          return;
        }

        setFeedbackTone("neutral");
        setFeedbackTitle("Your turn");
        setFeedbackCopy(`Opponent answered with ${reply.san}. Find the next move.`);
      }, 550);

      return true;
    },
    [fen, isReplying, markSolved, moveIndex, puzzle, solved]
  );

  if (!puzzle) return null;

  return (
    <div className="puzzle-engine">
      <ChessBoard
        position={fen}
        orientation={puzzle.orientation}
        allowDragging={!solved && !isReplying}
        squareStyles={squareStyles}
        onPieceDrop={handlePieceDrop}
      />

      <div className={`puzzle-feedback ${feedbackTone}`}>
        <strong>{feedbackTitle}</strong>
        <span>{isReplying ? "Opponent is replying..." : feedbackCopy}</span>
      </div>

      <div className="puzzle-status-grid">
        <div className="stat-card">
          <span>Line progress</span>
          <strong>
            {moveProgress.completedTurns}/{moveProgress.totalTurns}
          </strong>
        </div>
        <div className="stat-card">
          <span>Board side</span>
          <strong>{puzzle.orientation === "white" ? "White to move" : "Black to move"}</strong>
        </div>
        <div className="stat-card">
          <span>State</span>
          <strong>{solved ? "Solved" : isReplying ? "Replying" : "In progress"}</strong>
        </div>
      </div>

      <div className="puzzle-action-row">
        <button type="button" className="secondary-button" onClick={resetPuzzle}>
          Reset position
        </button>
        <button 
          type="button" 
          className="secondary-button" 
          onClick={handleShowSolution}
          disabled={solved || isReplying}
        >
          Show solution
        </button>
        <span className="muted-copy">FEN-loaded board with in-app move validation.</span>
      </div>
    </div>
  );
}
