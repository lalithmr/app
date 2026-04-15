import type { NextApiRequest, NextApiResponse } from "next";

import { getRequestFingerprint } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { validateLichessUsername } from "@/services/lichess";
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
      error: "A Lichess username is required."
    });
  }

  const rateLimit = checkRateLimit(
    `validate:${getRequestFingerprint(req)}:${username.toLowerCase()}`,
    8
  );

  if (!rateLimit.allowed) {
    return res.status(429).json({
      error: "Too many validation requests. Please wait a moment before trying again."
    });
  }

  try {
    const profile = await validateLichessUsername(username);

    return res.status(200).json({
      valid: true,
      username: profile.username ?? username,
      perfs: profile.perfs ?? null
    });
  } catch {
    return res.status(404).json({
      error: "That Lichess username could not be found."
    });
  }
}
