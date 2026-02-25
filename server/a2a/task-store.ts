import type { Task, TaskState, Message, Artifact } from "./types.js";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import { db } from "../firestore.js";
import crypto from "crypto";

const COLLECTION = "a2a_tasks";

/**
 * Firestore-backed task store for A2A tasks.
 * Uses the existing Firebase client SDK (same as the rest of the platform).
 */
export class TaskStore {
  private col() {
    return collection(db, COLLECTION);
  }

  async createTask(contextId?: string): Promise<Task> {
    const id = crypto.randomUUID();
    const task: Task = {
      id,
      contextId: contextId || crypto.randomUUID(),
      status: {
        state: "pending",
        timestamp: new Date().toISOString(),
      },
      messages: [],
      artifacts: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(doc(this.col(), id), task);
    return task;
  }

  async getTask(id: string): Promise<Task | undefined> {
    const snap = await getDoc(doc(this.col(), id));
    return snap.exists() ? (snap.data() as Task) : undefined;
  }

  async updateStatus(id: string, state: TaskState, message?: Message): Promise<Task | undefined> {
    const ref = doc(this.col(), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;

    const task = snap.data() as Task;
    const newStatus: Record<string, any> = { state, timestamp: new Date().toISOString() };
    if (message !== undefined) newStatus.message = message;
    task.status = newStatus as any;
    task.updatedAt = new Date().toISOString();
    await updateDoc(ref, {
      status: task.status,
      updatedAt: task.updatedAt,
    });
    return task;
  }

  async addMessage(id: string, message: Message): Promise<Task | undefined> {
    const ref = doc(this.col(), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;

    const task = snap.data() as Task;
    task.messages.push(message);
    task.updatedAt = new Date().toISOString();
    await updateDoc(ref, {
      messages: task.messages,
      updatedAt: task.updatedAt,
    });
    return task;
  }

  async addArtifact(id: string, artifact: Artifact): Promise<Task | undefined> {
    const ref = doc(this.col(), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return undefined;

    const task = snap.data() as Task;
    task.artifacts.push(artifact);
    task.updatedAt = new Date().toISOString();
    await updateDoc(ref, {
      artifacts: task.artifacts,
      updatedAt: task.updatedAt,
    });
    return task;
  }

  async listTasks(limit = 50): Promise<Task[]> {
    const q = query(this.col(), orderBy("createdAt", "desc"), firestoreLimit(limit));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as Task);
  }

  async getStats() {
    const snap = await getDocs(this.col());
    const tasks = snap.docs.map((d) => d.data() as Task);
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status.state === "pending").length,
      working: tasks.filter((t) => t.status.state === "working").length,
      completed: tasks.filter((t) => t.status.state === "completed").length,
      failed: tasks.filter((t) => t.status.state === "failed").length,
    };
  }
}
