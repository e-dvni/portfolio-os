import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { WindowManager } from "../windowing/WindowManager";
import { useWindowStore } from "../windowing/useWindowStore";
import { LauncherProvider } from "./LauncherProvider";
import { AboutModal } from "./AboutModal";
import { ContextMenu, type ContextMenuItem } from "./ContextMenu";

import { APPS as FALLBACK_APPS, type AppDef } from "../data/apps";
import { fetchApps } from "../data/api";
import { toAppDef } from "../data/adapters";
import { AppRegistryProvider } from "./appRegistryProvider";

const isTypingTarget = (t: EventTarget | null): boolean => {
  if (!(t instanceof HTMLElement)) return false;
  const tag = t.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || t.isContentEditable;
};

const DOCK_SPACE_PX = 78 + 14;

export function Desktop() {
  const wm = useWindowStore();

  const [apps, setApps] = useState<AppDef[]>(FALLBACK_APPS);
  const [appsSource, setAppsSource] = useState<"api" | "fallback">("fallback");

  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [query, setQuery] = useState("");

  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const desktopRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const el = desktopRef.current;
    if (!el) return;

    const compute = () => {
      const r = el.getBoundingClientRect();
      wm.setWorkArea({
        w: Math.floor(r.width),
        h: Math.floor(r.height - DOCK_SPACE_PX),
      });
    };

    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [wm]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const apiApps = await fetchApps();
        const mapped = apiApps.map(toAppDef);
        if (alive && mapped.length) {
          setApps(mapped);
          setAppsSource("api");
        }
      } catch {
        if (alive) {
          setApps(FALLBACK_APPS);
          setAppsSource("fallback");
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const desktopApps = useMemo(() => apps.filter((a) => a.desktop), [apps]);
  const dockApps = useMemo(() => apps.filter((a) => a.dock), [apps]);

  const closeOverlays = () => {
    setSpotlightOpen(false);
    setQuery("");
    setMenu(null);
  };

  const openApp = useCallback(
    (id: string) => {
      const app = apps.find((a) => a.id === id);
      if (!app) return;

      wm.open(app);
      closeOverlays();
    },
    [apps, wm]
  );

  const openUrl = useCallback(
    (args: { title: string; url: string; kind: "iframe" | "external" }) => {
      wm.openUrl(args);
      closeOverlays();
    },
    [wm]
  );

  const openNote = useCallback(
    (args: { title: string; slug: string }) => {
      wm.openNote(args);
      closeOverlays();
    },
    [wm]
  );

  const minimizedWins = useMemo(() => wm.wins.filter((w) => w.minimized), [wm.wins]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return apps.filter(
      (a) => a.name.toLowerCase().includes(q) || a.windowTitle.toLowerCase().includes(q)
    );
  }, [query, apps]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

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

  const contextItems: ContextMenuItem[] = useMemo(
    () => [
      { kind: "item", label: "Open Finder", onClick: () => openApp("finder") },
      { kind: "item", label: "Open Spotlight", onClick: () => setSpotlightOpen(true) },
      { kind: "separator" },
      { kind: "item", label: "Close All Windows", onClick: () => wm.closeAll() },
      { kind: "separator" },
      { kind: "item", label: "About This Mac", onClick: () => setAboutOpen(true) },
    ],
    [openApp, wm]
  );

  return (
    <AppRegistryProvider apps={apps}>
      <LauncherProvider openApp={openApp} openUrl={openUrl} openNote={openNote}>
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

            <div style={{ marginLeft: 12, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
              {appsSource === "api" ? "API" : "Local"}
            </div>
          </div>

          <div
            ref={desktopRef}
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
              onMinimize={wm.minimize}
              onToggleMaximize={wm.toggleMaximize}
              onFocus={wm.focus}
              onMove={wm.move}
              onResize={wm.resize}
            />

            <div className="dock">
              <div className="dock-left">
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

              <div className="dock-right">
                {minimizedWins.map((w) => (
                  <button
                    key={w.winId}
                    className="dock-minimized"
                    onClick={() => wm.restore(w.winId)}
                    title={`Restore: ${w.title}`}
                    type="button"
                  >
                    {w.title}
                  </button>
                ))}
              </div>
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
                  {(results.length ? results : apps.slice(0, 8)).map((app) => (
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
              <ContextMenu x={menu.x} y={menu.y} onClose={() => setMenu(null)} items={contextItems} />
            )}

            {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
          </div>
        </div>
      </LauncherProvider>
    </AppRegistryProvider>
  );
}
