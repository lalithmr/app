import { cert, getApp, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdminApp(): App {
  if (getApps().length) {
    return getApp();
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    throw new Error("Missing Firebase Admin environment variables.");
  }

  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey
    })
  });
}

// Export proxies so that initialization is deferred until the first method call!
export const adminAuth = new Proxy({} as ReturnType<typeof getAuth>, {
  get(target, prop) {
    return (getAuth(getFirebaseAdminApp()) as any)[prop];
  }
});

export const adminDb = new Proxy({} as ReturnType<typeof getFirestore>, {
  get(target, prop) {
    return (getFirestore(getFirebaseAdminApp()) as any)[prop];
  }
});

