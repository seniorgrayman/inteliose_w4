import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./client";
import type { Project, ProfileModel, SnapshotData, AiDiagnosis } from "@/types/profile";

const PROJECTS_COLLECTION = "projects";

export async function createProject(
  userId: string,
  profile: ProfileModel,
  snapshot?: SnapshotData,
  aiDiagnosis?: AiDiagnosis
): Promise<Project> {
  const projectId = doc(collection(db, PROJECTS_COLLECTION)).id;
  const now = Date.now();

  const project: Project = {
    id: projectId,
    userId,
    profile,
    snapshot,
    aiDiagnosis,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(db, PROJECTS_COLLECTION, projectId), {
    ...project,
    createdAt: Timestamp.fromDate(new Date(now)),
    updatedAt: Timestamp.fromDate(new Date(now)),
  });

  return project;
}

export async function updateProject(
  projectId: string,
  updates: Partial<Omit<Project, "id" | "userId" | "createdAt">>
): Promise<void> {
  await updateDoc(doc(db, PROJECTS_COLLECTION, projectId), {
    ...updates,
    updatedAt: Timestamp.fromDate(new Date()),
  });
}

export async function getProject(projectId: string): Promise<Project | null> {
  const docSnap = await getDoc(doc(db, PROJECTS_COLLECTION, projectId));
  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  return {
    ...data,
    createdAt: data.createdAt?.toMillis?.() || 0,
    updatedAt: data.updatedAt?.toMillis?.() || 0,
  } as Project;
}

export async function getUserProjects(userId: string): Promise<Project[]> {
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt?.toMillis?.() || 0,
      updatedAt: data.updatedAt?.toMillis?.() || 0,
    } as Project;
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db, PROJECTS_COLLECTION, projectId));
}

export async function getLatestProject(userId: string): Promise<Project | null> {
  const projects = await getUserProjects(userId);
  if (projects.length === 0) return null;
  return projects.sort((a, b) => b.updatedAt - a.updatedAt)[0];
}
