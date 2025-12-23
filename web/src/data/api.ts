import type { ApiApp } from "./adapters";

export const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:3000";

async function safeJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* Apps */
export async function fetchApps(): Promise<ApiApp[]> {
  const res = await fetch(`${API_BASE}/api/apps`);
  return safeJson<ApiApp[]>(res);
}

/* Notes */
export async function fetchNote(slug: string): Promise<{ title: string; body: string }> {
  const res = await fetch(`${API_BASE}/api/notes/${slug}`);
  return safeJson(res);
}

export async function fetchProjects(): Promise<
  Array<{
    title: string;
    subtitle: string | null;
    tech_stack: string | null;
    summary: string | null;
    repo_url: string | null;
    live_url: string | null;
    highlights: unknown;
  }>
> {
  const res = await fetch(`${API_BASE}/api/projects`);
  return safeJson(res);
}
