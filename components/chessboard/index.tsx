import dynamic from "next/dynamic";

const ReactChessboard = dynamic(
  () => import("react-chessboard").then((mod) => mod.Chessboard),
  { ssr: false }
);

interface ChessboardWrapperProps {
  position: string;
  onPieceDrop: (sourceSquare: string, targetSquare: string, piece: string) => boolean;
  boardOrientation?: "white" | "black";
}

export function Chessboard({ position, onPieceDrop, boardOrientation = "white" }: ChessboardWrapperProps) {
  return (
    <div style={{ width: "100%", maxWidth: 500, margin: "0 auto", position: "relative" }}>
      <ReactChessboard 
        position={position} 
        onPieceDrop={onPieceDrop} 
        boardOrientation={boardOrientation}
        customDarkSquareStyle={{ backgroundColor: "rgba(86, 210, 210, 0.4)" }}
        customLightSquareStyle={{ backgroundColor: "rgba(245, 247, 251, 0.2)" }}
        customBoardStyle={{ 
          borderRadius: "8px", 
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)"
        }}
      />
    </div>
  );
}
