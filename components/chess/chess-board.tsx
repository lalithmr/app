import dynamic from "next/dynamic";
import type { CSSProperties } from "react";

const ReactChessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false }
);

type ChessBoardProps = {
  position: string;
  orientation?: "white" | "black";
  allowDragging?: boolean;
  squareStyles?: Record<string, CSSProperties>;
  onPieceDrop: (move: {
    piece: string;
    sourceSquare: string;
    targetSquare: string;
  }) => boolean;
};

export function ChessBoard({
  position,
  orientation = "white",
  allowDragging = true,
  squareStyles,
  onPieceDrop
}: ChessBoardProps) {
  return (
    <div className="chessboard-shell">
      <ReactChessboard
        options={{
          position,
          boardOrientation: orientation,
          allowDragging,
          onPieceDrop: ({ piece, sourceSquare, targetSquare }) =>
            targetSquare
              ? onPieceDrop({
                  piece: piece.pieceType,
                  sourceSquare,
                  targetSquare
                })
              : false,
          squareStyles,
          darkSquareStyle: { backgroundColor: "rgba(52, 74, 106, 0.96)" },
          lightSquareStyle: { backgroundColor: "rgba(233, 240, 251, 0.96)" },
          boardStyle: {
            borderRadius: 24,
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.34)"
          }
        }}
      />
    </div>
  );
}
