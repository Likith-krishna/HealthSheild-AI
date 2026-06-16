import fs from "fs";
import path from "path";
import { isFirebaseActive, firestoreDb } from "./firebase.js";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  userId?: string | null
): never {
  const errStr = error instanceof Error ? error.message : String(error);
  const errInfo: FirestoreErrorInfo = {
    error: errStr,
    authInfo: {
      userId: userId || null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function checkAndHandleError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  userId?: string | null
) {
  const errStr = error instanceof Error ? error.message : String(error);
  if (
    errStr.includes("PERMISSION_DENIED") ||
    errStr.toLowerCase().includes("permission denied") ||
    errStr.toLowerCase().includes("insufficient permissions")
  ) {
    handleFirestoreError(error, operationType, path, userId);
  }
}

export interface UserTable {
  id: string;
  fullName: string;
  email: string;
  userId: string; // The user-provided username/custom login ID
  hashed_password: string;
  phoneNumber: string;
  address: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_active: boolean;
  email_verified: boolean;
}

export interface LoginHistoryRecord {
  id: string;
  userId: string;
  timestamp: string;
  ip: string;
  userAgent: string;
  status: "success" | "failed";
}

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const HISTORY_FILE = path.join(DATA_DIR, "login_history.json");
const TIMELINE_FILE = path.join(DATA_DIR, "health_timeline.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface HealthTimelineRecord {
  id: string;
  userId: string;
  timestamp: string;
  basicInfo: {
    age: number;
    gender: string;
    height: number;
    weight: number;
    bmi: number;
    occupation: string;
    systolicBP?: number;
    diastolicBP?: number;
    bloodSugar?: number;
    cholesterolTotal?: number;
    hba1c?: number;
    ldlCholesterol?: number;
    hdlCholesterol?: number;
    triglycerides?: number;
    serumCreatinine?: number;
    altSgpt?: number;
    tsh?: number;
  };
  womensHealth?: {
    menstruationCycle: string;
    pcos: string;
    hormoneBalance: string;
    thyroidStatus: string;
    pregnancyStatus: string;
    pregnancyComments?: string;
  };
  mentalHealth?: {
    score: number;
    anxietyLevel: number;
    stressLevel: number;
    notes?: string;
    recommendations?: string[];
  };
  lifestyle: {
    sleepDuration: number;
    sleepQuality: number; // 1-5 rating
    stressLevel: number; // 1-10 slider
    physicalActivity: string; // Yoga, walk, etc.
    sittingHours: number;
    smoking: string;
    alcohol: string;
  };
  nutrition: {
    mealPattern: string;
    junkFoodRate: number; // 1-10
    sugarRate: number; // 1-10
    waterIntake: number; // liters
  };
  medicalHistory: {
    existingDiseases: string;
    previousDiagnosis: string;
    surgeries: string;
    infections: string;
    allergies: string;
    currentMedications: string;
    familyHistory: string;
  };
  wearableDetails: {
    steps: number;
    heartRate: number;
    sleepCycle: string;
    activityText: string;
  };
  analysisResults: any; // Saves computed scores & predictions JSON
}

// Helper to read timeline from file
export function readTimeline(): HealthTimelineRecord[] {
  try {
    if (!fs.existsSync(TIMELINE_FILE)) {
      fs.writeFileSync(TIMELINE_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const content = fs.readFileSync(TIMELINE_FILE, "utf-8");
    return JSON.parse(content || "[]");
  } catch (error) {
    console.error("Error reading health timeline file:", error);
    return [];
  }
}

// Helper to write timeline
export function writeTimeline(records: HealthTimelineRecord[]): void {
  try {
    const tempFile = TIMELINE_FILE + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(records, null, 2), "utf-8");
    fs.renameSync(tempFile, TIMELINE_FILE);
  } catch (error) {
    console.error("Error persisting health timeline:", error);
  }
}

// Helper to read users from file with fallback empty array
export function readUsers(): UserTable[] {
  try {
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const content = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(content || "[]");
  } catch (error) {
    console.error("Error reading users file, falling back to empty list:", error);
    return [];
  }
}

// Helper to write users to file with safe file replacement
export function writeUsers(users: UserTable[]): void {
  try {
    const tempFile = USERS_FILE + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(users, null, 2), "utf-8");
    fs.renameSync(tempFile, USERS_FILE);
  } catch (error) {
    console.error("Critical error persisting user records:", error);
  }
}

// Helper to read login history from file
export function readHistory(): LoginHistoryRecord[] {
  try {
    if (!fs.existsSync(HISTORY_FILE)) {
      fs.writeFileSync(HISTORY_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const content = fs.readFileSync(HISTORY_FILE, "utf-8");
    return JSON.parse(content || "[]");
  } catch (error) {
    console.error("Error reading login history file:", error);
    return [];
  }
}

// Helper to write login history
export function writeHistory(records: LoginHistoryRecord[]): void {
  try {
    const tempFile = HISTORY_FILE + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(records, null, 2), "utf-8");
    fs.renameSync(tempFile, HISTORY_FILE);
  } catch (error) {
    console.error("Error persisting login history:", error);
  }
}

// Database Layer Operations following Repository Pattern
export const UserRepository = {
  // Finds user by their chosen custom User ID or Email, allowing standard sign-ins
  async findByUserIdOrEmail(identifier: string): Promise<UserTable | undefined> {
    const cleanId = identifier.trim().toLowerCase();

    // 1. Check cloud Firebase database if active
    if (isFirebaseActive && firestoreDb) {
      try {
        console.log(`[Firebase DB] Searching user by credentials id: "${cleanId}"`);
        const usersRef = firestoreDb.collection("users");
        
        // Check email match
        const snapEmail = await usersRef.where("email", "==", cleanId).get();
        if (!snapEmail.empty) {
          const docData = snapEmail.docs[0].data();
          return { ...docData, id: snapEmail.docs[0].id } as UserTable;
        }

        // Check userName / userId match
        const snapUser = await usersRef.where("userId", "==", cleanId).get();
        if (!snapUser.empty) {
          const docData = snapUser.docs[0].data();
          return { ...docData, id: snapUser.docs[0].id } as UserTable;
        }
      } catch (err) {
        checkAndHandleError(err, OperationType.GET, "users", identifier);
        console.error("Error querying user from Firebase Firestore:", err);
      }
    }

    // 2. Fallback to local offline cache
    const users = readUsers();
    return users.find(u => 
      u.email.trim().toLowerCase() === cleanId || 
      u.userId.trim().toLowerCase() === cleanId
    );
  },

  async findByFullName(fullName: string): Promise<UserTable | undefined> {
    const cleanName = fullName.trim().toLowerCase();
    if (isFirebaseActive && firestoreDb) {
      try {
        const snap = await firestoreDb.collection("users").where("fullName", "==", fullName.trim()).get();
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          return { ...docData, id: snap.docs[0].id } as UserTable;
        }
      } catch (err) {
        checkAndHandleError(err, OperationType.GET, "users");
        console.error("Error querying fullName from Firebase:", err);
      }
    }
    const users = readUsers();
    return users.find(u => u.fullName.trim().toLowerCase() === cleanName);
  },

  async findByPhoneNumber(phoneNumber: string): Promise<UserTable | undefined> {
    const cleanPhone = phoneNumber.trim().replace(/\s+/g, "");
    if (isFirebaseActive && firestoreDb) {
      try {
        const snap = await firestoreDb.collection("users").get();
        if (!snap.empty) {
          for (const doc of snap.docs) {
            const data = doc.data();
            if (data.phoneNumber && data.phoneNumber.trim().replace(/\s+/g, "") === cleanPhone) {
              return { ...data, id: doc.id } as UserTable;
            }
          }
        }
      } catch (err) {
        checkAndHandleError(err, OperationType.GET, "users");
        console.error("Error querying phone number from Firebase:", err);
      }
    }
    const users = readUsers();
    return users.find(u => u.phoneNumber.trim().replace(/\s+/g, "") === cleanPhone);
  },

  async findByEmailOnly(email: string): Promise<UserTable | undefined> {
    const cleanEmail = email.trim().toLowerCase();

    if (isFirebaseActive && firestoreDb) {
      try {
        const usersRef = firestoreDb.collection("users");
        const snap = await usersRef.where("email", "==", cleanEmail).get();
        if (!snap.empty) {
          const docData = snap.docs[0].data();
          return { ...docData, id: snap.docs[0].id } as UserTable;
        }
      } catch (err) {
        checkAndHandleError(err, OperationType.GET, "users");
        console.error("Error querying user email only from Firebase:", err);
      }
    }

    const users = readUsers();
    return users.find(u => u.email.trim().toLowerCase() === cleanEmail);
  },

  async findById(id: string): Promise<UserTable | undefined> {
    if (isFirebaseActive && firestoreDb) {
      try {
        const userDoc = await firestoreDb.collection("users").doc(id).get();
        if (userDoc.exists) {
          return { ...userDoc.data(), id: userDoc.id } as UserTable;
        }
      } catch (err) {
        checkAndHandleError(err, OperationType.GET, `users/${id}`, id);
        console.error(`Error loading user ID "${id}" from Firebase:`, err);
      }
    }

    const users = readUsers();
    return users.find(u => u.id === id);
  },

  async create(userData: Omit<UserTable, "created_at" | "updated_at" | "last_login" | "is_active" | "email_verified">): Promise<UserTable> {
    const now = new Date().toISOString();
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanUserId = userData.userId.trim().toLowerCase();

    // Validate uniqueness of key fields
    const duplicateUid = await this.findByUserIdOrEmail(cleanUserId);
    if (duplicateUid) {
      throw new Error("DuplicateUserIdError");
    }

    const duplicateEmail = await this.findByEmailOnly(cleanEmail);
    if (duplicateEmail) {
      throw new Error("DuplicateEmailError");
    }

    const duplicateName = await this.findByFullName(userData.fullName);
    if (duplicateName) {
      throw new Error("DuplicateNameError");
    }

    const duplicatePhone = await this.findByPhoneNumber(userData.phoneNumber);
    if (duplicatePhone) {
      throw new Error("DuplicatePhoneError");
    }

    const newUser: UserTable = {
      ...userData,
      email: cleanEmail,
      userId: cleanUserId,
      created_at: now,
      updated_at: now,
      last_login: null,
      is_active: true,
      email_verified: true,
    };

    // 1. Sync to Firebase if active
    if (isFirebaseActive && firestoreDb) {
      try {
        console.log(`[Firebase DB] Syncing registration document for: ${cleanUserId}`);
        await firestoreDb.collection("users").doc(newUser.id).set(newUser);
      } catch (err) {
        checkAndHandleError(err, OperationType.CREATE, `users/${newUser.id}`, newUser.userId);
        console.error("Failed to write user to Firebase Firestore:", err);
      }
    }

    // 2. Persist locally
    const users = readUsers();
    users.push(newUser);
    writeUsers(users);

    return newUser;
  },

  async update(id: string, updates: Partial<Omit<UserTable, "id" | "email" | "userId" | "created_at" | "hashed_password">>): Promise<UserTable> {
    const now = new Date().toISOString();

    // 1. Sync to Firebase
    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("users").doc(id).update({
          ...updates,
          updated_at: now
        });
      } catch (err) {
        checkAndHandleError(err, OperationType.UPDATE, `users/${id}`, id);
        console.error(`Error updating user profile in Firebase:`, err);
      }
    }

    // 2. Persist locally
    const users = readUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error("UserNotFoundError");
    }

    const updatedUser: UserTable = {
      ...users[index],
      ...updates,
      updated_at: now,
    };

    users[index] = updatedUser;
    writeUsers(users);
    return updatedUser;
  },

  async updatePassword(id: string, newHashedPassword: string): Promise<void> {
    const now = new Date().toISOString();

    // 1. Sync to Firebase
    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("users").doc(id).update({
          hashed_password: newHashedPassword,
          updated_at: now
        });
      } catch (err) {
        checkAndHandleError(err, OperationType.UPDATE, `users/${id}`, id);
        console.error("Failed updating password in Firebase:", err);
      }
    }

    // 2. Persist locally
    const users = readUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].hashed_password = newHashedPassword;
      users[index].updated_at = now;
      writeUsers(users);
    }
  },

  async updateLastLogin(id: string): Promise<void> {
    const now = new Date().toISOString();

    // 1. Sync to Firebase
    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("users").doc(id).update({
          last_login: now
        });
      } catch (err) {
        checkAndHandleError(err, OperationType.UPDATE, `users/${id}`, id);
        console.error("Failed updating last login in Firebase:", err);
      }
    }

    // 2. Persist locally
    const users = readUsers();
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
      users[index].last_login = now;
      writeUsers(users);
    }
  },

  async getLoginHistory(userId: string): Promise<LoginHistoryRecord[]> {
    if (isFirebaseActive && firestoreDb) {
      try {
        const historyRef = firestoreDb.collection("loginHistory");
        // Due to compound indexes wait issues in Firestore, we query by userId and sort in memory
        const snap = await historyRef.where("userId", "==", userId).get();
        if (!snap.empty) {
          const records: LoginHistoryRecord[] = [];
          snap.forEach((d: any) => {
            records.push({ ...d.data(), id: d.id } as LoginHistoryRecord);
          });
          return records
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);
        }
      } catch (err) {
        checkAndHandleError(err, OperationType.LIST, "loginHistory", userId);
        console.error("Error reading login records from Firebase:", err);
      }
    }

    // Fallback to local store
    const records = readHistory();
    return records
      .filter(r => r.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  },

  async logLoginAttempt(userId: string, status: "success" | "failed", ip: string, userAgent: string): Promise<void> {
    const timestamp = new Date().toISOString();
    const id = "log_" + Math.random().toString(36).substring(2, 11);
    
    const newRecord: LoginHistoryRecord = {
      id,
      userId,
      timestamp,
      ip: ip || "127.0.0.1",
      userAgent: userAgent || "Unknown Device",
      status,
    };

    // 1. Sync to Firebase
    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("loginHistory").doc(id).set(newRecord);
      } catch (err) {
        checkAndHandleError(err, OperationType.CREATE, `loginHistory/${id}`, userId);
        console.error("Error syncing log metric to Firebase:", err);
      }
    }

    // 2. Persist locally
    const records = readHistory();
    records.push(newRecord);
    if (records.length > 1000) {
      records.splice(0, records.length - 1000);
    }
    writeHistory(records);
  }
};

