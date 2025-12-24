import { useEffect, useMemo, useState } from "react";
import { fetchProjects, type ProjectDTO } from "../data/api";

/**
 * SignAvenue Admin Dashboard (Demo)
 * - Interactive UI inside Portfolio OS
 * - Uses Portfolio API projects (fetchProjects)
 * - Uses mock data for schedule/inbox/users (easy to wire later)
 */

type TabKey = "overview" | "projects" | "schedule" | "inbox" | "users";

type InboxItem = {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status: "new" | "replied" | "archived";
};

type UserItem = {
  id: string;
  name: string;
  role: "Admin" | "Designer" | "Installer";
  email: string;
  active: boolean;
};

type ScheduleItem = {
  id: string;
  projectTitle: string;
  date: string; // YYYY-MM-DD
  slot: "AM" | "PM";
  address: string;
  status: "scheduled" | "pending" | "done";
};

const pill = (bg: string) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 10px",
  borderRadius: 999,
  fontSize: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: bg,
  color: "rgba(255,255,255,0.90)",
});

const cardStyle: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 16,
  background: "rgba(0,0,0,0.18)",
  padding: 14,
};

const smallMuted: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.60)",
};

const h2: React.CSSProperties = { margin: 0, fontSize: 16 };

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

export function AdminDashboardApp() {
  const [tab, setTab] = useState<TabKey>("overview");

  // data
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsErr, setProjectsErr] = useState<string>("");

  // detail selection
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // mock “inbox / users / schedule”
  const inbox = useMemo<InboxItem[]>(
    () => [
      {
        id: "i1",
        name: "John Contractor",
        email: "john@example.com",
        message: "Can you quote a lobby sign for a new build? Need install next month.",
        createdAt: "2025-12-10T13:45:00Z",
        status: "new",
      },
      {
        id: "i2",
        name: "Restaurant Owner",
        email: "owner@example.com",
        message: "We need an LED neon menu board — what’s lead time?",
        createdAt: "2025-12-12T17:05:00Z",
        status: "replied",
      },
      {
        id: "i3",
        name: "Property Manager",
        email: "pm@example.com",
        message: "Do you handle wayfinding signage? 4 floors + lobby directory.",
        createdAt: "2025-12-15T09:20:00Z",
        status: "archived",
      },
    ],
    []
  );

  const users = useMemo<UserItem[]>(
    () => [
      { id: "u1", name: "Daniel Lee", role: "Admin", email: "danielslee078@gmail.com", active: true },
      { id: "u2", name: "Designer 1", role: "Designer", email: "designer1@signavenue.com", active: true },
      { id: "u3", name: "Installer 1", role: "Installer", email: "installer1@signavenue.com", active: false },
    ],
    []
  );

  const schedule = useMemo<ScheduleItem[]>(
    () => [
      {
        id: "s1",
        projectTitle: "Lobby Channel Letters — Tower A",
        date: "2025-12-28",
        slot: "AM",
        address: "123 Main St, Jersey City, NJ",
        status: "scheduled",
      },
      {
        id: "s2",
        projectTitle: "Wayfinding — Office Buildout",
        date: "2025-12-29",
        slot: "PM",
        address: "77 Market St, Newark, NJ",
        status: "pending",
      },
      {
        id: "s3",
        projectTitle: "LED Menu Board — Restaurant",
        date: "2025-12-30",
        slot: "AM",
        address: "15 Bergenline Ave, Union City, NJ",
        status: "done",
      },
    ],
    []
  );

  // load projects (Portfolio API)
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingProjects(true);
      setProjectsErr("");
      try {
        const data = await fetchProjects();
        if (!alive) return;

        setProjects(data);
        setSelectedProjectId(data[0]?.id ?? null);
      } catch (e) {
        if (!alive) return;
        setProjects([]);
        setSelectedProjectId(null);
        setProjectsErr("Could not load projects from API. (Using dashboard demo still works.)");
      } finally {
        if (alive) setLoadingProjects(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  // overview metrics (mix real + mock)
  const metrics = useMemo(() => {
    const totalProjects = projects.length;
    const hasLive = projects.filter((p) => (p.live_url ?? "").trim().length > 0).length;
    const hasRepo = projects.filter((p) => (p.repo_url ?? "").trim().length > 0).length;

    const inboxNew = inbox.filter((i) => i.status === "new").length;
    const scheduled = schedule.filter((s) => s.status === "scheduled").length;

    return [
      { label: "Projects", value: String(totalProjects), sub: `${hasLive} live • ${hasRepo} repo` },
      { label: "Inbox (New)", value: String(inboxNew), sub: "Contact requests" },
      { label: "Scheduled", value: String(scheduled), sub: "Upcoming installs" },
      { label: "Users", value: String(users.length), sub: "Team access" },
    ];
  }, [projects.length, inbox, schedule, users.length, projects]);

  return (
    <div
      style={{
        height: "100%",
        display: "grid",
        gridTemplateColumns: "260px 1fr",
        gap: 12,
        padding: 12,
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          ...cardStyle,
          padding: 12,
          display: "grid",
          gridTemplateRows: "auto auto 1fr",
          gap: 10,
          minHeight: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background: "rgba(255,255,255,0.10)",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
            }}
          >
            SA
          </div>
          <div>
            <div style={{ fontWeight: 800, lineHeight: 1.1 }}>Sign Avenue</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.60)" }}>Admin Dashboard</div>
          </div>
        </div>

        <nav style={{ display: "grid", gap: 8 }}>
          <NavButton active={tab === "overview"} onClick={() => setTab("overview")} label="Overview" />
          <NavButton active={tab === "projects"} onClick={() => setTab("projects")} label="Projects" />
          <NavButton active={tab === "schedule"} onClick={() => setTab("schedule")} label="Schedule" />
          <NavButton active={tab === "inbox"} onClick={() => setTab("inbox")} label="Inbox" />
          <NavButton active={tab === "users"} onClick={() => setTab("users")} label="Users" />
        </nav>

        <div style={{ ...smallMuted, alignSelf: "end" }}>
          <br />
        </div>
      </aside>

      {/* Main */}
      <main style={{ minHeight: 0 }}>
        {tab === "overview" ? (
          <OverviewPanel metrics={metrics} />
        ) : tab === "projects" ? (
          <ProjectsPanel
            projects={projects}
            loading={loadingProjects}
            error={projectsErr}
            selectedId={selectedProjectId}
            onSelect={setSelectedProjectId}
            selected={selectedProject}
          />
        ) : tab === "schedule" ? (
          <SchedulePanel items={schedule} />
        ) : tab === "inbox" ? (
          <InboxPanel items={inbox} />
        ) : (
          <UsersPanel items={users} />
        )}
      </main>
    </div>
  );
}

