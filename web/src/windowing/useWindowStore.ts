import { useCallback, useRef, useState } from "react";
import type { WindowState } from "./types";
import type { AppDef } from "../data/apps";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

export function useWindowStore() {
  const [wins, setWins] = useState<WindowState[]>([]);

  // z-index top value, kept in state (optional) and mirrored in a ref (critical)
  const [zTop, setZTop] = useState(10);
  const zTopRef = useRef(10);

  // Always get the next z-index atomically
  const nextZ = useCallback(() => {
    const z = zTopRef.current + 1;
    zTopRef.current = z;
    setZTop(z); // keep state in sync (useful for debugging / future UI)
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

  const closeAll = useCallback(() => {
    setWins([]);
  }, []);

  const open = useCallback(
    (app: AppDef) => {
      setWins((prevWins) => {
        // If already open, focus it
        const existing = prevWins.find((w) => w.appId === app.id);
        if (existing) {
          const z = nextZ();
          return prevWins.map((w) => (w.winId === existing.winId ? { ...w, z } : w));
        }

        // Otherwise create new window
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
        };

        return [...prevWins, newWin];
      });
    },
    [nextZ]
  );

  const move = useCallback((winId: string, x: number, y: number) => {
    setWins((prev) =>
      prev.map((w) =>
        w.winId === winId
          ? { ...w, x: clamp(x, -2000, 2000), y: clamp(y, 10, 2000) }
          : w
      )
    );
  }, []);

  const resize = useCallback((winId: string, w: number, h: number) => {
    setWins((prev) =>
      prev.map((win) =>
        win.winId === winId
          ? { ...win, w: clamp(w, 420, 1600), h: clamp(h, 320, 1000) }
          : win
      )
    );
  }, []);

  return {
    wins,
    zTop, // optional, but handy
    open,
    close,
    closeAll,
    focus,
    move,
    resize,
  };
}
