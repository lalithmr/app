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
      // Return empty array instead of fake data if Admin SDK is currently unconfigured
      return res.status(200).json([]);
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
