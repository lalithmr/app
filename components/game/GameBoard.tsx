import { Chess, Move } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useState, useEffect, useRef, useCallback } from "react";
import { MoveList } from "./MoveList";
import { GameControls } from "./GameControls";
import { BotSelection, BotDetails } from "./BotSelection";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/context/auth-context";

export function GameBoard() {
  const { user } = useAuth();
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [engineReady, setEngineReady] = useState(false);
  const [fen, setFen] = useState(game.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isEngineCalculating, setIsEngineCalculating] = useState(false);
  const [activeBot, setActiveBot] = useState<BotDetails | null>(null);

  const engine = useRef<Worker | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    // Use Next.js static asset loading via public/ to bypass Webpack parsing
    // Emscripten builds like stockfish.js contain 'fs' require() structures which crash Next.js Webpack.
    engine.current = new Worker("/stockfish.js");

    engine.current.onmessage = (e) => {
      const msg = e.data;
      if (msg === "uciok") {
        setEngineReady(true);
      }
      if (typeof msg === 'string' && msg.includes("bestmove")) {
        const moveStr = msg.split(" ")[1];
        if (moveStr) {
          applyEngineMove(moveStr);
        }
      }
    };

    engine.current.postMessage("uci");
    engine.current.postMessage("isready");

    return () => {
      engine.current?.terminate();
    };
  }, []);

  const saveGameToFirebase = async (result: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "games"), {
        userId: user.uid,
        result,
        moves: moveHistory,
        date: Date.now()
      });
    } catch (e) {
      console.error("Failed to save game", e);
    }
  };

  const handleGameOver = useCallback((currentGame: Chess) => {
    let result = "";
    if (currentGame.isCheckmate()) {
      result = currentGame.turn() === "w" ? "You Lose" : "You Win";
    } else if (currentGame.isDraw() || currentGame.isStalemate()) {
      result = "Draw";
    }

    if (result) {
      alert(`Game Over: ${result}`);
      saveGameToFirebase(result);
    }
  }, [user, moveHistory]);

  const makeMove = (move: { from: string; to: string; promotion?: string }) => {
    try {
      const g = new Chess(game.fen());
      const result = g.move(move);

      if (result) {
        setGame(g);
        setFen(g.fen());
        setMoveHistory(prev => [...prev, result.san]);
        handleGameOver(g);
        return true;
      }
    } catch (e) {
      // Invalid move
      return false;
    }
    return false;
  };

  const applyEngineMove = (moveStr: string) => {
    setIsEngineCalculating(false);

    // stockfish return e2e4 style moves
    const from = moveStr.substring(0, 2);
    const to = moveStr.substring(2, 4);
    const promotion = moveStr.length > 4 ? moveStr[4] : undefined;

    makeMove({ from, to, promotion });
  };

  const onDrop = ({ sourceSquare, targetSquare, piece }: any) => {
    if (!targetSquare) return false;

    // Prevent moves if engine is calculating or game is over
    if (isEngineCalculating || game.isGameOver()) return false;

    // Must be user's turn (White)
    if (game.turn() !== 'w' && boardOrientation === 'white') return false;

    const pieceStr = piece.pieceType; // e.g. "wP"
    const isPromotion = (pieceStr === "wP" && targetSquare[1] === "8") || (pieceStr === "bP" && targetSquare[1] === "1");

    const moveObj: { from: string, to: string, promotion?: string } = {
      from: sourceSquare,
      to: targetSquare
    };

    if (isPromotion) {
      moveObj.promotion = "q";
    }

    const moveValid = makeMove(moveObj);

    if (moveValid) {
      // Trigger Engine response
      requestEngineMove(game.fen());
    }

    return moveValid;
  };

  const requestEngineMove = (currentFen: string) => {
    if (!engine.current || !engineReady || !activeBot) return;
    setIsEngineCalculating(true);
    // Configure skill metrics based on chosen bot
    engine.current.postMessage(`setoption name Skill Level value ${activeBot.skillLevel}`);
    engine.current.postMessage(`position fen ${currentFen}`);
    engine.current.postMessage(`go depth ${activeBot.depth}`);
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    setFen(newGame.fen());
    setMoveHistory([]);
    setActiveBot(null); // Return to bot selection
  };

  const resignGame = () => {
    if (game.isGameOver()) return;
    alert("You Lose (Resigned)");
    saveGameToFirebase("Resigned");
    resetGame();
  };

  if (!activeBot) {
    return <BotSelection onSelectBot={setActiveBot} />;
  }

  return (
    <div className="game-section">
      <div className="board-wrapper">
        <div className="board-header">
          <div className="player-badge">
            <div className="avatar bot-avatar">🤖</div>
            <div>
              <strong style={{ color: activeBot.color }}>{activeBot.name}</strong>
              <div className="muted-copy" style={{ fontSize: "0.8rem" }}>{isEngineCalculating ? "Thinking..." : `Level ${activeBot.skillLevel}`}</div>
            </div>
          </div>
        </div>

        <div className="chessboard-container">
          <Chessboard
            options={{
              position: fen,
              onPieceDrop: onDrop,
              boardOrientation: boardOrientation,
              darkSquareStyle: { backgroundColor: "#56d2d2" },
              lightSquareStyle: { backgroundColor: "#f5f7fb" }
            }}
          />
        </div>

        <div className="board-footer">
          <div className="player-badge">
            <div className="avatar user-avatar">{user?.email?.charAt(0).toUpperCase() || "P"}</div>
            <div>
              <strong>{user ? "You" : "Guest Player"}</strong>
              <div className="muted-copy" style={{ fontSize: "0.8rem" }}>Playing White</div>
            </div>
          </div>
        </div>
      </div>

      <div className="side-panel">
        <GameControls
          onNewGame={resetGame}
          onResign={resignGame}
          onFlipBoard={() => setBoardOrientation(prev => prev === "white" ? "black" : "white")}
          isDisabled={game.isGameOver() || moveHistory.length === 0}
        />
        <MoveList moves={moveHistory} />
      </div>
    </div>
  );
}
