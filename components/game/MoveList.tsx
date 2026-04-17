import { Move } from "chess.js";

interface MoveListProps {
  moves: string[];
}

export function MoveList({ moves }: MoveListProps) {
  const pairs = [];
  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      white: moves[i],
      black: moves[i + 1] || "",
      moveNumber: Math.floor(i / 2) + 1
    });
  }

  return (
    <div className="move-list-container">
      <div className="move-list-header">
        <h3>Move History</h3>
      </div>
      <div className="move-list-content">
        {pairs.length === 0 ? (
          <div className="muted-copy" style={{ padding: "1rem", textAlign: "center" }}>
            No moves yet.
          </div>
        ) : (
          pairs.map((pair) => (
             <div key={pair.moveNumber} className="move-row">
               <span className="move-number">{pair.moveNumber}.</span>
               <span className="move-notation">{pair.white}</span>
               <span className="move-notation">{pair.black}</span>
             </div>
          ))
        )}
      </div>
    </div>
  );
}
