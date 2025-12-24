import { useRef } from "react";
import type { WindowState } from "./types";

export function WindowFrame(props: {
  win: WindowState;
  onClose: () => void;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onFocus: () => void;
  onMove: (x: number, y: number) => void;
  onResize: (w: number, h: number) => void;
  children: React.ReactNode;
}) {
  const { win, onClose, onMinimize, onToggleMaximize, onFocus, onMove, onResize, children } = props;

  const dragRef = useRef<{ ox: number; oy: number; sx: number; sy: number } | null>(null);
  const resizeRef = useRef<{ ow: number; oh: number; sx: number; sy: number } | null>(null);

  const onMouseDownTitle = (e: React.MouseEvent) => {
    if (win.maximized) return; // don’t drag if maximized

    onFocus();
    dragRef.current = { ox: win.x, oy: win.y, sx: e.clientX, sy: e.clientY };

    const onMoveDoc = (ev: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
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
    if (win.maximized) return; // don’t resize if maximized

    onFocus();
    e.stopPropagation();

    resizeRef.current = { ow: win.w, oh: win.h, sx: e.clientX, sy: e.clientY };

    const onMoveDoc = (ev: MouseEvent) => {
      const r = resizeRef.current;
      if (!r) return;
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
      style={{
        left: win.x,
        top: win.y,
        width: win.w,
        height: win.h,
        zIndex: win.z,
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        borderRadius: 16,
        overflow: "hidden",
      }}
      onMouseDown={onFocus}
    >
      <div
        className="window-titlebar"
        onMouseDown={onMouseDownTitle}
        style={{ flex: "0 0 auto", userSelect: "none" }}
      >
        <div className="win-controls" style={{ display: "flex", gap: 8, paddingLeft: 10 }}>
          <button
            type="button"
            className="win-dot red"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close"
            title="Close"
          />
          <button
            type="button"
            className="win-dot yellow"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            aria-label="Minimize"
            title="Minimize"
          />
          <button
            type="button"
            className="win-dot green"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMaximize();
            }}
            aria-label={win.maximized ? "Restore" : "Maximize"}
            title={win.maximized ? "Restore" : "Maximize"}
          />
        </div>

        <div className="window-title" style={{ paddingRight: 14 }}>
          {win.title}
        </div>
      </div>

      <div
        className="window-body"
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          overflow: "auto",
        }}
      >
        {children}
      </div>

      {!win.maximized && <div className="resize-handle" onMouseDown={onMouseDownResize} />}
    </div>
  );
}
