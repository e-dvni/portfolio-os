export function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        onMouseDown={onClose}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 13000,
          background: "rgba(0,0,0,0.35)",
          backdropFilter: "blur(6px)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 13001,
          width: 520,
          borderRadius: 18,
          background: "rgba(0,0,0,0.70)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(22px)",
          boxShadow: "0 26px 80px rgba(0,0,0,0.60)",
          padding: 18,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "rgba(255,255,255,0.12)",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
            }}
          >
            DL
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>Portfolio OS</div>
            <div style={{ color: "rgba(255,255,255,0.70)", fontSize: 12 }}>
              Daniel Lee — Junior Frontend / Full-Stack Developer
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14, color: "rgba(255,255,255,0.82)", lineHeight: 1.5 }}>
          This portfolio is built as a Mac-style desktop UI with real window management and
          interactive apps. It showcases my production work (Custom LED Builder) and my
          full-stack project dashboard experience.
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: "rgba(255,255,255,0.62)" }}>
          Shortcuts: ⌘K Spotlight • Double-click desktop icons • Drag/resize windows
        </div>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.10)",
              color: "rgba(255,255,255,0.9)",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
