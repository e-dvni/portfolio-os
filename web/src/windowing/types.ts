export type Rect = { x: number; y: number; w: number; h: number };

export type WindowState = {
  winId: string;
  appId: string;
  title: string;

  x: number;
  y: number;
  w: number;
  h: number;
  z: number;

  minimized?: boolean;
  maximized?: boolean;

  // store previous bounds to restore from maximize
  restoreRect?: Rect;
};
