import type { AppDef } from "../data/apps";

export type WindowState = {
  winId: string;
  appId: string;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
};

export type OpenWindowArgs = {
  app: AppDef;
};
