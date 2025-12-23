import { useCallback, useEffect, useMemo, useState } from "react";
import { APPS } from "../data/apps";
import { WindowManager } from "../windowing/WindowManager";
import { useWindowStore } from "../windowing/useWindowStore";
import { LauncherProvider } from "./LauncherProvider";
import { AboutModal } from "./AboutModal";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu";

export function Desktop() {
  const wm = useWindowStore();

  const desktopApps = useMemo(() => APPS.filter((a) => a.desktop), []);
  const dockApps = useMemo(() => APPS.filter((a) => a.dock), []);

  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const openApp = useCallback(
    (id: string) => {
      const app = APPS.find((a) => a.id === id);
      if (!app) return;

      wm.open(app);

      // clean UI state when opening something
      setSpotlightOpen(false);
      setQuery("");
      setMenu(null);
    },
    [wm] // wm is stable enough; if you ever change useWindowStore to return new fns each render, we’ll destructure below
  );

  // Spotlight results
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return APPS.filter(
      (a) => a.name.toLowerCase().includes(q) || a.windowTitle.toLowerCase().includes(q)
    );
  }, [query]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K => Spotlight toggle
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSpotlightOpen((v) => !v);
        setQuery("");
        setMenu(null);
        return;
      }

      if (e.key === "Escape") {
        setSpotlightOpen(false);
        setMenu(null);
        setAboutOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Build context menu items (typed) with correct deps
  const contextItems: ContextMenuItem[] = useMemo(
    () => [
      { kind: "item", label: "Open Finder", onClick: () => openApp("finder") },
      { kind: "item", label: "Open Spotlight", onClick: () => setSpotlightOpen(true) },
      { kind: "separator" },
      { kind: "item", label: "Close All Windows", onClick: () => wm.closeAll() },
      { kind: "separator" },
      { kind: "item", label: "About This Mac", onClick: () => setAboutOpen(true) },
    ],
    [openApp, wm] // ✅ includes openApp, matches inferred deps
  );

  return (
    <LauncherProvider openApp={openApp}>
      <div className="mac-root">
        <div className="wallpaper" />

        <div className="menu-bar">
          <div className="apple-dot" />
          <div style={{ fontSize: 13, fontWeight: 600 }}>Daniel Lee</div>
          <div style={{ marginLeft: 10, fontSize: 13, color: "rgba(255,255,255,0.75)" }}>
            Portfolio OS
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
            ⌘K Spotlight
          </div>
        </div>

        <div
          className="desktop"
          onContextMenu={(e) => {
            e.preventDefault();
            setSpotlightOpen(false);
            setMenu({ x: e.clientX, y: e.clientY });
          }}
          onMouseDown={() => {
            if (menu) setMenu(null);
          }}
        >
          <div className="desktop-icons">
            {desktopApps.map((app) => (
              <div
                key={app.id}
                className="icon"
                onDoubleClick={() => openApp(app.id)}
                title="Double click to open"
              >
                <img src={app.icon} alt={app.name} />
                <span>{app.name}</span>
              </div>
            ))}
          </div>

          <WindowManager
            wins={wm.wins}
            onClose={wm.close}
            onFocus={wm.focus}
            onMove={wm.move}
            onResize={wm.resize}
          />

          <div className="dock">
            {dockApps.map((app) => (
              <div
                key={app.id}
                className="dock-item"
                onClick={() => openApp(app.id)}
                title={app.name}
              >
                <img src={app.icon} alt={app.name} />
              </div>
            ))}
          </div>

          {spotlightOpen && (
            <div className="spotlight">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search apps…"
              />
              <div className="spotlight-results">
                {(results.length ? results : APPS.slice(0, 8)).map((app) => (
                  <div key={app.id} className="spotlight-item" onClick={() => openApp(app.id)}>
                    <img src={app.icon} alt="" style={{ width: 18, height: 18 }} />
                    <div>
                      <div style={{ fontWeight: 600 }}>{app.name}</div>
                      <small>{app.windowTitle}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {menu && (
            <ContextMenu
              x={menu.x}
              y={menu.y}
              onClose={() => setMenu(null)}
              items={contextItems}
            />
          )}

          {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
        </div>
      </div>
    </LauncherProvider>
  );
}
