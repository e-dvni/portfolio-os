import { createContext, useContext } from "react";
import type { AppDef } from "../data/apps";

export type AppRegistry = {
  apps: AppDef[];
  getApp: (id: string) => AppDef | undefined;
};

export const AppRegistryContext = createContext<AppRegistry | null>(null);

export function useAppRegistry() {
  const ctx = useContext(AppRegistryContext);
  if (!ctx) throw new Error("useAppRegistry must be used inside AppRegistryProvider");
  return ctx;
}
