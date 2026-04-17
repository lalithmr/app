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

  const puzzleId = String(req.body?.puzzleId ?? "").trim();

  if (!puzzleId) {
    return res.status(400).json({
      error: "A puzzle id is required."
    });
  }

  try {
    if (!process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY.includes("YOUR_KEY_HERE")) {
      return res.status(200).json({
        updated: true,
        alreadyCompleted: false,
        profile: {
          uid: "mock",
          taskProgress: {
            mock_level: {
              solve_1_puzzle: true,
              puzzleId
            }
          },
          puzzleProgress: {
            completedCount: 1,
            streak: 1,
            completedPuzzleIds: [puzzleId]
          }
        }
      });
    }

    const decodedToken = await requireApiUser(req);
    const reference = adminDb.collection("users").doc(decodedToken.uid);
    const result = await adminDb.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(reference);

      if (!snapshot.exists) {
        throw new Error("User profile not found.");
      }

      const profile = snapshot.data() as UserProfile;
      const levelId = getLevelId(profile.league, profile.level);
      const existingLevelState = profile.taskProgress?.[levelId] ?? {};
      const existingPuzzleProgress = profile.puzzleProgress ?? {
        completedCount: 0,
        streak: 0,
        completedPuzzleIds: []
      };
      const completedPuzzleIds = existingPuzzleProgress.completedPuzzleIds ?? [];
      const alreadyCompleted = completedPuzzleIds.includes(puzzleId);
      const nextCompletedPuzzleIds = alreadyCompleted
        ? completedPuzzleIds
        : [puzzleId, ...completedPuzzleIds].slice(0, 100);
      const timestamp = new Date().toISOString();
      const nextProfile = {
        ...profile,
        taskProgress: {
          ...(profile.taskProgress ?? {}),
          [levelId]: {
            ...existingLevelState,
            solve_1_puzzle: true,
            puzzleId,
            updatedAt: timestamp
          }
        },
        puzzleProgress: {
          completedCount: alreadyCompleted
            ? (existingPuzzleProgress.completedCount ?? 0)
            : (existingPuzzleProgress.completedCount ?? 0) + 1,
          streak: alreadyCompleted
            ? (existingPuzzleProgress.streak ?? 0)
            : (existingPuzzleProgress.streak ?? 0) + 1,
          lastCompletedAt: timestamp,
          lastPuzzleId: puzzleId,
          completedPuzzleIds: nextCompletedPuzzleIds
        },
        updatedAt: timestamp
      };

      transaction.set(reference, nextProfile, {
        merge: true
      });

      return {
        updated: !alreadyCompleted,
        alreadyCompleted,
        profile: nextProfile
      };
    });

    return res.status(200).json({
      ...result,
      profile: serializeValue(result.profile)
    });
  } catch (error) {
    const status =
      error instanceof Error && error.message === "User profile not found."
        ? 404
        : 401;

    return res.status(status).json({
      error: error instanceof Error ? error.message : "Unauthorized request."
    });
  }
}
