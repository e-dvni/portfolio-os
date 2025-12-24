import { useEffect, useMemo, useState } from "react";
import {
  API_BASE,
  adminCreateNote,
  adminDeleteNote,
  adminFetchNotes,
  adminUpdateNote,
  adminCreateProject,
  adminDeleteProject,
  adminFetchProjects,
  adminUpdateProject,
  apiErrorMessage,
  apiErrorStatus,
  type AdminNoteDTO,
  type ProjectDTO,
} from "../data/api";

type LoginResp = { token: string; email: string };

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

function normalizeSlug(s: string) {
  return s.trim().toLowerCase();
}

function isValidSlug(s: string) {
  // letters/numbers, hyphen/underscore allowed; must start with alnum
  return /^[a-z0-9][a-z0-9-_]*$/.test(s);
}

export function AdminCmsApp() {
  const [tab, setTab] = useState<Tab>("notes");

  // auth
  const [email, setEmail] = useState("danielslee078@gmail.com");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? "");
  const [status, setStatus] = useState("");

  const authed = token.length > 0;

  // notes list + editor
  const [notes, setNotes] = useState<AdminNoteDTO[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);

  const [noteSlug, setNoteSlug] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteBody, setNoteBody] = useState("");

  // create note
  const [newSlug, setNewSlug] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");

  // projects
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) ?? null,
    [projects, activeProjectId]
  );

  /* ---------------- Effects ---------------- */

  // Load notes when authed + in notes tab
  useEffect(() => {
    if (!authed || tab !== "notes") return;

    let alive = true;

    (async () => {
      setNotesLoading(true);
      try {
        const data = await adminFetchNotes(token);
        if (!alive) return;

        const sorted = data.slice().sort((a, b) => a.slug.localeCompare(b.slug));
        setNotes(sorted);

        // select first note if none selected
        const first = sorted[0];
        if (first && !noteSlug) {
          setNoteSlug(first.slug);
          setNoteTitle(first.title);
          setNoteBody(first.body);
        } else if (noteSlug) {
          const found = sorted.find((n) => n.slug === noteSlug);
          if (found) {
            setNoteTitle(found.title);
            setNoteBody(found.body);
          }
        }

        setStatus("");
      } catch (err: unknown) {
        if (!alive) return;

        if (apiErrorStatus(err) === 401) {
          doLogout("Session expired. Please log in again.");
          return;
        }

        setStatus(apiErrorMessage(err));
      } finally {
        if (alive) setNotesLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed, tab, token]);

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
    setNotes([]);
    setNoteSlug("");
    setNoteTitle("");
    setNoteBody("");
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

  /* ---------------- Notes CRUD ---------------- */

  const selectNote = (slug: string) => {
    setNoteSlug(slug);
    const found = notes.find((n) => n.slug === slug);
    if (found) {
      setNoteTitle(found.title);
      setNoteBody(found.body);
    }
  };

  const refreshNotes = async (msg = "") => {
    setNotesLoading(true);
    try {
      const data = await adminFetchNotes(token);
      const sorted = data.slice().sort((a, b) => a.slug.localeCompare(b.slug));
      setNotes(sorted);

      const still = sorted.find((n) => n.slug === noteSlug) ?? sorted[0];
      if (still) {
        setNoteSlug(still.slug);
        setNoteTitle(still.title);
        setNoteBody(still.body);
      } else {
        setNoteSlug("");
        setNoteTitle("");
        setNoteBody("");
      }

      if (msg) setStatus(msg);
    } catch (err: unknown) {
      if (apiErrorStatus(err) === 401) {
        doLogout("Session expired. Please log in again.");
        return;
      }
      setStatus(apiErrorMessage(err));
    } finally {
      setNotesLoading(false);
    }
  };

  const saveNote = async () => {
    if (!noteSlug) return;
    setStatus(`Saving "${noteSlug}"…`);
    try {
      await adminUpdateNote(token, noteSlug, { title: noteTitle, body: noteBody });
      await refreshNotes("Note saved ✅");
    } catch (err: unknown) {
      if (apiErrorStatus(err) === 401) {
        doLogout("Session expired. Please log in again.");
        return;
      }
      setStatus(apiErrorMessage(err));
    }
  };

  const createNote = async () => {
    const slug = normalizeSlug(newSlug);
    const title = newTitle.trim();
    const body = newBody;

    if (!slug) return setStatus("Slug is required.");
    if (!isValidSlug(slug)) return setStatus("Invalid slug. Use letters/numbers with - or _ only.");
    if (!title) return setStatus("Title is required.");

    if (notes.some((n) => n.slug === slug)) {
      return setStatus(`Slug already exists: ${slug}`);
    }

    setStatus("Creating note…");
    try {
      await adminCreateNote(token, { slug, title, body });
      setNewSlug("");
      setNewTitle("");
      setNewBody("");
      setNoteSlug(slug);
      await refreshNotes("Note created ✅");
    } catch (err: unknown) {
      if (apiErrorStatus(err) === 401) {
        doLogout("Session expired. Please log in again.");
        return;
      }
      setStatus(apiErrorMessage(err));
    }
  };

  const deleteNote = async () => {
    if (!noteSlug) return;
    const ok = window.confirm(`Delete note "${noteSlug}"?`);
    if (!ok) return;

    setStatus("Deleting note…");
    try {
      await adminDeleteNote(token, noteSlug);
      setNoteSlug("");
      await refreshNotes("Note deleted ✅");
    } catch (err: unknown) {
      if (apiErrorStatus(err) === 401) {
        doLogout("Session expired. Please log in again.");
        return;
      }
      setStatus(apiErrorMessage(err));
    }
  };

  /* ---------------- Projects CRUD ---------------- */

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
        <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "320px 1fr", gap: 12 }}>
          {/* Left: list + create */}
          <div style={{ display: "grid", gap: 10 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => refreshNotes("Notes refreshed ✅")} style={btnStyle}>
                Refresh
              </button>
              <button
                onClick={deleteNote}
                style={{ ...btnStyle, background: "rgba(255,0,0,0.14)" }}
                disabled={!noteSlug}
                title={!noteSlug ? "Select a note first" : "Delete selected note"}
              >
                Delete
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
              {notesLoading ? (
                <div style={{ padding: 12, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                  Loading notes…
                </div>
              ) : notes.length === 0 ? (
                <div style={{ padding: 12, color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                  No notes found.
                </div>
              ) : (
                notes.map((n) => {
                  const active = noteSlug === n.slug;
                  return (
                    <button
                      key={n.slug}
                      onClick={() => selectNote(n.slug)}
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
                      <div style={{ fontWeight: 800, fontSize: 13 }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                        {n.slug}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Create note */}
            <div
              style={{
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 14,
                padding: 12,
                background: "rgba(0,0,0,0.18)",
                display: "grid",
                gap: 8,
              }}
            >
              <div style={{ fontWeight: 800 }}>Create Note</div>

              <div style={smallLabel}>Slug</div>
              <input value={newSlug} onChange={(e) => setNewSlug(e.target.value)} style={inputStyle} />
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                Use: letters/numbers with <b>-</b> or <b>_</b>. Example: <code>edu-cs50</code>
              </div>

              <div style={smallLabel}>Title</div>
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} style={inputStyle} />

              <div style={smallLabel}>Body</div>
              <textarea
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
              />

              <button onClick={createNote} style={btnStyle}>
                + Create
              </button>
            </div>
          </div>

          {/* Right: editor */}
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
            {!noteSlug ? (
              <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
                Select a note to edit
              </div>
            ) : (
              <div style={{ display: "grid", gap: 10, maxWidth: 980 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                    Editing: <b>{noteSlug}</b>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                    {notesLoading ? "Loading…" : `${notes.length} notes`}
                  </div>
                </div>

                <div style={smallLabel}>Title</div>
                <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} style={inputStyle} />

                <div style={smallLabel}>Body</div>
                <textarea
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  style={{ ...inputStyle, minHeight: 280, resize: "vertical" }}
                />

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={saveNote} style={btnStyle}>
                    Save Note
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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
