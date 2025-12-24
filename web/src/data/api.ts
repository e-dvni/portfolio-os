import type { ApiApp } from "./adapters";

export const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

/** ---------- Shared Types ---------- */

export type ApiError = {
  status: number;
  statusText: string;
  bodyText?: string;
};

export type NoteDTO = {
  title: string;
  body: string;
};

export type NoteSummaryDTO = {
  slug: string;
  title: string;
};

export type AdminNoteDTO = {
  slug: string;
  title: string;
  body: string;
};

export type ProjectDTO = {
  id: number;
  title: string;
  subtitle: string | null;
  tech_stack: string | null;
  summary: string | null;
  repo_url: string | null;
  live_url: string | null;
  order_index: number | null;
  highlights: string[];
  media: string[];
};

export type AdminLoginResponse = {
  token: string;
  email: string;
};

/** ---------- Error Helpers ---------- */

export function isApiError(x: unknown): x is ApiError {
  return (
    typeof x === "object" &&
    x !== null &&
    "status" in x &&
    "statusText" in x &&
    typeof (x as { status: unknown }).status === "number" &&
    typeof (x as { statusText: unknown }).statusText === "string"
  );
}

export function apiErrorMessage(err: unknown): string {
  if (isApiError(err)) {
    const extra = err.bodyText ? ` — ${err.bodyText}` : "";
    return `${err.status} ${err.statusText}${extra}`;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

export function apiErrorStatus(err: unknown): number | null {
  return isApiError(err) ? err.status : null;
}

async function textSafe(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

/**
 * Parse JSON or throw a typed ApiError. This is the one function everything uses.
 */
export async function safeJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const bodyText = await textSafe(res);
    const err: ApiError = {
      status: res.status,
      statusText: res.statusText,
      bodyText,
    };
    throw err;
  }
  return (await res.json()) as T;
}

/** ---------- Public (non-admin) API ---------- */

export async function fetchApps(): Promise<ApiApp[]> {
  const res = await fetch(`${API_BASE}/api/apps`);
  return safeJson<ApiApp[]>(res);
}

export async function fetchNotes(): Promise<NoteSummaryDTO[]> {
  const res = await fetch(`${API_BASE}/api/notes`);
  return safeJson<NoteSummaryDTO[]>(res);
}

export async function fetchNote(slug: string): Promise<NoteDTO> {
  const res = await fetch(`${API_BASE}/api/notes/${encodeURIComponent(slug)}`);
  return safeJson<NoteDTO>(res);
}

export async function fetchProjects(): Promise<ProjectDTO[]> {
  const res = await fetch(`${API_BASE}/api/projects`);
  return safeJson<ProjectDTO[]>(res);
}

/** ---------- Admin Auth ---------- */

export async function adminLogin(email: string, password: string): Promise<AdminLoginResponse> {
  const res = await fetch(`${API_BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  return safeJson<AdminLoginResponse>(res);
}

export async function adminMe(token: string): Promise<{ email: string }> {
  const res = await fetch(`${API_BASE}/api/admin/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return safeJson<{ email: string }>(res);
}

export async function adminLogout(token: string): Promise<{ ok: true } | { ok: boolean }> {
  const res = await fetch(`${API_BASE}/api/admin/logout`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  return safeJson<{ ok: true } | { ok: boolean }>(res);
}

/** ---------- Admin Notes ---------- */

export async function adminFetchNotes(token: string): Promise<AdminNoteDTO[]> {
  const res = await fetch(`${API_BASE}/api/admin/notes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return safeJson<AdminNoteDTO[]>(res);
}

export async function adminCreateNote(
  token: string,
  note: { slug: string; title: string; body: string }
): Promise<AdminNoteDTO> {
  const res = await fetch(`${API_BASE}/api/admin/notes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ note }),
  });

  return safeJson<AdminNoteDTO>(res);
}

export async function adminUpdateNote(
  token: string,
  slug: string,
  note: { title: string; body: string }
): Promise<NoteDTO> {
  const res = await fetch(`${API_BASE}/api/admin/notes/${encodeURIComponent(slug)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ note }),
  });

  return safeJson<NoteDTO>(res);
}

export async function adminDeleteNote(token: string, slug: string): Promise<{ ok: true }> {
  const res = await fetch(`${API_BASE}/api/admin/notes/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  return safeJson<{ ok: true }>(res);
}

/** ---------- Admin Projects CRUD ---------- */

export async function adminFetchProjects(token: string): Promise<ProjectDTO[]> {
  const res = await fetch(`${API_BASE}/api/admin/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return safeJson<ProjectDTO[]>(res);
}

export async function adminCreateProject(
  token: string,
  project: Partial<ProjectDTO>
): Promise<ProjectDTO> {
  const res = await fetch(`${API_BASE}/api/admin/projects`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ project }),
  });

  return safeJson<ProjectDTO>(res);
}

export async function adminUpdateProject(
  token: string,
  id: number,
  project: Partial<ProjectDTO>
): Promise<ProjectDTO> {
  const res = await fetch(`${API_BASE}/api/admin/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ project }),
  });

  return safeJson<ProjectDTO>(res);
}

export async function adminDeleteProject(token: string, id: number): Promise<{ ok: true }> {
  const res = await fetch(`${API_BASE}/api/admin/projects/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  return safeJson<{ ok: true }>(res);
}
