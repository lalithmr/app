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
  const gameRef = useRef(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [engineReady, setEngineReady] = useState(false);
  const [fen, setFen] = useState(gameRef.current.fen());
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  const [isEngineCalculating, setIsEngineCalculating] = useState(false);
  const [activeBot, setActiveBot] = useState<BotDetails | null>(null);

  const engine = useRef<Worker | null>(null);

  const applyEngineMoveRef = useRef<((moveStr: string) => void) | null>(null);
  
  useEffect(() => {
    applyEngineMoveRef.current = applyEngineMove;
  });

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
        if (moveStr && applyEngineMoveRef.current) {
          applyEngineMoveRef.current(moveStr);
        }
      }
    };

    engine.current.postMessage("uci");
    engine.current.postMessage("isready");

    return () => {
      engine.current?.terminate();
    };
  }, []);

  const saveGameToFirebase = async (result: string, movesToSave: string[] = []) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "games"), {
        userId: user.uid,
        result,
        moves: movesToSave.length > 0 ? movesToSave : moveHistory,
        date: Date.now()
      });
    } catch (e) {
      console.error("Failed to save game", e);
    }
  };

  const handleGameOver = useCallback((currentGame: Chess, newMoves: string[]) => {
    let result = "";
    if (currentGame.isCheckmate()) {
      result = currentGame.turn() === "w" ? "You Lose" : "You Win";
    } else if (currentGame.isDraw() || currentGame.isStalemate()) {
      result = "Draw";
    }

    if (result) {
      alert(`Game Over: ${result}`);
      saveGameToFirebase(result, newMoves);
    }
  }, [user]);

  const makeMove = (move: { from: string; to: string; promotion?: string }) => {
    try {
      const g = new Chess(gameRef.current.fen());
      const result = g.move(move);

      if (result) {
        gameRef.current = g;
        setFen(g.fen());
        
        let localMoves: string[] = [];
        setMoveHistory(prev => {
          localMoves = [...prev, result.san];
          return localMoves;
        });
        
        setTimeout(() => handleGameOver(g, localMoves), 0);
        return g.fen();
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

  const onDrop = (...args: any[]) => {
    let sourceSquare: string, targetSquare: string, pieceStr: string = "";
    
    // Safely extract regardless of react-chessboard version arguments
    if (args.length === 1 && typeof args[0] === 'object' && args[0] !== null) {
      sourceSquare = args[0].sourceSquare;
      targetSquare = args[0].targetSquare;
      pieceStr = (args[0].piece && args[0].piece.pieceType) ? args[0].piece.pieceType : (args[0].piece || "");
    } else {
      sourceSquare = args[0];
      targetSquare = args[1];
      pieceStr = args[2] || "";
    }

    if (!targetSquare) return false;

    // Prevent moves if engine is calculating or game is over
    if (isEngineCalculating || gameRef.current.isGameOver()) return false;

    // Must be user's turn
    if (gameRef.current.turn() !== 'w' && boardOrientation === 'white') return false;
    if (gameRef.current.turn() !== 'b' && boardOrientation === 'black') return false;

    const isPromotion = (pieceStr === "wP" && targetSquare[1] === "8") || (pieceStr === "bP" && targetSquare[1] === "1");

    const moveObj: { from: string, to: string, promotion?: string } = {
      from: sourceSquare,
      to: targetSquare
    };

    if (isPromotion) {
      moveObj.promotion = "q";
    }

    const moveValid = makeMove(moveObj);

    if (typeof moveValid === 'string') {
      // Trigger Engine response
      requestEngineMove(moveValid);
      return true;
    }

    return false;
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
    gameRef.current = newGame;
    setFen(newGame.fen());
    setMoveHistory([]);
    setActiveBot(null); // Return to bot selection
  };

  const resignGame = () => {
    if (gameRef.current.isGameOver()) return;
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
            position={fen}
            onPieceDrop={onDrop}
            boardOrientation={boardOrientation}
            customDarkSquareStyle={{ backgroundColor: "#56d2d2" }}
            customLightSquareStyle={{ backgroundColor: "#f5f7fb" }}
            arePremovesAllowed={false}
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
          isDisabled={gameRef.current.isGameOver() || moveHistory.length === 0}
        />
        <MoveList moves={moveHistory} />
      </div>
    </div>
  );
}
