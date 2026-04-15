import { getAbsoluteProgressIndex, getLeagueLevels, getLevelId } from "@/lib/level-utils";
import type { LeagueKey, UserProfile } from "@/types";

import { LevelCard } from "@/components/map/level-card";

type LeagueMapProps = {
  profile: UserProfile;
  selectedLevelId: string;
  onSelectLevel: (levelId: string) => void;
};

const visibleLeagues: LeagueKey[] = ["pawn", "bishop"];

export function LeagueMap({ profile, selectedLevelId, onSelectLevel }: LeagueMapProps) {
  const currentAbsoluteIndex = getAbsoluteProgressIndex(profile.league, profile.level);

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <p className="muted-label">League map</p>
          <h2>Road to the King tier</h2>
        </div>
        <span className="muted-copy">Current position highlighted in gold.</span>
      </div>

      <div className="map-grid">
        {visibleLeagues.map((league) => {
          const levels = getLeagueLevels(league);

          return (
            <div key={league} className="league-column">
              <div className="league-column-head">
                <h3>{league.toUpperCase()}</h3>
                <span>{league === "bishop" && profile.league === "pawn" ? "Locked" : "Live"}</span>
              </div>

              <div className="league-path" />

              {levels.map((config) => {
                const absoluteIndex = getAbsoluteProgressIndex(config.league, config.level);
                const isLocked =
                  config.locked && currentAbsoluteIndex < getAbsoluteProgressIndex("bishop", 1);

                const state =
                  absoluteIndex < currentAbsoluteIndex
                    ? "completed"
                    : absoluteIndex === currentAbsoluteIndex
                      ? "current"
                      : isLocked
                        ? "locked"
                        : "available";

                return (
                  <LevelCard
                    key={config.id}
                    config={config}
                    state={state}
                    taskState={profile.taskProgress?.[getLevelId(config.league, config.level)]}
                    selected={selectedLevelId === config.id}
                    onClick={() => onSelectLevel(config.id)}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}
