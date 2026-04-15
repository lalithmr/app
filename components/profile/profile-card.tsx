import { getLeagueLevelCount, getLeagueProgressLabel } from "@/lib/level-utils";
import type { UserProfile } from "@/types";

type ProfileCardProps = {
  profile: UserProfile;
};

export function ProfileCard({ profile }: ProfileCardProps) {
  const progressPercent = Math.min(
    (profile.level / getLeagueLevelCount(profile.league)) * 100,
    100
  );

  return (
    <section className="panel profile-card">
      <div className="profile-head">
        <div>
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
          <span>Linked Lichess</span>
          <strong>{profile.lichessUsername || "Not connected"}</strong>
        </div>
        <div className="stat-card">
          <span>Streak</span>
          <strong>{profile.streak}</strong>
        </div>
        <div className="stat-card">
          <span>Last processed game</span>
          <strong>{profile.lastGameId || "None yet"}</strong>
        </div>
      </div>
    </section>
  );
}
