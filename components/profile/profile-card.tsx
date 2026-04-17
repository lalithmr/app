import { getLeagueLevelCount, getLeagueProgressLabel } from "@/lib/level-utils";
import type { UserProfile } from "@/types";

type ProfileCardProps = {
  profile: UserProfile;
};

export function ProfileCard({ profile }: ProfileCardProps) {
  const puzzleProgress = profile.puzzleProgress ?? {
    completedCount: 0,
    streak: 0
  };
  const progressPercent = Math.min(
    (profile.level / getLeagueLevelCount(profile.league)) * 100,
    100
  );

  return (
    <section className="panel profile-card">
      <div className="profile-head" style={{ display: "flex", gap: "1.5rem" }}>
        <div 
          style={{ 
            width: "5rem", 
            height: "5rem", 
            borderRadius: "50%", 
            background: "linear-gradient(135deg, rgba(246, 200, 95, 0.4), rgba(86, 210, 210, 0.4))",
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "var(--text)", 
            fontSize: "2rem",
            fontWeight: "bold",
            border: "1px solid var(--border)"
          }}
        >
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <div style={{ flexGrow: 1 }}>
          <p className="muted-label">Profile</p>
          <h2>{profile.username}</h2>
          <p className="muted-copy">
            {getLeagueProgressLabel(profile.league)} League · Level {profile.level}
          </p>
        </div>
        <div className="stat-orb">
          <span>{profile.points}</span>
          <small>points</small>
        </div>
      </div>

      <div className="progress-block">
        <div className="progress-row">
          <span>League progress</span>
          <strong>{Math.round(progressPercent)}%</strong>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Puzzles solved</span>
          <strong>{puzzleProgress.completedCount}</strong>
        </div>
        <div className="stat-card">
          <span>Puzzle streak</span>
          <strong>{puzzleProgress.streak}</strong>
        </div>
        <div className="stat-card">
          <span>Last puzzle</span>
          <strong>{puzzleProgress.lastPuzzleId || "None yet"}</strong>
        </div>
      </div>
    </section>
  );
}