/* ---------------- Subcomponents ---------------- */

function NavButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        textAlign: "left",
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.10)",
        background: active ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.18)",
        color: "rgba(255,255,255,0.92)",
        cursor: "pointer",
        fontWeight: 750,
      }}
    >
      {label}
    </button>
  );
}

function OverviewPanel({ metrics }: { metrics: { label: string; value: string; sub: string }[] }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ ...cardStyle, display: "flex", alignItems: "baseline", gap: 10 }}>
        <h3 style={{ margin: 0 }}>Overview</h3>
        <span style={smallMuted}></span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
        {metrics.map((m) => (
          <div key={m.label} style={cardStyle}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.60)" }}>{m.label}</div>
            <div style={{ fontSize: 26, fontWeight: 900, marginTop: 6 }}>{m.value}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", marginTop: 6 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, display: "grid", gap: 8 }}>
        <div style={{ fontWeight: 800 }}>What viewers can do</div>
        <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.80)" }}>
          <li>Navigate dashboard tabs like a real internal tool</li>
          <li>View live “Projects” data from my Rails API</li>
          <li>See realistic “Schedule / Inbox / Users”</li>
          <li>This is a demo mockup of Sign Avenue's Admin Dashboard</li>
        </ul>
        <div style={smallMuted}>
          
        </div>
      </div>
    </div>
  );
}