export const TimelineRepository = {
  async findByUserId(userId: string): Promise<HealthTimelineRecord[]> {
    if (isFirebaseActive && firestoreDb) {
      try {
        const ref = firestoreDb.collection("healthTimeline");
        const snap = await ref.where("userId", "==", userId).get();
        if (!snap.empty) {
          const records: HealthTimelineRecord[] = [];
          snap.forEach((doc: any) => {
            records.push({ ...doc.data(), id: doc.id } as HealthTimelineRecord);
          });
          return records.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        }
      } catch (err) {
        checkAndHandleError(err, OperationType.LIST, "healthTimeline", userId);
        console.error("Error loading timeline from Firebase:", err);
      }
    }
    // Fallback to local
    const timeline = readTimeline();
    return timeline
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  async create(record: Omit<HealthTimelineRecord, "id" | "timestamp">): Promise<HealthTimelineRecord> {
    const timestamp = new Date().toISOString();
    const id = "tl_" + Math.random().toString(36).substring(2, 11);
    
    const newRecord: HealthTimelineRecord = {
      ...record,
      id,
      timestamp,
    };

    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("healthTimeline").doc(id).set(newRecord);
      } catch (err) {
        checkAndHandleError(err, OperationType.CREATE, `healthTimeline/${id}`, record.userId);
        console.error("Error creating timeline record in Firebase:", err);
      }
    }

    // Persist to local JSON fallback
    const timeline = readTimeline();
    timeline.push(newRecord);
    writeTimeline(timeline);

    return newRecord;
  }
};

