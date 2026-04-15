import type { LevelConfig, LevelTaskState, TaskKey } from "@/types";

const TASK_LABELS: Record<TaskKey, string> = {
  play_1_game: "Play 1 rated game",
  win_1_game: "Win 1 game",
  solve_1_puzzle: "Solve 1 puzzle"
};

type TaskPanelProps = {
  level: LevelConfig | null;
  taskState?: LevelTaskState;
};

export function TaskPanel({ level, taskState }: TaskPanelProps) {
  if (!level) {
    return null;
  }

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="muted-label">Current quest</p>
          <h2>{level.title}</h2>
        </div>
        <span className="reward-badge">+{level.rewardPoints} XP</span>
      </div>

      <div className="task-list">
        {level.tasks.map((task) => {
          const isDone = Boolean(taskState?.[task]);

          return (
            <div key={task} className={`task-item ${isDone ? "done" : ""}`}>
              <div className="task-indicator" />
              <div>
                <strong>{TASK_LABELS[task]}</strong>
                <p>{isDone ? "Completed for this level." : "Still waiting for completion."}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
