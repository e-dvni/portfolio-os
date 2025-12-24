import { LauncherContext, type Launcher } from "./launcherContext";

export function LauncherProvider({
  openApp,
  openUrl,
  openNote,
  children,
}: {
  openApp: Launcher["openApp"];
  openUrl: Launcher["openUrl"];
  openNote: Launcher["openNote"];
  children: React.ReactNode;
}) {
  return (
    <LauncherContext.Provider value={{ openApp, openUrl, openNote }}>
      {children}
    </LauncherContext.Provider>
  );
}
