/**
 * @fileoverview Centralized Firebase initialization for Navigator.
 * Exports Firebase Auth and Firestore instances.
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js';
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

/** Auth instance */
export const auth = getAuth(app);

/** Storage instance */
export const storage = getStorage(
  app,
  env?.FIREBASE_CONFIG?.FIREBASE_STORAGE_BUCKET ?? 'default',
);

/** Firestore instance */
export const db = getFirestore(
  app,
  env?.FIREBASE_CONFIG?.FIRESTORE_DB_NAME ?? 'skillbridge',
);
