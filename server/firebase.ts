import fs from "fs";
import path from "path";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

let firestoreDb: any = null;
let isFirebaseActive = false;

const configPath = path.join(process.cwd(), "firebase-applet-config.json");
const serviceAccountPath = path.join(process.cwd(), "service-account-key.json");

if (fs.existsSync(configPath)) {
  try {
    const configData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (configData && configData.projectId) {
      let appConfig: any = { projectId: configData.projectId };
      
      // If service account is available, use it directly to avoid ADC errors
      if (fs.existsSync(serviceAccountPath)) {
        const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));
        appConfig = { credential: cert(serviceAccount) };
      }
      
      const app = getApps().length === 0 ? initializeApp(appConfig) : getApp();
      
      const dbId = configData.firestoreDatabaseId || "(default)";
      firestoreDb = getFirestore(app, dbId);
      isFirebaseActive = true;
      console.log(`🔥 Firebase Admin initialized successfully for custom database ID: "${dbId}"`);
      
      // Asynchronously verify active read access to avoid throwing runtime PERMISSION_DENIED on users collection
      firestoreDb.collection("users").limit(1).get()
        .then(() => {
          console.log("✅ Connection verified: Read access to named database is fully authorized.");
        })
        .catch((err: any) => {
          console.warn(`⚠️ Firebase Admin connection test failed: ${err.message}`);
          console.warn("🛡️ Security permissions or IAM replication is lagging / unavailable. Gracefully falling back to secure local file persistent storage.");
          isFirebaseActive = false;
        });
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin from firebase-applet-config.json:", error);
  }
} else {
  // Check environment variables as fallback
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (projectId) {
    try {
      const app = getApps().length === 0 ? initializeApp({
        projectId,
      }) : getApp();
      firestoreDb = getFirestore(app);
      isFirebaseActive = true;
      console.log("🔥 Firebase Admin initialized successfully from process.env backup configurations!");
      
      // Asynchronously verify active read access to avoid throwing runtime PERMISSION_DENIED on users collection
      firestoreDb.collection("users").limit(1).get()
        .then(() => {
          console.log("✅ Connection verified: Read access via Environment variables is fully authorized.");
        })
        .catch((err: any) => {
          console.warn(`⚠️ Firebase Admin custom env connection test failed: ${err.message}`);
          console.warn("🛡️ Security permissions or IAM replication is lagging / unavailable. Gracefully falling back to secure local file persistent storage.");
          isFirebaseActive = false;
        });
    } catch (error) {
      console.error("Failed to initialize Firebase Admin from environment variables:", error);
    }
  }
}

export { firestoreDb, isFirebaseActive };
