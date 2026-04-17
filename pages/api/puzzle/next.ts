import type { NextApiRequest, NextApiResponse } from "next";

import { getRequestFingerprint } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { getNextPuzzle } from "@/services/puzzle";
import type { ApiErrorResponse, PuzzleData } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PuzzleData | ApiErrorResponse>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed."
    });
  }

  const rateLimit = checkRateLimit(`puzzle:${getRequestFingerprint(req)}`, 12);

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: "Puzzle requests are being made too quickly. Please wait a bit."
    });
  }

  try {
    const puzzle = await getNextPuzzle();
    return res.status(200).json(puzzle);
  } catch {
    return res.status(502).json({
      error: "Failed to fetch the next puzzle from Lichess."
    });
  }
}
