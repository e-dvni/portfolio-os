import { useMemo, useState } from "react";
import { useAppRegistry } from "../app/appRegistryContext";
import { useLauncher } from "../app/launcherContext";

type FinderSection = "projects" | "education" | "links";

type FinderItem = {
  id: string;
  title: string;
  subtitle?: string;
  appId: string;
};

export function FinderApp() {
  const { openApp } = useLauncher();
  const { getApp } = useAppRegistry(); // ✅ hook at top level

  const sections = useMemo(
    () => [
      { key: "projects" as const, label: "Projects" },
      { key: "education" as const, label: "Education" },
      { key: "links" as const, label: "Links" },
    ],
    []
  );

  const [active, setActive] = useState<FinderSection>("projects");

  const itemsBySection: Record<FinderSection, FinderItem[]> = useMemo(() => {
    const resume = getApp("resume");
    const led = getApp("led-builder");
    const admin = getApp("admin");

    return {
      projects: [
        {
          id: "p1",
          title: admin?.name ?? "Admin Dashboard",
          subtitle: "Auth • Project tracking • Scheduling • CRM tools",
          appId: "admin",
        },
        {
          id: "p2",
          title: led?.name ?? "Custom LED Builder",
          subtitle: "Live builder (iframe) — later: native demo app",
          appId: "led-builder",
        },
        {
          id: "p3",
          title: resume?.name ?? "Resume.pdf",
          subtitle: "Open my resume (PDF)",
          appId: "resume",
        },
      ],
      education: [
        {
          id: "e1",
          title: "Harvard CS50",
          subtitle: "Currently enrolled — CS fundamentals",
          appId: "about",
        },
        {
          id: "e2",
          title: "LEARN Academy (Frontend)",
          subtitle: "JS • React • HTML/CSS • Tailwind",
          appId: "about",
        },
        {
          id: "e3",
          title: "Kean University — Accounting",
          subtitle: "B.S. Accounting",
          appId: "about",
        },
      ],
      links: [
        { id: "l1", title: "GitHub", subtitle: "github.com/e-dvni", appId: "github" },
        {
          id: "l2",
          title: "LinkedIn",
          subtitle: "linkedin.com/in/daniel-lee-7157a31a8",
          appId: "linkedin",
        },
        { id: "l3", title: "Contact (Mail)", subtitle: "Send me an email", appId: "mail" },
      ],
    };
  }, [getApp]); // ✅ correct dependency

  const title =
    active === "projects" ? "Projects" : active === "education" ? "Education" : "Links";

  const list = itemsBySection[active];

  return (
    <div
      style={{
        height: "100%",
        display: "grid",
        gridTemplateColumns: "220px 1fr",
      }}
    >
      {/* Sidebar */}
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

        <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
          Tip: click an item to open it
        </div>
      </div>

      {/* Main */}
      <div style={{ padding: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          <span style={{ color: "rgba(255,255,255,0.60)", fontSize: 12 }}>
            {list.length} items
          </span>
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
              onClick={() => openApp(item.appId)}
              style={{
                padding: 14,
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.10)",
                background: "rgba(0,0,0,0.22)",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 700 }}>{item.title}</div>
              {item.subtitle && (
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
