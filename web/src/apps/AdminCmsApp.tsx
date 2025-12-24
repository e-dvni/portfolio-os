import { useEffect, useMemo, useState } from "react";
import {
  API_BASE,
  adminCreateProject,
  adminDeleteProject,
  adminFetchProjects,
  adminUpdateNote,
  adminUpdateProject,
  apiErrorMessage,
  apiErrorStatus,
  type ProjectDTO,
} from "../data/api";

type LoginResp = { token: string; email: string };
type NoteResp = { title: string; body: string };

type Tab = "notes" | "projects";

const STORAGE_KEY = "portfolio_admin_token";

const emptyStrToNull = (s: string): string | null => {
  const v = s.trim();
  return v.length ? v : null;
};

const parseHighlights = (s: string): string[] =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const stringifyHighlights = (arr: string[]): string => arr.join(", ");

/** Notes you can edit in CMS */
const NOTE_OPTIONS: { slug: string; label: string }[] = [
  { slug: "about", label: "About Me" },
  { slug: "edu-cs50", label: "Harvard CS50" },
  { slug: "edu-learn-academy", label: "LEARN Academy (Frontend)" },
  { slug: "edu-kean", label: "Kean University — Accounting" },
];

export function AdminCmsApp() {
  const [tab, setTab] = useState<Tab>("notes");

  // auth
  const [email, setEmail] = useState("danielslee078@gmail.com");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? "");
  const [status, setStatus] = useState("");

  const authed = token.length > 0;

  // notes
  const [noteSlug, setNoteSlug] = useState<string>("about");
  const [noteTitle, setNoteTitle] = useState("About Me");
  const [noteBody, setNoteBody] = useState("");
  const [loadingNote, setLoadingNote] = useState(false);

  // projects
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  /* ---------------- Effects ---------------- */

  // Load selected note (after auth)
  useEffect(() => {
    if (!authed) return;
    if (tab !== "notes") return;

    let alive = true;

    (async () => {
      setLoadingNote(true);
      try {
        const res = await fetch(`${API_BASE}/api/notes/${encodeURIComponent(noteSlug)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as NoteResp;

        if (!alive) return;
        setNoteTitle(data.title);
        setNoteBody(data.body);
        setStatus("");
      } catch (err: unknown) {
        if (!alive) return;
        setStatus(err instanceof Error ? err.message : "Failed to load note.");
      } finally {
        if (alive) setLoadingNote(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [authed, tab, noteSlug]);

  // Load Projects when tab becomes active
  useEffect(() => {
    if (!authed || tab !== "projects") return;

    let alive = true;

    (async () => {
      setLoadingProjects(true);
      try {
        const data = await adminFetchProjects(token);
        if (!alive) return;

        setProjects(data);
        setActiveProjectId(data[0]?.id ?? null);
        setStatus("");
      } catch (err: unknown) {
        if (!alive) return;

        if (apiErrorStatus(err) === 401) {
          doLogout("Session expired. Please log in again.");
          return;
        }

        setStatus(apiErrorMessage(err));
      } finally {
        if (alive) setLoadingProjects(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [authed, tab, token]);

  /* ---------------- Auth ---------------- */

  const doLogout = (msg = "Logged out.") => {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setProjects([]);
    setActiveProjectId(null);
    setTab("notes");
    setStatus(msg);
  };

  const login = async () => {
    setStatus("Logging in…");
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`${res.status} ${res.statusText}${body ? ` — ${body}` : ""}`);
      }

      const data = (await res.json()) as LoginResp;

      localStorage.setItem(STORAGE_KEY, data.token);
      setToken(data.token);
      setPassword("");
      setStatus(`Logged in as ${data.email}`);
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : "Login failed.");
    }
  };

  /* ---------------- Notes ---------------- */

  const saveNote = async () => {
    setStatus(`Saving "${noteSlug}"…`);
    try {
      await adminUpdateNote(token, noteSlug, { title: noteTitle, body: noteBody });
      setStatus("Note saved ✅");
    } catch (err: unknown) {
      if (apiErrorStatus(err) === 401) {
        doLogout("Session expired. Please log in again.");
        return;
      }
      setStatus(apiErrorMessage(err));
    }
  };

  /* ---------------- Projects ---------------- */

  const setProjectPatch = (patch: Partial<ProjectDTO>) => {
    if (!activeProject) return;
    setProjects((prev) => prev.map((p) => (p.id === activeProject.id ? { ...p, ...patch } : p)));
  };

  const refreshProjects = async () => {
    setLoadingProjects(true);
    try {
      const data = await adminFetchProjects(token);
      setProjects(data);
      setActiveProjectId((prevId) => data.find((p) => p.id === prevId)?.id ?? data[0]?.id ?? null);
      setStatus("Projects refreshed ✅");
    } catch (err: unknown) {
      if (apiErrorStatus(err) === 401) {
        doLogout("Session expired. Please log in again.");
        return;
      }
      setStatus(apiErrorMessage(err));
    } finally {
      setLoadingProjects(false);
    }
  };

  const addProject = async () => {
    setStatus("Creating project…");
    try {
      const created = await adminCreateProject(token, {
        title: "New Project",
        subtitle: null,
        tech_stack: null,
        summary: null,
        repo_url: null,
        live_url: null,
        order_index: (projects.at(-1)?.order_index ?? projects.length) + 1,
        highlights: [],
        media: [],
      });

      setProjects((prev) => [...prev, created]);
      setActiveProjectId(created.id);
      setStatus("Project created ✅");
    } catch (err: unknown) {
      setStatus(apiErrorMessage(err));
    }
  };

  const saveProject = async () => {
    if (!activeProject) return;
    setStatus("Saving project…");

    try {
      const updated = await adminUpdateProject(token, activeProject.id, activeProject);
      setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setStatus("Project saved ✅");
    } catch (err: unknown) {
      if (apiErrorStatus(err) === 401) {
        doLogout("Session expired. Please log in again.");
        return;
      }
      setStatus(apiErrorMessage(err));
    }
  };

  const deleteProject = async () => {
    if (!activeProject) return;
    const ok = window.confirm(`Delete "${activeProject.title}"?`);
    if (!ok) return;

    setStatus("Deleting…");
    try {
      await adminDeleteProject(token, activeProject.id);
      setProjects((prev) => prev.filter((p) => p.id !== activeProject.id));

      setActiveProjectId((prevId) => {
        const remaining = projects.filter((p) => p.id !== prevId);
        return remaining[0]?.id ?? null;
      });

      setStatus("Project deleted ✅");
    } catch (err: unknown) {
      if (apiErrorStatus(err) === 401) {
        doLogout("Session expired. Please log in again.");
        return;
      }
      setStatus(apiErrorMessage(err));
    }
  };

  /* ---------------- Render ---------------- */

  return (
    <div style={{ padding: 16, height: "100%", display: "grid", gridTemplateRows: "auto auto 1fr auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h3 style={{ margin: 0 }}>Admin CMS</h3>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          {authed ? "Authenticated" : "Not logged in"}
        </div>
      </div>

      {/* Tabs */}
      {authed && (
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <TabButton active={tab === "notes"} onClick={() => setTab("notes")}>
            Notes
          </TabButton>
          <TabButton active={tab === "projects"} onClick={() => setTab("projects")}>
            Projects
          </TabButton>

          <button onClick={() => doLogout()} style={{ ...btnStyle, marginLeft: "auto" }}>
            Logout
          </button>
        </div>
      )}

      {/* Content */}
      {!authed ? (
        <LoginForm
          email={email}
          password={password}
          setEmail={setEmail}
          setPassword={setPassword}
          onLogin={login}
        />
      ) : tab === "notes" ? (
        <NotesEditor
          noteSlug={noteSlug}
          setNoteSlug={setNoteSlug}
          noteTitle={noteTitle}
          setNoteTitle={setNoteTitle}
          noteBody={noteBody}
          setNoteBody={setNoteBody}
          onSave={saveNote}
          loading={loadingNote}
        />
      ) : (
        <ProjectsEditor
          projects={projects}
          activeProject={activeProject}
          setActiveProjectId={setActiveProjectId}
          loading={loadingProjects}
          onRefresh={refreshProjects}
          onAdd={addProject}
          onSave={saveProject}
          onDelete={deleteProject}
          onPatch={setProjectPatch}
        />
      )}

      {/* Status */}
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{status}</div>
    </div>
  );
}

/* ---------------- Subcomponents ---------------- */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...btnStyle,
        background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
      }}
    >
      {children}
    </button>
  );
}

function LoginForm({
  email,
  password,
  setEmail,
  setPassword,
  onLogin,
}: {
  email: string;
  password: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  onLogin: () => void;
}) {
  return (
    <div style={{ maxWidth: 420, marginTop: 20, display: "grid", gap: 10 }}>
      <label style={labelStyle}>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
      </label>

      <label style={labelStyle}>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
      </label>

      <button onClick={onLogin} style={btnStyle}>
        Login
      </button>
    </div>
  );
}

function NotesEditor({
  noteSlug,
  setNoteSlug,
  noteTitle,
  setNoteTitle,
  noteBody,
  setNoteBody,
  onSave,
  loading,
}: {
  noteSlug: string;
  setNoteSlug: (v: string) => void;
  noteTitle: string;
  setNoteTitle: (v: string) => void;
  noteBody: string;
  setNoteBody: (v: string) => void;
  onSave: () => void;
  loading: boolean;
}) {
  return (
    <div style={{ marginTop: 14, display: "grid", gap: 10, maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Edit Note</div>
        {loading && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>Loading…</div>}
        <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
          Slug:
        </div>
        <select
          value={noteSlug}
          onChange={(e) => setNoteSlug(e.target.value)}
          style={{ ...inputStyle, width: 260, padding: "8px 10px" }}
        >
          {NOTE_OPTIONS.map((o) => (
            <option key={o.slug} value={o.slug}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} style={inputStyle} />

      <textarea
        value={noteBody}
        onChange={(e) => setNoteBody(e.target.value)}
        style={{ ...inputStyle, minHeight: 260, resize: "vertical" }}
      />

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onSave} style={btnStyle}>
          Save Note
        </button>
      </div>
    </div>
  );
}

function ProjectsEditor({
  projects,
  activeProject,
  setActiveProjectId,
  loading,
  onRefresh,
  onAdd,
  onSave,
  onDelete,
  onPatch,
}: {
  projects: ProjectDTO[];
  activeProject: ProjectDTO | null;
  setActiveProjectId: (id: number) => void;
  loading: boolean;
  onRefresh: () => void;
  onAdd: () => void;
  onSave: () => void;
  onDelete: () => void;
  onPatch: (patch: Partial<ProjectDTO>) => void;
}) {
  return (
    <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "280px 1fr", gap: 12 }}>
      {/* Left list */}
      <div style={{ display: "grid", gap: 10 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={onAdd} style={btnStyle}>
            + New
          </button>
          <button onClick={onRefresh} style={btnStyle}>
            Refresh
          </button>
        </div>

        <div
          style={{
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 14,
            overflow: "hidden",
            background: "rgba(0,0,0,0.18)",
          }}
        >
          {loading ? (
            <div style={{ padding: 12, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
              Loading projects…
            </div>
          ) : (
            projects.map((p: ProjectDTO) => {
              const active = activeProject?.id === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProjectId(p.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "10px 12px",
                    border: "none",
                    cursor: "pointer",
                    background: active ? "rgba(255,255,255,0.10)" : "transparent",
                    color: "rgba(255,255,255,0.9)",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{p.title}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                    #{p.order_index ?? "—"} • {p.tech_stack ?? "No stack"}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Right editor */}
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 14,
          padding: 12,
          background: "rgba(0,0,0,0.18)",
          minHeight: 420,
          overflow: "auto",
          maxHeight: "100%",
        }}
      >
        {!activeProject ? (
          <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>Select a project to edit</div>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "grid", gap: 6 }}>
              <div style={smallLabel}>Title</div>
              <input
                value={activeProject.title}
                onChange={(e) => onPatch({ title: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <div style={smallLabel}>Subtitle</div>
              <input
                value={activeProject.subtitle ?? ""}
                onChange={(e) => onPatch({ subtitle: emptyStrToNull(e.target.value) })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <div style={smallLabel}>Tech Stack</div>
              <input
                value={activeProject.tech_stack ?? ""}
                onChange={(e) => onPatch({ tech_stack: emptyStrToNull(e.target.value) })}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gap: 6 }}>
              <div style={smallLabel}>Summary</div>
              <textarea
                value={activeProject.summary ?? ""}
                onChange={(e) => onPatch({ summary: emptyStrToNull(e.target.value) })}
                style={{ ...inputStyle, minHeight: 130, resize: "vertical" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={smallLabel}>Repo URL</div>
                <input
                  value={activeProject.repo_url ?? ""}
                  onChange={(e) => onPatch({ repo_url: emptyStrToNull(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <div style={smallLabel}>Live URL</div>
                <input
                  value={activeProject.live_url ?? ""}
                  onChange={(e) => onPatch({ live_url: emptyStrToNull(e.target.value) })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 10 }}>
              <div style={{ display: "grid", gap: 6 }}>
                <div style={smallLabel}>Order</div>
                <input
                  type="number"
                  value={activeProject.order_index ?? 0}
                  onChange={(e) => onPatch({ order_index: Number(e.target.value) })}
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gap: 6 }}>
                <div style={smallLabel}>Highlights (comma separated)</div>
                <input
                  value={stringifyHighlights(activeProject.highlights ?? [])}
                  onChange={(e) => onPatch({ highlights: parseHighlights(e.target.value) })}
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button onClick={onSave} style={btnStyle}>
                Save Project
              </button>
              <button onClick={onDelete} style={{ ...btnStyle, background: "rgba(255,0,0,0.14)" }}>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Styles ---------------- */

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.75)",
  display: "grid",
  gap: 6,
};

const smallLabel: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(255,255,255,0.65)",
};

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "rgba(255,255,255,0.92)",
  outline: "none",
};

const btnStyle: React.CSSProperties = {
  padding: "8px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.10)",
  color: "rgba(255,255,255,0.92)",
  cursor: "pointer",
  fontWeight: 650,
};