function ProjectsPanel(props: {
  projects: ProjectDTO[];
  loading: boolean;
  error: string;
  selectedId: number | null;
  onSelect: (id: number) => void;
  selected: ProjectDTO | null;
}) {
  const { projects, loading, error, selectedId, onSelect, selected } = props;

  return (
    <div style={{ display: "grid", gap: 12, minHeight: 0 }}>
      <div style={{ ...cardStyle, display: "flex", alignItems: "baseline", gap: 10 }}>
        <h3 style={{ margin: 0 }}>Projects</h3>
        <span style={smallMuted}>
          {loading ? "Loading…" : `${projects.length} total`}
        </span>
        {error && <span style={{ ...smallMuted, color: "rgba(255,180,180,0.85)" }}>{error}</span>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 12, minHeight: 0 }}>
        {/* list */}
        <div style={{ ...cardStyle, padding: 0, overflow: "hidden", minHeight: 0 }}>
          <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontWeight: 850 }}>Project List</div>
            <div style={smallMuted}>Select a project to view details</div>
          </div>

          <div style={{ overflow: "auto", maxHeight: "calc(100% - 56px)" }}>
            {projects.length === 0 ? (
              <div style={{ padding: 12, ...smallMuted }}>No projects loaded.</div>
            ) : (
              projects
                .slice()
                .sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999))
                .map((p) => {
                  const active = p.id === selectedId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onSelect(p.id)}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "10px 12px",
                        border: "none",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        background: active ? "rgba(255,255,255,0.10)" : "transparent",
                        color: "rgba(255,255,255,0.92)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ fontWeight: 850 }}>{p.title}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.62)", marginTop: 4 }}>
                        #{p.order_index ?? "—"} • {p.tech_stack ?? "No tech stack"}
                      </div>
                    </button>
                  );
                })
            )}
          </div>
        </div>

        {/* detail */}
        <div style={{ ...cardStyle, minHeight: 0, overflow: "auto" }}>
          {!selected ? (
            <div style={smallMuted}>Select a project.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <h3 style={{ margin: 0 }}>{selected.title}</h3>
                {selected.live_url ? (
                  <span style={pill("rgba(40,200,120,0.14)")}>Live</span>
                ) : (
                  <span style={pill("rgba(255,255,255,0.08)")}>No live link</span>
                )}
                {selected.repo_url ? (
                  <span style={pill("rgba(120,160,255,0.14)")}>Repo</span>
                ) : (
                  <span style={pill("rgba(255,255,255,0.08)")}>No repo</span>
                )}
              </div>

              {selected.subtitle && (
                <div style={{ color: "rgba(255,255,255,0.80)" }}>{selected.subtitle}</div>
              )}

              {selected.summary && (
                <div style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.45 }}>
                  {selected.summary}
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={cardStyle}>
                  <div style={smallMuted}>Tech Stack</div>
                  <div style={{ marginTop: 6, fontWeight: 800 }}>
                    {selected.tech_stack ?? "—"}
                  </div>
                </div>

                <div style={cardStyle}>
                  <div style={smallMuted}>Order Index</div>
                  <div style={{ marginTop: 6, fontWeight: 800 }}>
                    {selected.order_index ?? "—"}
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <a
                  href={selected.repo_url ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...linkBtn,
                    opacity: selected.repo_url ? 1 : 0.5,
                    pointerEvents: selected.repo_url ? "auto" : "none",
                  }}
                >
                  Open Repo
                </a>
                <a
                  href={selected.live_url ?? undefined}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    ...linkBtn,
                    opacity: selected.live_url ? 1 : 0.5,
                    pointerEvents: selected.live_url ? "auto" : "none",
                  }}
                >
                  Open Live
                </a>
              </div>

              <div style={cardStyle}>
                <div style={smallMuted}>Highlights</div>
                <div style={{ marginTop: 8 }}>
                  {selected.highlights?.length ? (
                    <ul style={{ margin: 0, paddingLeft: 18, color: "rgba(255,255,255,0.82)" }}>
                      {selected.highlights.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  ) : (
                    <div style={smallMuted}>—</div>
                  )}
                </div>
              </div>

              <div style={smallMuted}>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SchedulePanel({ items }: { items: ScheduleItem[] }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ ...cardStyle, display: "flex", alignItems: "baseline", gap: 10 }}>
        <h3 style={{ margin: 0 }}>Schedule</h3>
        <span style={smallMuted}></span>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontWeight: 850 }}>Upcoming</div>
          <div style={smallMuted}>Install slots (AM/PM)</div>
        </div>

        <div style={{ overflow: "auto" }}>
          {items.map((s) => (
            <div
              key={s.id}
              style={{
                padding: 12,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "grid",
                gap: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontWeight: 850 }}>{s.projectTitle}</div>
                <span
                  style={
                    s.status === "scheduled"
                      ? pill("rgba(40,200,120,0.14)")
                      : s.status === "pending"
                      ? pill("rgba(255,200,80,0.14)")
                      : pill("rgba(170,170,170,0.12)")
                  }
                >
                  {s.status}
                </span>
              </div>
              <div style={smallMuted}>
                {formatDate(s.date)} • {s.slot} • {s.address}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InboxPanel({ items }: { items: InboxItem[] }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ ...cardStyle, display: "flex", alignItems: "baseline", gap: 10 }}>
        <h3 style={{ margin: 0 }}>Inbox</h3>
        <span style={smallMuted}></span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {items.map((i) => (
          <div key={i.id} style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ fontWeight: 900 }}>{i.name}</div>
              <span
                style={
                  i.status === "new"
                    ? pill("rgba(255,90,90,0.16)")
                    : i.status === "replied"
                    ? pill("rgba(120,160,255,0.16)")
                    : pill("rgba(170,170,170,0.12)")
                }
              >
                {i.status}
              </span>
              <div style={{ marginLeft: "auto", ...smallMuted }}>{formatDate(i.createdAt)}</div>
            </div>
            <div style={{ marginTop: 6, ...smallMuted }}>{i.email}</div>
            <div style={{ marginTop: 10, color: "rgba(255,255,255,0.82)", lineHeight: 1.45 }}>
              {i.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersPanel({ items }: { items: UserItem[] }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ ...cardStyle, display: "flex", alignItems: "baseline", gap: 10 }}>
        <h3 style={{ margin: 0 }}>Users</h3>
        <span style={smallMuted}></span>
      </div>

      <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontWeight: 850 }}>Team</div>
          <div style={smallMuted}></div>
        </div>

        <div style={{ overflow: "auto" }}>
          {items.map((u) => (
            <div
              key={u.id}
              style={{
                padding: 12,
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ fontWeight: 900 }}>{u.name}</div>
              <span style={pill("rgba(255,255,255,0.10)")}>{u.role}</span>
              <div style={{ marginLeft: "auto", ...smallMuted }}>{u.email}</div>
              <span style={u.active ? pill("rgba(40,200,120,0.14)") : pill("rgba(170,170,170,0.12)")}>
                {u.active ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const linkBtn: React.CSSProperties = {
  display: "inline-flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.10)",
  color: "rgba(255,255,255,0.92)",
  textDecoration: "none",
  fontWeight: 750,
  cursor: "pointer",
};
