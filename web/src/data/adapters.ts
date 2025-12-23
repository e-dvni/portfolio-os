import type { AppDef } from "./apps";

export type ApiApp = {
  id: number;
  name: string;
  slug: string;
  icon: string;
  app_type: "pdf" | "iframe" | "internal" | "external";
  window_title: string;
  default_w: number;
  default_h: number;
  desktop: boolean;
  dock: boolean;
  order_index: number | null;
  launch_url: string | null;
  internal_key: string | null;
};

export function toAppDef(a: ApiApp): AppDef {
  return {
    id: a.slug,
    name: a.name,
    type: a.app_type,
    windowTitle: a.window_title,
    defaultSize: { w: a.default_w, h: a.default_h },
    desktop: a.desktop,
    dock: a.dock,
    url: a.launch_url ?? undefined,
    internalKey: a.internal_key ?? undefined,
    icon: a.icon,
  };
}
