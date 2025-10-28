import { getAuth } from "./auth";

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
    let err: any = new Error(res.statusText || "Request failed");
    try {
      err = await res.json();
    } catch {
      err = await res.text() || res.statusText;
    }

    throw err;
  }

  // try to parse json, but return text if empty
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

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

export type TaskResponse = {
  id: number;
  title: string;
  description?: string | null;
  endDate?: string | null;
  createdAt: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  owner: string;
  assignees: string[];
}

export type GetTaskResponse = {
  tasks: TaskResponse[];
};

export type TaskPayload = {
  title: string;
  description?: string | null;
  endDate?: string | null;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  assignees?: string[];
};

export type CreateTaskPayload = TaskPayload;
export type UpdateTaskPayload = TaskPayload;

export async function getTasks(): Promise<GetTaskResponse> {
  const auth = getAuth();
  const headers: Record<string, string> = {};
  if (auth?.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  return request<GetTaskResponse>("/tasks", {
    method: "GET",
    headers,
  });
}

export async function createTask(payload: CreateTaskPayload): Promise<TaskResponse> {
  const auth = getAuth();
  const headers: Record<string, string> = {};
  if (auth?.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  return request<TaskResponse>("/tasks", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

export async function updateTask(taskId: string, payload: UpdateTaskPayload): Promise<TaskResponse> {
  const auth = getAuth();
  const headers: Record<string, string> = {};
  if (auth?.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }

  return request<TaskResponse>(`/tasks/${taskId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(payload),
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

export type GetUsernamesResponse = {
  usernames: string[];
};

export async function getUsernames(): Promise<GetUsernamesResponse> {
  const auth = getAuth();
  const headers: Record<string, string> = {};
  if (auth?.token) {
    headers["Authorization"] = `Bearer ${auth.token}`;
  }
  return request<GetUsernamesResponse>("/usernames", { headers });
}
