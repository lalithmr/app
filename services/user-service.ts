import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { db } from "@/lib/firebase/client";
import type { UserProfile } from "@/types";

export function getDefaultUserProfile(user: User, preferredUsername?: string): UserProfile {
  const displayName = preferredUsername?.trim() || user.displayName?.trim();
  const fallbackName = user.email?.split("@")[0] ?? "player";

  return {
    username: displayName || fallbackName,
    lichessUsername: "",
    league: "pawn",
    level: 1,
    points: 0,
    streak: 0,
    lastGameId: "",
    taskProgress: {},
    puzzleProgress: {
      completedCount: 0,
      streak: 0,
      completedPuzzleIds: []
    }
  };
}

export async function ensureUserProfile(user: User, preferredUsername?: string) {
  const reference = doc(db, "users", user.uid);
  const snapshot = await getDoc(reference);

  if (!snapshot.exists()) {
    const baseProfile = getDefaultUserProfile(user, preferredUsername);
    await setDoc(reference, {
      ...baseProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return baseProfile;
  }

  return snapshot.data() as UserProfile;
}

export async function updateUserProfile(uid: string, updates: Partial<UserProfile>) {
  const reference = doc(db, "users", uid);
  await updateDoc(reference, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}
