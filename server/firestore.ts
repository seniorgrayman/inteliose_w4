import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB6xa1zN7h81YSj3t8apuRwnfL1EstsiUI",
  authDomain: "dao-intellis.firebaseapp.com",
  projectId: "dao-intellis",
  storageBucket: "dao-intellis.firebasestorage.app",
  messagingSenderId: "606242044926",
  appId: "1:606242044926:web:77c4fc8c42b26e8b081eaf",
  measurementId: "G-KF1FRDFH1N",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
