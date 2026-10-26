
import "dotenv/config";
import {
  initializeApp,
  getApps,
  applicationDefault,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const app =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

export const firebaseAuth = getAuth(app);

export default app;
