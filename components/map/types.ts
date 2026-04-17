export type ZoneStatus = "locked" | "available" | "captured";

export interface Zone {
  id: string;
  row: number;
  col: number;
  ownerId: string | null;
  ownerName?: string | null;
  league: string;
  difficulty: number;
  status: ZoneStatus;
  lastCapturedAt: number | null;
}
