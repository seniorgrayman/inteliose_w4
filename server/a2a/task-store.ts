import type { Task, TaskState, Message, Artifact } from "./types.js";
import crypto from "crypto";

/**
 * In-memory task store for A2A tasks
 * Can be replaced with Firebase/Redis for persistence
 */
export class TaskStore {
  private tasks: Map<string, Task> = new Map();

  createTask(contextId?: string): Task {
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
    this.tasks.set(id, task);
    return task;
  }

  getTask(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  updateStatus(id: string, state: TaskState, message?: Message): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    task.status = {
      state,
      message,
      timestamp: new Date().toISOString(),
    };
    task.updatedAt = new Date().toISOString();
    return task;
  }

  addMessage(id: string, message: Message): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    task.messages.push(message);
    task.updatedAt = new Date().toISOString();
    return task;
  }

  addArtifact(id: string, artifact: Artifact): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    task.artifacts.push(artifact);
    task.updatedAt = new Date().toISOString();
    return task;
  }

  listTasks(limit = 50, offset = 0): Task[] {
    const all = Array.from(this.tasks.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return all.slice(offset, offset + limit);
  }

  getStats() {
    const tasks = Array.from(this.tasks.values());
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status.state === "pending").length,
      working: tasks.filter((t) => t.status.state === "working").length,
      completed: tasks.filter((t) => t.status.state === "completed").length,
      failed: tasks.filter((t) => t.status.state === "failed").length,
    };
  }
}
