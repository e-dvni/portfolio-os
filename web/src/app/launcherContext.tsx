import { createContext, useContext } from "react";

export type Launcher = {
  openApp: (appId: string) => void;
  openUrl: (args: { title: string; url: string; kind: "iframe" | "external" }) => void;
};

export const LauncherContext = createContext<Launcher | null>(null);

export function useLauncher() {
  const ctx = useContext(LauncherContext);
  if (!ctx) {
    throw new Error("useLauncher must be used inside LauncherProvider");
  }
  return ctx;
}
