import type { NextApiRequest, NextApiResponse } from "next";

import { adminDb } from "@/lib/firebase/admin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    if (!process.env.FIREBASE_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY.includes("YOUR_KEY_HERE")) {
      // Return mock data for development if Admin SDK is unconfigured
      return res.status(200).json([
        { id: "1", username: "GrandmasterFlash", points: 8400, league: "King", level: 10 },
        { id: "2", username: "CheckMateWizard", points: 7250, league: "Queen", level: 8 },
        { id: "3", username: "PawnStormer", points: 6100, league: "Rook", level: 4 },
        { id: "4", username: "KnightRider", points: 5800, league: "Knight", level: 9 },
        { id: "5", username: "BishopPair", points: 4900, league: "Bishop", level: 6 },
        { id: "6", username: "EnPassantPro", points: 3400, league: "Pawn", level: 10 },
        { id: "7", username: "EternixPlayer1", points: 1200, league: "Pawn", level: 4 },
        { id: "8", username: "TacticsNoob", points: 800, league: "Pawn", level: 2 }
      ]);
    }

    const snapshot = await adminDb
      .collection("users")
      .orderBy("points", "desc")
      .limit(10)
      .get();

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        username: data.username,
        points: data.points || 0,
        league: data.league || "pawn",
        level: data.level || 1,
      };
    });

    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch leaderboard." });
  }
}
