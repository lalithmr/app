import type { NextApiRequest } from "next";

import { adminAuth } from "@/lib/firebase/admin";

export async function requireApiUser(req: NextApiRequest) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    throw new Error("Missing Authorization header.");
  }

  const token = authHeader.replace("Bearer ", "");
  return adminAuth.verifyIdToken(token);
}

export function getRequestFingerprint(req: NextApiRequest) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0] ?? "anonymous";
  }

  return forwardedFor?.split(",")[0]?.trim() || req.socket.remoteAddress || "anonymous";
}
