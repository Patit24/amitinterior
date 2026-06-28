import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const defaultFirebaseConfig = {
  apiKey: "AIzaSyCJTJGkjGh-NU6xAJNfp3vKp9t8Fasa8i0",
  authDomain: "amitsaha-interior.firebaseapp.com",
  projectId: "amitsaha-interior",
  storageBucket: "amitsaha-interior.firebasestorage.app",
  messagingSenderId: "238410650371",
  appId: "1:238410650371:web:684b7d22d03797eaaf8f36",
  measurementId: "G-DRV4LGBVQ9",
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultFirebaseConfig.measurementId,
};

export const firebaseReady = Object.values(firebaseConfig).every(Boolean);

let app;
let auth;
let db;
let storage;
let analytics;

if (firebaseReady) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  isSupported().then((supported) => {
    if (supported) analytics = getAnalytics(app);
  });
}

export { analytics, app, auth, db, storage };
