import { parseNDJSON } from "@/lib/parse-ndjson";
import { enforceCooldown } from "@/lib/rate-limit";
import type { LichessGame, PuzzleData } from "@/types";

const LICHESS_BASE_URL = process.env.LICHESS_BASE_URL ?? "https://lichess.org";
const LICHESS_USER_AGENT = process.env.LICHESS_USER_AGENT ?? "Eternix/1.0";

async function lichessFetch(path: string, init?: RequestInit, cooldownKey?: string) {
  if (cooldownKey) {
    await enforceCooldown(cooldownKey);
  }

  const response = await fetch(`${LICHESS_BASE_URL}${path}`, {
    ...init,
    headers: {
      "User-Agent": LICHESS_USER_AGENT,
      ...init?.headers
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Lichess request failed with status ${response.status}`);
  }

  return response;
}

export async function validateLichessUsername(username: string) {
  const response = await fetch(
    `https://lichess.org/api/user/${username}`,
    {
      headers: {
        Accept: "application/json",
      },
    }
  );

  // 👇 ALWAYS read as text first
  const text = await response.text();

  // DEBUG (optional)
  console.log("Lichess raw response:", text);

  if (!response.ok) {
    throw new Error("Invalid username");
  }

  try {
    // 👇 safely parse JSON
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    throw new Error("Invalid response from Lichess");
  }
}

export async function fetchLatestLichessGame(username: string) {
  const response = await lichessFetch(
    `/api/games/user/${encodeURIComponent(username)}?max=1`,
    {
      headers: {
        Accept: "application/x-ndjson"
      }
    },
    `game:${username.toLowerCase()}`
  );

  const raw = await response.text();
  const games = parseNDJSON<LichessGame>(raw);

  return games[0] ?? null;
}

export async function fetchNextPuzzle() {
  const response = await lichessFetch(
    "/api/puzzle/next",
    undefined,
    "puzzle:next"
  );

  return (await response.json()) as PuzzleData;
}
