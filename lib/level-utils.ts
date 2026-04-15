import levelConfigSource from "@/lib/config/levels.json";
import { LEAGUE_LABELS, LEAGUE_ORDER } from "@/lib/constants/leagues";
import type { LeagueKey, LevelConfig, UserProfile } from "@/types";

const levelConfigs = levelConfigSource as LevelConfig[];
const configuredLeagueCounts = levelConfigs.reduce<Record<string, number>>((accumulator, level) => {
  accumulator[level.league] = Math.max(accumulator[level.league] ?? 0, level.level);
  return accumulator;
}, {});

export function getLevelId(league: LeagueKey, level: number) {
  return `${league}-${level}`;
}

export function getAllLevels() {
  return levelConfigs;
}

export function getLeagueLevels(league: LeagueKey) {
  return levelConfigs.filter((config) => config.league === league);
}

export function getLevelConfig(league: LeagueKey, level: number) {
  return levelConfigs.find(
    (config) => config.league === league && config.level === level
  );
}

export function getActiveLevel(profile: UserProfile | null | undefined) {
  if (!profile) {
    return getLevelConfig("pawn", 1) ?? null;
  }

  return getLevelConfig(profile.league, profile.level) ?? null;
}

export function getLeagueProgressLabel(league: LeagueKey) {
  return LEAGUE_LABELS[league];
}

export function getLeagueLevelCount(league: LeagueKey) {
  return configuredLeagueCounts[league] ?? 1;
}

export function getAbsoluteProgressIndex(league: LeagueKey, level: number) {
  const leagueIndex = LEAGUE_ORDER.indexOf(league);
  const previousLeagueOffsets = LEAGUE_ORDER.slice(0, Math.max(leagueIndex, 0)).reduce(
    (total, currentLeague) => total + getLeagueLevelCount(currentLeague),
    0
  );

  return previousLeagueOffsets + level;
}

export function advancePlayerLevel(currentLeague: LeagueKey, currentLevel: number) {
  const levelCount = getLeagueLevelCount(currentLeague);

  if (currentLevel < levelCount) {
    return {
      league: currentLeague,
      level: currentLevel + 1,
      advancedLeague: false
    };
  }

  const currentLeagueIndex = LEAGUE_ORDER.indexOf(currentLeague);

  if (currentLeagueIndex === -1 || currentLeagueIndex === LEAGUE_ORDER.length - 1) {
    return {
      league: currentLeague,
      level: levelCount,
      advancedLeague: false
    };
  }

  for (let index = currentLeagueIndex + 1; index < LEAGUE_ORDER.length; index += 1) {
    const nextLeague = LEAGUE_ORDER[index];

    if (getLeagueLevelCount(nextLeague) > 0) {
      return {
        league: nextLeague,
        level: 1,
        advancedLeague: true
      };
    }
  }

  return {
    league: currentLeague,
    level: levelCount,
    advancedLeague: false
  };
}
