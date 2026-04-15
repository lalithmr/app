import type { NextApiRequest, NextApiResponse } from "next";

import { getRequestFingerprint } from "@/lib/api-auth";
import { detectPlayerColor, detectWin } from "@/lib/detect-win";
import { checkRateLimit } from "@/lib/rate-limit";
import { fetchLatestLichessGame } from "@/services/lichess";
import type { ApiErrorResponse } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<string, unknown> | ApiErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed."
    });
  }

  const username = String(req.query.username ?? "").trim();

  if (!username) {
    return res.status(400).json({
      error: "A username query parameter is required."
    });
  }

  const rateLimit = checkRateLimit(
    `latest-game:${getRequestFingerprint(req)}:${username.toLowerCase()}`,
    12
  );

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: "Too many latest game checks. Please wait before retrying."
    });
  }

  try {
    const game = await fetchLatestLichessGame(username);

    if (!game) {
      return res.status(404).json({
        error: "No games found for this Lichess username."
      });
    }

    return res.status(200).json({
      game,
      playerColor: detectPlayerColor(username, game),
      didWin: detectWin(username, game)
    });
  } catch {
    return res.status(502).json({
      error: "Failed to fetch the latest game from Lichess."
    });
  }
}
