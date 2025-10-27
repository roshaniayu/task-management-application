export type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export type SignInPayload = {
  username: string;
  password: string;
};

export type AuthResponse = {
  token: string;
  username: string;
};

const DEFAULT_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function request<T>(path: string, options: RequestInit = {}, base = DEFAULT_BASE): Promise<T> {
  const url = `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    let err: any = new Error(res.statusText || "Request failed");
    try {
      err = new Error(JSON.parse(text)?.message || text || res.statusText);
    } catch {
      err = new Error(text || res.statusText);
    }
    (err as any).status = res.status;
    throw err;
  }

  // try to parse json, but return text if empty
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

import { getAuth } from "./auth";

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signInUser(payload: SignInPayload): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export type ServerTask = {
  id: number;
  title: string;
  description?: string | null;
  endDate?: string | null;
  createdAt: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  owner: string;
  assignees: string[];
};

export type CreateTaskPayload = {
  title: string;
  description?: string | null;
  endDate?: string | null;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
};

/**
 * Fetch tasks for the authenticated user. Automatically adds Authorization header
 * when a token is present in local storage.
 */
export async function fetchTasks(): Promise<ServerTask[]> {
  const auth = getAuth();
  const headers: Record<string, string> = {};
  if (auth?.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  return request<ServerTask[]>("/tasks", {
    method: "GET",
    headers,
  });
}

export async function createTask(payload: CreateTaskPayload): Promise<ServerTask> {
  const auth = getAuth();
  const headers: Record<string, string> = {};
  if (auth?.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  return request<ServerTask>("/tasks", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

export async function updateTask(taskId: string, status: string): Promise<void> {
  const auth = getAuth();
  const headers: Record<string, string> = {};
  if (auth?.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  await request<void>(`/tasks/${taskId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ status }),
  });
}

export async function deleteTask(taskId: string): Promise<void> {
  const auth = getAuth();
  const headers: Record<string, string> = {};
  if (auth?.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  await request<void>(`/tasks/${taskId}`, {
    method: "DELETE",
    headers,
  });
}

export default {
  registerUser,
  signInUser,
};
