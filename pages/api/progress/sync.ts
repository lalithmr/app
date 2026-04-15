import type { NextApiRequest, NextApiResponse } from "next";

import { requireApiUser } from "@/lib/api-auth";
import { detectWin } from "@/lib/detect-win";
import { adminDb } from "@/lib/firebase/admin";
import { advancePlayerLevel, getLevelId } from "@/lib/level-utils";
import { serializeValue } from "@/lib/serializers";
import { fetchLatestLichessGame } from "@/services/lichess";
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

    if (!profile.lichessUsername) {
      return res.status(400).json({
        error: "Link a Lichess username before syncing progress."
      });
    }

    const latestGame = await fetchLatestLichessGame(profile.lichessUsername);

    if (!latestGame) {
      return res.status(404).json({
        error: "No games found for the linked Lichess account."
      });
    }

    const transactionResult = await adminDb.runTransaction(async (transaction) => {
      const transactionSnapshot = await transaction.get(reference);
      const currentProfile = transactionSnapshot.data() as UserProfile;

      if (currentProfile.lastGameId === latestGame.id) {
        return {
          updated: false,
          didWin: false,
          duplicate: true,
          profile: currentProfile
        };
      }

      const didWin = detectWin(currentProfile.lichessUsername, latestGame);
      const nextProgression = didWin
        ? advancePlayerLevel(currentProfile.league, currentProfile.level)
        : {
            league: currentProfile.league,
            level: currentProfile.level,
            advancedLeague: false
          };
      const activeLevelId = getLevelId(currentProfile.league, currentProfile.level);
      const existingTaskState = currentProfile.taskProgress?.[activeLevelId] ?? {};
      const nextProfile = {
        ...currentProfile,
        league: nextProgression.league,
        level: nextProgression.level,
        points: didWin ? currentProfile.points + 10 : currentProfile.points,
        streak: didWin ? currentProfile.streak + 1 : 0,
        lastGameId: latestGame.id,
        taskProgress: {
          ...(currentProfile.taskProgress ?? {}),
          [activeLevelId]: {
            ...existingTaskState,
            play_1_game: true,
            win_1_game: didWin,
            updatedAt: new Date().toISOString()
          }
        },
        updatedAt: new Date().toISOString()
      };

      transaction.set(reference, nextProfile, {
        merge: true
      });

      return {
        updated: true,
        didWin,
        duplicate: false,
        advancedLeague: nextProgression.advancedLeague,
        profile: nextProfile
      };
    });

    return res.status(200).json({
      ...transactionResult,
      game: latestGame,
      profile: serializeValue(transactionResult.profile)
    });
  } catch (error) {
    return res.status(401).json({
      error: error instanceof Error ? error.message : "Unauthorized request."
    });
  }
}
