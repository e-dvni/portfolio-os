import { useState } from "react";

export function MailApp() {
  const [subject, setSubject] = useState("Portfolio Contact");
  const [body, setBody] = useState("");

  const openMail = () => {
    const url =
      "mailto:danielslee078@gmail.com" +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ padding: 16, display: "grid", gap: 10 }}>
      <div style={{ fontWeight: 700 }}>Compose</div>
      <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
        To: danielslee078@gmail.com
      </div>

      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        style={{
          padding: 10,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.35)",
          color: "rgba(255,255,255,0.9)",
          outline: "none",
        }}
      />

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={10}
        placeholder="Write your message…"
        style={{
          padding: 10,
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.35)",
          color: "rgba(255,255,255,0.9)",
          outline: "none",
          resize: "vertical",
        }}
      />

      <button
        onClick={openMail}
        style={{
          padding: "10px 12px",
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.10)",
          color: "rgba(255,255,255,0.9)",
          cursor: "pointer",
          width: 160,
        }}
      >
        Send via Mail
      </button>
    </div>
  );
}
