import type { NextApiRequest, NextApiResponse } from "next";

import { requireApiUser } from "@/lib/api-auth";
import { adminDb } from "@/lib/firebase/admin";
import { getLevelId } from "@/lib/level-utils";
import { serializeValue } from "@/lib/serializers";
import type { ApiErrorResponse, UserProfile } from "@/types";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Record<string, unknown> | ApiErrorResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed."
    });
  }

  try {
    const decodedToken = await requireApiUser(req);
    const reference = adminDb.collection("users").doc(decodedToken.uid);
    const snapshot = await reference.get();

    if (!snapshot.exists) {
      return res.status(404).json({
        error: "User profile not found."
      });
    }

    const profile = snapshot.data() as UserProfile;
    const levelId = getLevelId(profile.league, profile.level);
    const existingLevelState = profile.taskProgress?.[levelId] ?? {};
    const nextProfile = {
      ...profile,
      taskProgress: {
        ...(profile.taskProgress ?? {}),
        [levelId]: {
          ...existingLevelState,
          solve_1_puzzle: true,
          puzzleId: String(req.body?.puzzleId ?? ""),
          updatedAt: new Date().toISOString()
        }
      },
      updatedAt: new Date().toISOString()
    };

    await reference.set(nextProfile, {
      merge: true
    });

    return res.status(200).json({
      updated: true,
      profile: serializeValue(nextProfile)
    });
  } catch (error) {
    return res.status(401).json({
      error: error instanceof Error ? error.message : "Unauthorized request."
    });
  }
}
