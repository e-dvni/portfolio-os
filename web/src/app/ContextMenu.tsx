import { useEffect } from "react";

export type ContextMenuItem =
  | { kind: "item"; label: string; onClick: () => void }
  | { kind: "separator" };

export type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  items: ContextMenuItem[];
};

export function ContextMenu({ x, y, onClose, items }: ContextMenuProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <>
      {/* click-outside overlay */}
      <div
        onMouseDown={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 12000,
        }}
      />

      {/* menu */}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          zIndex: 12001,
          width: 240,
          borderRadius: 14,
          background: "rgba(0,0,0,0.72)",
          border: "1px solid rgba(255,255,255,0.12)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 18px 55px rgba(0,0,0,0.55)",
          overflow: "hidden",
        }}
      >
        {items.map((item, idx) => {
          if (item.kind === "separator") {
            return (
              <div
                key={`sep-${idx}`}
                style={{
                  height: 1,
                  background: "rgba(255,255,255,0.10)",
                  margin: "6px 0",
                }}
              />
            );
          }

          return (
            <button
              key={`item-${idx}`}
              onClick={() => {
                item.onClick();
                onClose();
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 12px",
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.92)",
                cursor: "pointer",
                fontSize: 13,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.10)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </>
  );
}
