import { useEffect, useState } from "react";
import { fetchNote } from "../data/api";

type Note = {
  title: string;
  body: string;
};

const FALLBACK_NOTE: Note = {
  title: "About Me",
  body: `
Junior software developer with hands-on experience building production-level React
applications and custom web tools. Strong frontend foundation with growing full-stack
skills, including API integration, authentication, and admin dashboards.

Currently expanding CS fundamentals through Harvard’s CS50.

(This content will be editable later via the Rails admin CMS.)
`.trim(),
};

export function NotesApp() {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"api" | "fallback">("api");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const data = await fetchNote("about");

        if (!alive) return;

        setNote({
          title: data.title,
          body: data.body,
        });
        setSource("api");
      } catch {
        if (!alive) return;

        setNote(FALLBACK_NOTE);
        setSource("fallback");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 18, opacity: 0.7 }}>
        Loading note…
      </div>
    );
  }

  if (!note) {
    return (
      <div style={{ padding: 18, color: "rgba(255,255,255,0.6)" }}>
        Failed to load note.
      </div>
    );
  }

  return (
    <div style={{ padding: 18, lineHeight: 1.55 }}>
      <h3 style={{ marginTop: 0 }}>{note.title}</h3>

      {note.body.split("\n\n").map((para, i) => (
        <p
          key={i}
          style={{
            color: i === 0 ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.68)",
            marginTop: i === 0 ? 12 : 14,
          }}
        >
          {para}
        </p>
      ))}

      <div
        style={{
          marginTop: 18,
          fontSize: 11,
          color: "rgba(255,255,255,0.45)",
        }}
      >
        Source: {source === "api" ? "Rails API" : "Local fallback"}
      </div>
    </div>
  );
}
