import { LauncherContext, type Launcher } from "./launcherContext";

export function LauncherProvider({
  openApp,
  openUrl,
  children,
}: {
  openApp: Launcher["openApp"];
  openUrl: Launcher["openUrl"];
  children: React.ReactNode;
}) {
  return (
    <LauncherContext.Provider value={{ openApp, openUrl }}>
      {children}
    </LauncherContext.Provider>
  );
}
