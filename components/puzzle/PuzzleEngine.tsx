import { useState, useEffect, useCallback, useMemo } from "react";
import { Chessboard } from "@/components/chessboard";
import { loadPuzzleFEN, validateMove, playOpponentMove } from "@/lib/chess";
import type { PuzzleData } from "@/types";
import { Chess } from "chess.js";

interface PuzzleEngineProps {
  puzzle: PuzzleData | null;
  onSolved: () => void;
}

export function PuzzleEngine({ puzzle, onSolved }: PuzzleEngineProps) {
  const [fen, setFen] = useState<string>("start");
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<"idle" | "playing" | "solved" | "failed">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const orientation = useMemo(() => {
    if (!puzzle?.game?.pgn) return "white";
    try {
      const c = new Chess();
      c.loadPgn(puzzle.game.pgn);
      return c.turn() === "w" ? "white" : "black";
    } catch {
      return "white";
    }
  }, [puzzle]);

  useEffect(() => {
    if (puzzle) {
      const initialFen = loadPuzzleFEN(puzzle);
      if (initialFen) {
        setFen(initialFen);
        setMoveIndex(0);
        setStatus("playing");
        setErrorMsg("");
      }
    }
  }, [puzzle]);

  const onPieceDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
    if (status !== "playing") return false;
    
    let promotion = "";
    if (piece[1]?.toLowerCase() === "p" && (targetSquare[1] === "1" || targetSquare[1] === "8")) {
      promotion = "q"; // auto-promote to queen for now
    }
    const uciMove = `${sourceSquare}${targetSquare}${promotion}`;
    
    const expectedMove = puzzle?.puzzle?.solution?.[moveIndex];
    if (!expectedMove) return false;

    const { isValid, newFen } = validateMove(fen, uciMove, expectedMove);
    
    if (isValid && newFen) {
      setFen(newFen);
      setErrorMsg("Correct move!");
      const nextIndex = moveIndex + 1;
      setMoveIndex(nextIndex);
      
      const solutionLength = puzzle?.puzzle?.solution?.length || 0;
      if (nextIndex >= solutionLength) {
        setStatus("solved");
        setErrorMsg("");
        onSolved();
      } else {
        setTimeout(() => {
          const opponentMove = puzzle!.puzzle!.solution![nextIndex];
          const result = playOpponentMove(newFen, opponentMove);
          if (result.moveValid && result.fen) {
            setFen(result.fen);
            setMoveIndex(nextIndex + 1);
            setErrorMsg("Your turn");
          }
        }, 500);
      }
      return true;
    } else {
      setErrorMsg("Incorrect move! Try again.");
      setStatus("failed");
      return false;
    }
  };

  if (!puzzle) return null;

  return (
    <div style={{ width: "100%", maxWidth: 500, margin: "0 auto", position: "relative" }}>
      <Chessboard 
        position={fen} 
        onPieceDrop={onPieceDrop} 
        boardOrientation={orientation as "white" | "black"}
      />
      
      <div style={{ marginTop: "1rem", textAlign: "center", minHeight: "3rem" }}>
        {status === "solved" ? (
          <h3 style={{ color: "var(--success)" }}>Puzzle Solved!</h3>
        ) : status === "failed" ? (
          <h3 style={{ color: "var(--danger)" }}>{errorMsg}</h3>
        ) : (
           <h3 style={{ color: "var(--teal)" }}>{errorMsg || (moveIndex === 0 ? "Find the best move" : "Keep going!")}</h3>
        )}
      </div>
      
      {status === 'failed' && (
        <button 
          className="secondary-button" 
          style={{ display: 'block', margin: '0 auto' }} 
          onClick={() => {
            const initialFen = loadPuzzleFEN(puzzle);
            setFen(initialFen!);
            setMoveIndex(0);
            setStatus("playing");
            setErrorMsg("");
          }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
