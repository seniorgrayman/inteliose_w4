"use client";

import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { firebaseAuth, getFirebaseAnalytics } from "./client";
import type { ProfilePayload } from "@/lib/intel/types";
import {
  createUserDoc,
  loadProfileForUser,
  upsertUserDoc,
  userDocExists,
  saveProfileForUser,
} from "./firestore";

export function subscribeToAuth(cb: (user: User | null) => void) {
  return onAuthStateChanged(firebaseAuth, cb);
}

export type SignInMode = "login" | "signup";

export async function signInWithGoogle({
  mode,
  profileToLockIn,
}: {
  mode: SignInMode;
  profileToLockIn?: ProfilePayload | null;
}) {
  // Initialize analytics lazily (browser-only).
  void getFirebaseAnalytics();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(firebaseAuth, provider);
  const user = cred.user;

  const email = user.email ?? "";
  if (!email) {
    await signOut(firebaseAuth);
    throw new Error("missing_email");
  }

  const exists = await userDocExists(user.uid);

  if (mode === "login") {
    if (!exists) {
      await signOut(firebaseAuth);
      throw new Error("no_account");
    }
    // Keep lastLogin fresh and store email alongside auth.
    await upsertUserDoc(user.uid, email);

    // Hydrate local dashboard state from Firestore (if present).
    const remote = await loadProfileForUser(user.uid);
    if (remote && typeof window !== "undefined") {
      window.localStorage.setItem("dao-intel:profile", JSON.stringify(remote));
    }
    return cred;
  }

  // signup mode: allow creating a user doc and storing profile
  if (!exists) {
    await createUserDoc(user.uid, email);
  } else {
    await upsertUserDoc(user.uid, email);
  }

  if (profileToLockIn) {
    await saveProfileForUser(user.uid, profileToLockIn);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("dao-intel:profile", JSON.stringify(profileToLockIn));
    }
  }

  return cred;
}

export async function signOutFirebase() {
  return await signOut(firebaseAuth);
}

