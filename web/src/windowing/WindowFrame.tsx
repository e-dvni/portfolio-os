import { useRef } from "react";
import type { WindowState } from "./types";

export function WindowFrame(props: {
  win: WindowState;
  onClose: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (w: number, h: number) => void;
  children: React.ReactNode;
}) {
  const { win, onClose, onFocus, onMove, onResize, children } = props;

  const dragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);
  const resizeRef = useRef<{ ow: number; oh: number; sx: number; sy: number } | null>(null);

  const onMouseDownTitle = (e: React.MouseEvent) => {
    onFocus();
    dragRef.current = { ox: win.x, oy: win.y, sx: e.clientX, sy: e.clientY };
    const onMoveDoc = (ev: MouseEvent) => {
      const d = dragRef.current!;
      onMove(d.ox + (ev.clientX - d.sx), d.oy + (ev.clientY - d.sy));
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMoveDoc);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMoveDoc);
    window.addEventListener("mouseup", onUp);
  };

  const onMouseDownResize = (e: React.MouseEvent) => {
    onFocus();
    e.stopPropagation();
    resizeRef.current = { ow: win.w, oh: win.h, sx: e.clientX, sy: e.clientY };
    const onMoveDoc = (ev: MouseEvent) => {
      const r = resizeRef.current!;
      onResize(r.ow + (ev.clientX - r.sx), r.oh + (ev.clientY - r.sy));
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMoveDoc);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMoveDoc);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div
      className="window"
      style={{ left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z }}
      onMouseDown={onFocus}
    >
      <div className="window-titlebar" onMouseDown={onMouseDownTitle}>
        <div className="win-controls">
          <div className="win-dot red" onClick={onClose} title="Close" />
          <div className="win-dot yellow" title="Minimize (v2)" />
          <div className="win-dot green" title="Maximize (v2)" />
        </div>
        <div className="window-title">{win.title}</div>
      </div>

      <div className="window-body">{children}</div>

      <div className="resize-handle" onMouseDown={onMouseDownResize} />
    </div>
  );
}
