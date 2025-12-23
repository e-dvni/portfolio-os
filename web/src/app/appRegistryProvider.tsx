import { AppRegistryContext, type AppRegistry } from "./appRegistryContext";
import type { AppDef } from "../data/apps";

export function AppRegistryProvider({
  apps,
  children,
}: {
  apps: AppDef[];
  children: React.ReactNode;
}) {
  const getApp: AppRegistry["getApp"] = (id) => apps.find((a) => a.id === id);

  return (
    <AppRegistryContext.Provider value={{ apps, getApp }}>
      {children}
    </AppRegistryContext.Provider>
  );
}
