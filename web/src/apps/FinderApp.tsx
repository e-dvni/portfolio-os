import { useEffect, useMemo, useState } from "react";
import { useAppRegistry } from "../app/appRegistryContext";
import { useLauncher } from "../app/launcherContext";
import { fetchProjects, type ProjectDTO } from "../data/api";

type FinderSection = "projects" | "education" | "links";

type FinderItem =
  | { id: string; title: string; subtitle?: string; kind: "app"; appId: string }
  | { id: string; title: string; subtitle?: string; kind: "iframe" | "external"; url: string }
  | { id: string; title: string; subtitle?: string; kind: "note"; slug: string };

export function FinderApp() {
  const { openApp, openUrl, openNote } = useLauncher();
  const { getApp } = useAppRegistry();

  const [active, setActive] = useState<FinderSection>("projects");

  const [projectItems, setProjectItems] = useState<FinderItem[]>([]);
  const [projectSource, setProjectSource] = useState<"api" | "fallback">("fallback");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const projects: ProjectDTO[] = await fetchProjects();
        if (!alive) return;

        const mapped: FinderItem[] = projects.map((p, idx) => {
          const title = p.title?.trim() || `Project ${idx + 1}`;
          const subtitle = p.subtitle ?? p.tech_stack ?? "Click to open";

          if (p.live_url) {
            return { id: `api-${p.id}`, title, subtitle, kind: "iframe", url: p.live_url };
          }

          if (p.repo_url) {
            return { id: `api-${p.id}`, title, subtitle, kind: "external", url: p.repo_url };
          }

          const normalized = title.toLowerCase();
          const appId =
            normalized.includes("admin")
              ? "admin"
              : normalized.includes("led")
              ? "led-builder"
              : normalized.includes("resume")
              ? "resume"
              : "notes";

          return { id: `api-${p.id}`, title, subtitle, kind: "app", appId };
        });

        setProjectItems(mapped);
        setProjectSource(mapped.length ? "api" : "fallback");
      } catch {
        setProjectItems([]);
        setProjectSource("fallback");
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const sections = useMemo(
    () => [
      { key: "projects" as const, label: "Projects" },
      { key: "education" as const, label: "Education" },
      { key: "links" as const, label: "Links" },
    ],
    []
  );

  const itemsBySection: Record<FinderSection, FinderItem[]> = useMemo(() => {
    const resume = getApp("resume");
    const led = getApp("led-builder");
    const admin = getApp("admin");

    const fallbackProjects: FinderItem[] = [
      {
        id: "p1",
        title: admin?.name ?? "Admin Dashboard",
        subtitle: "Auth • Project tracking • Scheduling • CRM tools",
        kind: "app",
        appId: "admin",
      },
      {
        id: "p2",
        title: led?.name ?? "Custom LED Builder",
        subtitle: "Live builder (iframe)",
        kind: "app",
        appId: "led-builder",
      },
      {
        id: "p3",
        title: resume?.name ?? "Resume.pdf",
        subtitle: "Open my resume (PDF)",
        kind: "app",
        appId: "resume",
      },
    ];

    return {
      projects: projectItems.length ? projectItems : fallbackProjects,
      education: [
        {
          id: "e1",
          title: "Harvard CS50",
          subtitle: "Currently enrolled — CS fundamentals",
          kind: "note",
          slug: "edu-cs50",
        },
        {
          id: "e2",
          title: "LEARN Academy (Frontend)",
          subtitle: "JS • React • HTML/CSS • Tailwind",
          kind: "note",
          slug: "edu-learn-academy",
        },
        {
          id: "e3",
          title: "Kean University — Accounting",
          subtitle: "B.S. Accounting",
          kind: "note",
          slug: "edu-kean",
        },
      ],
      links: [
        { id: "l1", title: "GitHub", subtitle: "github.com/e-dvni", kind: "app", appId: "github" },
        {
          id: "l2",
          title: "LinkedIn",
          subtitle: "linkedin.com/in/daniel-lee-7157a31a8",
          kind: "app",
          appId: "linkedin",
        },
        { id: "l3", title: "Contact (Mail)", subtitle: "Send me an email", kind: "app", appId: "mail" },
      ],
    };
  }, [getApp, projectItems]);

  const title = active === "projects" ? "Projects" : active === "education" ? "Education" : "Links";
  const list = itemsBySection[active];

  const handleOpen = (item: FinderItem) => {
    if (item.kind === "app") {
      openApp(item.appId);
      return;
    }
    if (item.kind === "note") {
      openNote({ title: item.title, slug: item.slug });
      return;
    }
    openUrl({ title: item.title, url: item.url, kind: item.kind });
  };

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "220px 1fr" }}>
      <div
        style={{
          borderRight: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(0,0,0,0.18)",
          padding: 12,
        }}
      >
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.60)", marginBottom: 10 }}>
          Favorites
        </div>

        {sections.map((s) => {
          const isActive = s.key === active;
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 10px",
                marginBottom: 8,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.10)",
                background: isActive ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.20)",
                color: "rgba(255,255,255,0.92)",
                cursor: "pointer",
              }}
            >
              {s.label}
            </button>
          );
        })}

        {active === "projects" && (
          <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
            Source: {projectSource === "api" ? "Rails API" : "Local fallback"}
          </div>
        )}
      </div>

      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <span style={{ color: "rgba(255,255,255,0.60)", fontSize: 12 }}>{list.length} items</span>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 12,
          }}
        >
          {list.map((item) => (
            <div
              key={item.id}
              onClick={() => handleOpen(item)}
              style={{
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.22)",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 700 }}>{item.title}</div>
              {"subtitle" in item && item.subtitle && (
                <div style={{ marginTop: 6, color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                  {item.subtitle}
                </div>
              )}
              <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                Click to open
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