// --- Medications & Alarms Adherence Tracking Store ---

export interface MedicationModel {
  id: string;
  userId: string;
  medicineName: string;
  dosage: string;
  frequency: "Once Daily" | "Twice Daily" | "Three Times Daily" | "Every 6 Hours" | "Every 8 Hours" | "Weekly" | "Custom";
  times: string[];
  foodRelation: "Before Food" | "After Food" | "With Food" | "Any Time";
  startDate: string;
  endDate?: string;
  purpose: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicationLogModel {
  id: string;
  medicationId: string;
  userId: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string;
  date: string; // YYYY-MM-DD
  status: "Taken" | "Skipped" | "Snoozed" | "Pending";
  actionTime?: string;
}

const MEDICATIONS_FILE = path.join(DATA_DIR, "medications.json");
const MED_LOGS_FILE = path.join(DATA_DIR, "medication_logs.json");

export function readMedications(): MedicationModel[] {
  try {
    if (!fs.existsSync(MEDICATIONS_FILE)) {
      fs.writeFileSync(MEDICATIONS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const content = fs.readFileSync(MEDICATIONS_FILE, "utf-8");
    return JSON.parse(content || "[]");
  } catch (error) {
    console.error("Error reading medications file:", error);
    return [];
  }
}

export function writeMedications(records: MedicationModel[]): void {
  try {
    const tempFile = MEDICATIONS_FILE + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(records, null, 2), "utf-8");
    fs.renameSync(tempFile, MEDICATIONS_FILE);
  } catch (error) {
    console.error("Error persisting medications:", error);
  }
}

export function readMedicationLogs(): MedicationLogModel[] {
  try {
    if (!fs.existsSync(MED_LOGS_FILE)) {
      fs.writeFileSync(MED_LOGS_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const content = fs.readFileSync(MED_LOGS_FILE, "utf-8");
    return JSON.parse(content || "[]");
  } catch (error) {
    console.error("Error reading medication logs file:", error);
    return [];
  }
}

export function writeMedicationLogs(records: MedicationLogModel[]): void {
  try {
    const tempFile = MED_LOGS_FILE + ".tmp";
    fs.writeFileSync(tempFile, JSON.stringify(records, null, 2), "utf-8");
    fs.renameSync(tempFile, MED_LOGS_FILE);
  } catch (error) {
    console.error("Error persisting medication logs:", error);
  }
}

export const MedicationRepository = {
  async findByUserId(userId: string): Promise<MedicationModel[]> {
    if (isFirebaseActive && firestoreDb) {
      try {
        const ref = firestoreDb.collection("medications");
        const snap = await ref.where("userId", "==", userId).get();
        if (!snap.empty) {
          const records: MedicationModel[] = [];
          snap.forEach((doc: any) => {
            records.push({ ...doc.data(), id: doc.id } as MedicationModel);
          });
          return records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }
      } catch (err) {
        checkAndHandleError(err, OperationType.LIST, "medications", userId);
        console.error("Error loading medications from Firebase:", err);
      }
    }
    const list = readMedications();
    return list
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async create(record: Omit<MedicationModel, "id" | "createdAt" | "updatedAt">): Promise<MedicationModel> {
    const now = new Date().toISOString();
    const id = "med_" + Math.random().toString(36).substring(2, 11);
    const newRecord: MedicationModel = {
      ...record,
      id,
      createdAt: now,
      updatedAt: now,
    };

    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("medications").doc(id).set(newRecord);
      } catch (err) {
        checkAndHandleError(err, OperationType.CREATE, `medications/${id}`, record.userId);
        console.error("Error creating medication in Firebase:", err);
      }
    }

    const list = readMedications();
    list.push(newRecord);
    writeMedications(list);
    return newRecord;
  },

  async delete(id: string, userId: string): Promise<void> {
    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("medications").doc(id).delete();
      } catch (err) {
        checkAndHandleError(err, OperationType.DELETE, `medications/${id}`, userId);
        console.error("Error deleting medication from Firebase:", err);
      }
    }

    const list = readMedications();
    const filtered = list.filter(m => m.id !== id);
    writeMedications(filtered);
  },

  async update(id: string, userId: string, updates: Partial<Omit<MedicationModel, "id" | "userId" | "createdAt">>): Promise<MedicationModel> {
    const now = new Date().toISOString();
    
    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("medications").doc(id).update({
          ...updates,
          updatedAt: now
        });
      } catch (err) {
        checkAndHandleError(err, OperationType.UPDATE, `medications/${id}`, userId);
        console.error("Error updating medication in Firebase:", err);
      }
    }

