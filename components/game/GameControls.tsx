import { RotateCcw, Flag, RefreshCw } from "lucide-react";

interface GameControlsProps {
  onNewGame: () => void;
  onResign: () => void;
  onFlipBoard: () => void;
  isDisabled: boolean;
}

export function GameControls({ onNewGame, onResign, onFlipBoard, isDisabled }: GameControlsProps) {
  return (
    <div className="game-controls">
      <button className="secondary-button" onClick={onFlipBoard} title="Flip Board">
        <RefreshCw size={18} />
      </button>
      
      <button className="secondary-button" onClick={onNewGame} title="New Game">
        <RotateCcw size={18} />
      </button>
      
      <button 
        className="ghost-button" 
        style={{ color: "var(--danger)", borderColor: "rgba(255,135,135,0.2)" }}
        onClick={onResign}
        disabled={isDisabled}
        title="Resign"
      >
        <Flag size={18} />
      </button>
    </div>
  );
}
