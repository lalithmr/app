import type { LevelConfig, LevelTaskState } from "@/types";

type LevelState = "completed" | "current" | "locked" | "available";

type LevelCardProps = {
  config: LevelConfig;
  state: LevelState;
  taskState?: LevelTaskState;
  selected: boolean;
  onClick: () => void;
};

export function LevelCard({
  config,
  state,
  taskState,
  selected,
  onClick
}: LevelCardProps) {
  const completedTasks = [
    taskState?.play_1_game,
    taskState?.win_1_game,
    taskState?.solve_1_puzzle
  ].filter(Boolean).length;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state === "locked"}
      className={`level-card ${state} ${selected ? "selected" : ""}`}
    >
      <div className="level-card-head">
        <span className="level-pill">
          {config.league.toUpperCase()} · {config.level}
        </span>
        <strong>{config.title}</strong>
      </div>
      <p>{config.subtitle}</p>
      <div className="level-card-foot">
        <span>{completedTasks}/3 tasks tracked</span>
        <span>{state === "current" ? "Active" : state === "completed" ? "Cleared" : state}</span>
      </div>
    </button>
  );
}