    const list = readMedications();
    const index = list.findIndex(m => m.id === id);
    if (index === -1) {
      throw new Error("Medication not found");
    }

    const updated: MedicationModel = {
      ...list[index],
      ...updates,
      updatedAt: now
    };

    list[index] = updated;
    writeMedications(list);
    return updated;
  }
};

export const MedicationLogRepository = {
  async findByUserId(userId: string): Promise<MedicationLogModel[]> {
    if (isFirebaseActive && firestoreDb) {
      try {
        const ref = firestoreDb.collection("medicationLogs");
        const snap = await ref.where("userId", "==", userId).get();
        if (!snap.empty) {
          const records: MedicationLogModel[] = [];
          snap.forEach((doc: any) => {
            records.push({ ...doc.data(), id: doc.id } as MedicationLogModel);
          });
          return records;
        }
      } catch (err) {
        checkAndHandleError(err, OperationType.LIST, "medicationLogs", userId);
        console.error("Error loading medication logs from Firebase:", err);
      }
    }
    const list = readMedicationLogs();
    return list.filter(m => m.userId === userId);
  },

  async findByDate(userId: string, date: string): Promise<MedicationLogModel[]> {
    if (isFirebaseActive && firestoreDb) {
      try {
        const ref = firestoreDb.collection("medicationLogs");
        const snap = await ref.where("userId", "==", userId).where("date", "==", date).get();
        if (!snap.empty) {
          const records: MedicationLogModel[] = [];
          snap.forEach((doc: any) => {
            records.push({ ...doc.data(), id: doc.id } as MedicationLogModel);
          });
          return records;
        }
      } catch (err) {
        checkAndHandleError(err, OperationType.LIST, "medicationLogs", userId);
        console.error("Error loading logs by date from Firebase:", err);
      }
    }
    const list = readMedicationLogs();
    return list.filter(m => m.userId === userId && m.date === date);
  },

  async create(record: Omit<MedicationLogModel, "id">): Promise<MedicationLogModel> {
    const id = "log_" + Math.random().toString(36).substring(2, 11);
    const newRecord: MedicationLogModel = {
      ...record,
      id,
    };

    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("medicationLogs").doc(id).set(newRecord);
      } catch (err) {
        checkAndHandleError(err, OperationType.CREATE, `medicationLogs/${id}`, record.userId);
        console.error("Error creating medication log in Firebase:", err);
      }
    }

    const list = readMedicationLogs();
    list.push(newRecord);
    writeMedicationLogs(list);
    return newRecord;
  },

  async updateStatus(id: string, status: "Taken" | "Skipped" | "Snoozed" | "Pending", userId: string, actionTime?: string): Promise<void> {
    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("medicationLogs").doc(id).update({
          status,
          actionTime: actionTime || new Date().toISOString()
        });
      } catch (err) {
        checkAndHandleError(err, OperationType.UPDATE, `medicationLogs/${id}`, userId);
        console.error("Error updating medication log status in Firebase:", err);
      }
    }

    const list = readMedicationLogs();
    const index = list.findIndex(l => l.id === id);
    if (index !== -1) {
      list[index].status = status;
      list[index].actionTime = actionTime || new Date().toISOString();
      writeMedicationLogs(list);
    }
  },

  async createMany(records: Omit<MedicationLogModel, "id">[]): Promise<MedicationLogModel[]> {
    const created: MedicationLogModel[] = [];
    const list = readMedicationLogs();

    for (const record of records) {
      const id = "log_" + Math.random().toString(36).substring(2, 11);
      const newRecord: MedicationLogModel = {
        ...record,
        id,
      };
      created.push(newRecord);

      if (isFirebaseActive && firestoreDb) {
        try {
          await firestoreDb.collection("medicationLogs").doc(id).set(newRecord);
        } catch (err) {
          console.error("Error creating medication log in bulk in Firebase:", err);
        }
      }
      list.push(newRecord);
    }

    writeMedicationLogs(list);
    return created;
  },

  async updateLog(id: string, userId: string, updates: Partial<Omit<MedicationLogModel, "id" | "userId">>): Promise<void> {
    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("medicationLogs").doc(id).update(updates);
      } catch (err) {
        checkAndHandleError(err, OperationType.UPDATE, `medicationLogs/${id}`, userId);
        console.error("Error updating medication log in Firebase:", err);
      }
    }

    const list = readMedicationLogs();
    const index = list.findIndex(l => l.id === id);
    if (index !== -1) {
      list[index] = {
        ...list[index],
        ...updates
      };
      writeMedicationLogs(list);
    }
  },

  async deleteLog(id: string, userId: string): Promise<void> {
    if (isFirebaseActive && firestoreDb) {
      try {
        await firestoreDb.collection("medicationLogs").doc(id).delete();
      } catch (err) {
        checkAndHandleError(err, OperationType.DELETE, `medicationLogs/${id}`, userId);
        console.error("Error deleting medication log from Firebase:", err);
      }
    }

    const list = readMedicationLogs();
    const filtered = list.filter(l => l.id !== id);
    writeMedicationLogs(filtered);
  }
};


