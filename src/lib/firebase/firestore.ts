import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import type { ProfilePayload } from "@/lib/intel/types";
import { firebaseApp } from "./client";

export const db = getFirestore(firebaseApp);

export type UserDoc = {
  // Email is always stored at account creation, but merge writes may omit it.
  email?: string;
  profile?: ProfilePayload;
  createdAt?: unknown;
  lastLoginAt?: unknown;
  updatedAt?: unknown;
};

export async function userDocExists(uid: string) {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  return snap.exists();
}

export async function upsertUserDoc(uid: string, email: string) {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      email,
      lastLoginAt: serverTimestamp(),
    } satisfies UserDoc,
    { merge: true }
  );
}

export async function createUserDoc(uid: string, email: string) {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      email,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    } satisfies UserDoc,
    { merge: false }
  );
}

export async function saveProfileForUser(uid: string, profile: ProfilePayload) {
  // MVP: store everything alongside email in users/{uid}
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      profile,
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    } satisfies UserDoc,
    { merge: true }
  );
}

export async function loadProfileForUser(uid: string): Promise<ProfilePayload | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data() as UserDoc;
  return data.profile ?? null;
}

export type MarketCapSnapshotDoc = {
  marketCap: number | null;
  fetchedAt: string; // ISO
  tMs: number; // client timestamp for easy range queries
  createdAt?: unknown;
};

export async function appendMarketCapSnapshot(opts: {
  uid: string;
  mint: string;
  marketCap: number | null;
  fetchedAt: string;
}) {
  const { uid, mint, marketCap, fetchedAt } = opts;
  // Store snapshots under users/{uid}/mints/{mint}/marketCapSnapshots to avoid
  // cross-field composite index requirements when querying history.
  const ref = collection(db, "users", uid, "mints", mint, "marketCapSnapshots");
  await addDoc(ref, {
    marketCap,
    fetchedAt,
    tMs: Date.now(),
    createdAt: serverTimestamp(),
  } satisfies MarketCapSnapshotDoc);
}

function pickClosestSnapshot(
  snaps: Array<MarketCapSnapshotDoc>,
  targetMs: number
): MarketCapSnapshotDoc | null {
  let best: MarketCapSnapshotDoc | null = null;
  let bestDist = Infinity;
  for (const s of snaps) {
    const dist = Math.abs(s.tMs - targetMs);
    if (dist < bestDist) {
      best = s;
      bestDist = dist;
    }
  }
  return best;
}

export async function getMarketCapHistory(opts: {
  uid: string;
  mint: string;
  points: Array<{ label: "24h" | "15h" | "8h" | "2h" | "1h" | "20s"; agoSeconds: number }>;
}) {
  const { uid, mint, points } = opts;
  const nowMs = Date.now();
  const maxAgo = Math.max(...points.map((p) => p.agoSeconds));
  const cutoffMs = nowMs - maxAgo * 1000 - 5 * 60 * 1000; // small buffer

  const ref = collection(db, "users", uid, "mints", mint, "marketCapSnapshots");
  const q = query(
    ref,
    where("tMs", ">=", cutoffMs),
    orderBy("tMs", "asc")
  );
  const snap = await getDocs(q);
  const snaps = snap.docs.map((d) => d.data() as MarketCapSnapshotDoc);

  return points.map((p) => {
    const targetMs = nowMs - p.agoSeconds * 1000;
    const closest = pickClosestSnapshot(snaps, targetMs);
    return {
      label: p.label,
      agoSeconds: p.agoSeconds,
      at: closest ? new Date(closest.tMs).toISOString() : null,
      marketCap: closest?.marketCap ?? null,
    };
  });
}

export type DyorSearchDoc = {
  mint: string;
  devWallet?: string | null;
  marketingWallet?: string | null;
  searchedAt?: unknown;
};

export async function recordDyorSearch(opts: {
  mint: string;
  devWallet?: string;
  marketingWallet?: string;
}) {
  const { mint, devWallet, marketingWallet } = opts;
  
  // Build the document, only including defined fields
  const docData: any = {
    mint,
    searchedAt: serverTimestamp(),
  };
  
  // Only add optional fields if they're provided
  if (devWallet) docData.devWallet = devWallet;
  if (marketingWallet) docData.marketingWallet = marketingWallet;
  
  // Store all DYOR searches in a single collection
  const ref = collection(db, "dyorSearches");
  const result = await addDoc(ref, docData);
  return result;
}

export async function getDyorSearchHistory(opts?: { limit?: number }) {
  const { limit = 100 } = opts ?? {};
  const ref = collection(db, "dyorSearches");
  const q = query(ref, orderBy("searchedAt", "desc"));
  const snap = await getDocs(q);
  const docs = snap.docs.map((doc) => doc.data() as DyorSearchDoc);
  return docs.slice(0, limit);
}

