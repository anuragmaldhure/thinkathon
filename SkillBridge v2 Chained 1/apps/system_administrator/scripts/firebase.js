/**
 * @fileoverview Centralized Firebase initialization.
 * Exports BOTH Firestore variants:
 *  - dbLite: Firestore Lite (REST-only, no realtime/offline) → dashboards/read-mostly
 *  - db:     Full Firestore (realtime/offline/transactions)  → CRUD/realtime pages
 *
 * Why both?
 * Lite cuts bundle & startup time and avoids main-thread churn for dashboards.
 * Full SDK is reserved for screens that truly need listeners/transactions/offline.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js';

// Full Firestore (realtime/offline/etc.)
import {
  initializeFirestore,
  // If you enable offline elsewhere, you may import enableIndexedDbPersistence here.
} from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

// Firestore Lite (REST-only; no listeners/offline) - using regular getFirestore for database ID support
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js';

import { env } from './env.js';

/** Firebase configuration from env */
const firebaseConfig = {
  apiKey: env.FIREBASE_CONFIG.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_CONFIG.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_CONFIG.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_CONFIG.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_CONFIG.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_CONFIG.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_CONFIG.MEASUREMENT_ID,
};

/** Single App instance */
export const app = initializeApp(firebaseConfig);

/** Auth instance (shared by both Firestore clients) */
export const auth = getAuth(app);

/** Storage instance */
export const storage = getStorage(
  app,
  env?.FIREBASE_CONFIG?.FIREBASE_STORAGE_BUCKET ?? 'default',
);

/**
 * FULL Firestore instance.
 * Keep your existing long-polling workaround for tricky networks.
 * You can switch to experimentalAutoDetectLongPolling if desired (cannot combine).
 *
 * Note: The third parameter is an optional databaseId; keep your custom name.
 */
export const db = initializeFirestore(
  app,
  {
    // Pick ONE of the following based on your environment:
    experimentalForceLongPolling: true, // forces long-polling for onSnapshot transport
    // experimentalAutoDetectLongPolling: true, // (alternative) auto-detect when needed
  },
  env?.FIREBASE_CONFIG?.FIRESTORE_DB_NAME ?? 'gen-app-db-1',
);

/**
 * LITE Firestore instance (REST-only).
 * - No onSnapshot / offline persistence / latency compensation.
 * - Smaller bundle & faster startup → ideal for dashboards & one-shot reads.
 * - Works with getDoc/getDocs/query/where/orderBy/limit and getCountFromServer().
 * - Now uses the same database ID as the full Firestore instance.
 */
export const dbLite = getFirestore(
  app,
  env?.FIREBASE_CONFIG?.FIRESTORE_DB_NAME ?? 'gen-app-db-1',
);

/**
 * Helper: choose Firestore by mode.
 *  - "dashboard" | "readonly" → Lite
 *  - "crud" | "realtime"       → Full
 *  - default                    → Lite (safe for most pages)
 * // mode = 'dashboard' --- removing because pausing lite
 */
export function getDb() {
  return db;
}

export function getDbLite() {
  return dbLite;
}

/**
 * Convenience booleans for generators/templates:
 * Use to guard features (e.g., disable listeners on Lite).
 */
export const FIRESTORE_FEATURES = Object.freeze({
  lite: {
    realtime: false,
    offlinePersistence: false,
    transactions: false, // not available in Lite
    batchedWrites: false, // not available in Lite
    countAggregations: true,
  },
  full: {
    realtime: true,
    offlinePersistence: true,
    transactions: true,
    batchedWrites: true,
    countAggregations: true,
  },
});
