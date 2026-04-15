import type { LeagueKey } from "@/types";

export const LEAGUE_ORDER: LeagueKey[] = [
  "pawn",
  "bishop",
  "knight",
  "rook",
  "queen",
  "king"
];

export const LEAGUE_LABELS: Record<LeagueKey, string> = {
  pawn: "Pawn",
  bishop: "Bishop",
  knight: "Knight",
  rook: "Rook",
  queen: "Queen",
  king: "King"
};

export const LEVELS_PER_LEAGUE = 8;
