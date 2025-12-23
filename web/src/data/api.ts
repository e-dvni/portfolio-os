import type { ApiApp } from "./adapters";

export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

async function safeJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function fetchApps(): Promise<ApiApp[]> {
  const res = await fetch(`${API_BASE}/api/apps`);
  return safeJson<ApiApp[]>(res);
}
