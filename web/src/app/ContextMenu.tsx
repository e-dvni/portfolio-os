import { useEffect, useRef } from "react";

export type ContextMenuItem =
  | { kind: "item"; label: string; onClick: () => void; disabled?: boolean }
  | { kind: "separator" };

export type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  items: ContextMenuItem[];
};

export function ContextMenu({ x, y, onClose, items }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    // Close if clicking outside the menu
    const onPointerDown = (e: PointerEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      onClose();
    };

    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointerDown);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointerDown);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      role="menu"
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
      onPointerDown={(e) => {
        // ✅ Prevent Desktop's onMouseDown from closing the menu before click fires
        e.stopPropagation();
      }}
      onMouseDown={(e) => {
        // (extra safety for browsers that behave differently)
        e.stopPropagation();
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

        const disabled = Boolean(item.disabled);

        return (
          <button
            key={`item-${idx}`}
            type="button"
            disabled={disabled}
            onClick={() => {
              if (disabled) return;
              item.onClick();
              onClose();
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              textAlign: "left",
              padding: "10px 12px",
              background: "transparent",
              border: "none",
              color: disabled ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.92)",
              cursor: disabled ? "not-allowed" : "pointer",
              fontSize: 13,
            }}
            onMouseEnter={(e) => {
              if (!disabled) e.currentTarget.style.background = "rgba(255,255,255,0.10)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            role="menuitem"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
