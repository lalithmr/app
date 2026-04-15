import type { LichessGame } from "@/types";

export function detectPlayerColor(
  username: string,
  game: LichessGame
): "white" | "black" | null {
  const normalized = username.trim().toLowerCase();
  const whiteName = game.players?.white?.user?.name?.toLowerCase();
  const blackName = game.players?.black?.user?.name?.toLowerCase();

  if (whiteName === normalized) {
    return "white";
  }

  if (blackName === normalized) {
    return "black";
  }

  return null;
}

export function detectWin(username: string, game: LichessGame): boolean {
  const playerColor = detectPlayerColor(username, game);

  if (!playerColor || !game.winner) {
    return false;
  }

  return playerColor === game.winner;
}
