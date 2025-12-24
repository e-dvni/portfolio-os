import { useCallback, useRef, useState } from "react";
import type { WindowState, Rect } from "./types";
import type { AppDef } from "../data/apps";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

type WorkArea = { w: number; h: number };

export function useWindowStore() {
  const [wins, setWins] = useState<WindowState[]>([]);

  const [zTop, setZTop] = useState(10);
  const zTopRef = useRef(10);

  const workAreaRef = useRef<WorkArea>({ w: 1200, h: 800 });

  const setWorkArea = useCallback((wa: WorkArea) => {
    workAreaRef.current = wa;
  }, []);

  const nextZ = useCallback(() => {
    const z = zTopRef.current + 1;
    zTopRef.current = z;
    setZTop(z);
    return z;
  }, []);

  const focus = useCallback(
    (winId: string) => {
      const z = nextZ();
      setWins((prev) => prev.map((w) => (w.winId === winId ? { ...w, z } : w)));
    },
    [nextZ]
  );

  const close = useCallback((winId: string) => {
    setWins((prev) => prev.filter((w) => w.winId !== winId));
  }, []);

  const closeAll = useCallback(() => setWins([]), []);

  const open = useCallback(
    (app: AppDef) => {
      setWins((prevWins) => {
        const existing = prevWins.find((w) => w.appId === app.id);

        if (existing) {
          const z = nextZ();
          return prevWins.map((w) =>
            w.winId === existing.winId ? { ...w, minimized: false, z } : w
          );
        }

        const z = nextZ();
        const winId = `${app.id}-${Date.now()}`;
        const { w, h } = app.defaultSize;

        const x = 80 + Math.floor(Math.random() * 60);
        const y = 70 + Math.floor(Math.random() * 40);

        const newWin: WindowState = {
          winId,
          appId: app.id,
          title: app.windowTitle,
          x,
          y,
          w,
          h,
          z,
          minimized: false,
          maximized: false,
        };

        return [...prevWins, newWin];
      });
    },
    [nextZ]
  );

  const openUrl = useCallback(
    (args: { title: string; url: string; kind: "iframe" | "external" }) => {
      const z = nextZ();
      const winId = `url-${Date.now()}`;

      const defaultW = args.kind === "iframe" ? 1100 : 720;
      const defaultH = args.kind === "iframe" ? 720 : 520;

      const x = 90 + Math.floor(Math.random() * 60);
      const y = 80 + Math.floor(Math.random() * 40);

      setWins((prev) => [
        ...prev,
        {
          winId,
          appId: `__url__:${args.kind}:${encodeURIComponent(args.url)}`,
          title: args.title,
          x,
          y,
          w: defaultW,
          h: defaultH,
          z,
          minimized: false,
          maximized: false,
        },
      ]);
    },
    [nextZ]
  );

  const openNote = useCallback(
    (args: { title: string; slug: string }) => {
      const z = nextZ();
      const winId = `note-${Date.now()}`;

      const x = 90 + Math.floor(Math.random() * 60);
      const y = 80 + Math.floor(Math.random() * 40);

      setWins((prev) => [
        ...prev,
        {
          winId,
          appId: `__note__:${encodeURIComponent(args.slug)}`,
          title: `Notes — ${args.title}`,
          x,
          y,
          w: 720,
          h: 520,
          z,
          minimized: false,
          maximized: false,
        },
      ]);
    },
    [nextZ]
  );

  const move = useCallback((winId: string, x: number, y: number) => {
    setWins((prev) =>
      prev.map((w) => {
        if (w.winId !== winId) return w;
        if (w.maximized) return w;
        return { ...w, x: clamp(x, -2000, 2000), y: clamp(y, 0, 2000) };
      })
    );
  }, []);

  const resize = useCallback((winId: string, w: number, h: number) => {
    setWins((prev) =>
      prev.map((win) => {
        if (win.winId !== winId) return win;
        if (win.maximized) return win;

        return { ...win, w: clamp(w, 420, 2200), h: clamp(h, 320, 1400) };
      })
    );
  }, []);

  const minimize = useCallback((winId: string) => {
    setWins((prev) => prev.map((w) => (w.winId === winId ? { ...w, minimized: true } : w)));
  }, []);

  const restore = useCallback(
    (winId: string) => {
      const z = nextZ();
      setWins((prev) => prev.map((w) => (w.winId === winId ? { ...w, minimized: false, z } : w)));
    },
    [nextZ]
  );

  const toggleMaximize = useCallback(
    (winId: string) => {
      const z = nextZ();
      const wa = workAreaRef.current;

      setWins((prev) =>
        prev.map((w) => {
          if (w.winId !== winId) return w;

          const isMax = Boolean(w.maximized);

          if (!isMax) {
            const restoreRect: Rect = { x: w.x, y: w.y, w: w.w, h: w.h };

            return {
              ...w,
              z,
              maximized: true,
              restoreRect,
              x: 0,
              y: 0,
              w: wa.w,
              h: wa.h,
            };
          }

          const r = w.restoreRect;
          return {
            ...w,
            z,
            maximized: false,
            restoreRect: undefined,
            x: r?.x ?? w.x,
            y: r?.y ?? w.y,
            w: r?.w ?? w.w,
            h: r?.h ?? w.h,
          };
        })
      );
    },
    [nextZ]
  );

  return {
    wins,
    zTop,
    setWorkArea,
    open,
    openUrl,
    openNote,
    close,
    closeAll,
    focus,
    move,
    resize,
    minimize,
    restore,
    toggleMaximize,
  };
}
