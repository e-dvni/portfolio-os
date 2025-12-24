import { createContext, useContext } from "react";

export type OpenOpts = { newWindow?: boolean };

export type Launcher = {
  openApp: (appId: string, opts?: OpenOpts) => void;
  openUrl: (
    args: { title: string; url: string; kind: "iframe" | "external" },
    opts?: OpenOpts
  ) => void;
  openNote: (args: { title: string; slug: string }, opts?: OpenOpts) => void;
};

export const LauncherContext = createContext<Launcher | null>(null);

export function useLauncher() {
  const ctx = useContext(LauncherContext);
  if (!ctx) throw new Error("useLauncher must be used inside LauncherProvider");
  return ctx;
}
