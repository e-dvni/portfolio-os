import { useState } from "react";

export function TerminalApp() {
  const [lines, setLines] = useState<string[]>([
    "Welcome to Daniel Lee’s Portfolio OS",
    "Would you like to contact me? (Y/N)",
  ]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    const input = (e.currentTarget.value || "").trim().toLowerCase();
    e.currentTarget.value = "";

    if (input === "y" || input === "yes") {
      setLines((l) => [...l, "> Y", "Opening Mail…"]);
      window.open("mailto:danielslee078@gmail.com?subject=Portfolio%20Contact", "_blank");
      return;
    }
    if (input === "n" || input === "no") {
      setLines((l) => [...l, "> N", "No worries. Type 'help' for commands."]);
      return;
    }
    if (input === "help") {
      setLines((l) => [...l, "> help", "Commands: help, github, linkedin, email"]);
      return;
    }
    if (input === "github") {
      window.open("https://github.com/e-dvni", "_blank", "noopener,noreferrer");
      setLines((l) => [...l, "> github", "Opened GitHub."]);
      return;
    }
    if (input === "linkedin") {
      window.open("https://www.linkedin.com/in/daniel-lee-7157a31a8/", "_blank", "noopener,noreferrer");
      setLines((l) => [...l, "> linkedin", "Opened LinkedIn."]);
      return;
    }
    if (input === "email") {
      window.open("mailto:danielslee078@gmail.com?subject=Portfolio%20Contact", "_blank");
      setLines((l) => [...l, "> email", "Opened Mail."]);
      return;
    }

    setLines((l) => [...l, `> ${input}`, "Unknown command. Type 'help'."]);
  };

  return (
    <div style={{ padding: 16, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas", fontSize: 13 }}>
      <div style={{ whiteSpace: "pre-wrap", color: "rgba(255,255,255,0.85)" }}>
        {lines.map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <input
        autoFocus
        onKeyDown={onKeyDown}
        placeholder="Type here…"
        style={{
          marginTop: 12,
          width: "100%",
          padding: "10px 10px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.35)",
          color: "rgba(255,255,255,0.9)",
          outline: "none",
        }}
      />
    </div>
  );
}
