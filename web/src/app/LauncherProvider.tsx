import { LauncherContext, type Launcher } from "./launcherContext";

export function LauncherProvider({
  openApp,
  children,
}: {
  openApp: Launcher["openApp"];
  children: React.ReactNode;
}) {
  return (
    <LauncherContext.Provider value={{ openApp }}>
      {children}
    </LauncherContext.Provider>
  );
}
