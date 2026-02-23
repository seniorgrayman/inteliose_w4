import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Analytics must only run in the browser.
let analytics: unknown | null = null;

const firebaseConfig = {
  apiKey: "AIzaSyB6xa1zN7h81YSj3t8apuRwnfL1EstsiUI",
  authDomain: "dao-intellis.firebaseapp.com",
  projectId: "dao-intellis",
  storageBucket: "dao-intellis.firebasestorage.app",
  messagingSenderId: "606242044926",
  appId: "1:606242044926:web:77c4fc8c42b26e8b081eaf",
  measurementId: "G-KF1FRDFH1N",
};

// Force initialize with the correct project (dao-intellis)
let firebaseAppInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const firebaseApp = firebaseAppInstance;
export const firebaseAuth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

export async function getFirebaseAnalytics() {
  if (typeof window === "undefined") return null;
  if (analytics) return analytics;
  const mod = await import("firebase/analytics");
  analytics = mod.getAnalytics(firebaseApp);
  return analytics;
}

