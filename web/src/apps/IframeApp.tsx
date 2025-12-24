import { useEffect, useState } from "react";

type Props = {
  src: string;
  title?: string;
};

export function IframeApp({ src, title = "External App" }: Props) {
  const [failed, setFailed] = useState(false);
  const [timerDone, setTimerDone] = useState(false);

  // When src changes, remount iframe state by using effects that only set state asynchronously
  useEffect(() => {
    // reset flags safely on next tick (avoids “sync setState in effect” warnings in strict tooling)
    const r = window.setTimeout(() => {
      setFailed(false);
      setTimerDone(false);
    }, 0);

    const t = window.setTimeout(() => setTimerDone(true), 2500);

    return () => {
      window.clearTimeout(r);
      window.clearTimeout(t);
    };
  }, [src]);

  const showFallback = failed || timerDone;

  const openNewTab = () => window.open(src, "_blank", "noopener,noreferrer");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "10px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.10)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div style={{ fontWeight: 700 }}>{title}</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={openNewTab} style={btn} type="button">
            Open Live ↗
          </button>
        </div>
      </div>

      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        {!showFallback ? (
          <iframe
            key={src} // ensures a real remount when src changes
            src={src}
            title={title}
            style={{ border: 0, width: "100%", height: "100%" }}
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "grid",
              placeItems: "center",
              padding: 18,
              textAlign: "center",
            }}
          >
            <div style={{ maxWidth: 520 }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>
                This site can’t load inside an iframe
              </div>
              <div style={{ color: "rgba(255,255,255,0.70)", lineHeight: 1.5 }}>
                Some websites block embedding for security. No worries — you can open it live in a new tab.
              </div>

              <div style={{ marginTop: 14, display: "flex", justifyContent: "center", gap: 10 }}>
                <button onClick={openNewTab} style={btn} type="button">
                  Open Live Builder ↗
                </button>
              </div>

              <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                Next upgrade: add an in-window demo video/screenshot so recruiters can view it without leaving.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const btn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.10)",
  color: "rgba(255,255,255,0.92)",
  cursor: "pointer",
  fontWeight: 650,
  fontSize: 12,
};
