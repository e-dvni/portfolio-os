import { useEffect, useMemo, useState } from "react";
import { fetchNote } from "../data/api";

type Note = {
  title: string;
  body: string;
};

type Props = {
  slug: string;
};

const FALLBACKS: Record<string, Note> = {
  about: {
    title: "About Me",
    body: `
Junior software developer with hands-on experience building production-level React
applications and custom web tools. Strong frontend foundation with growing full-stack
skills, including API integration, authentication, and admin dashboards.

Currently expanding CS fundamentals through Harvard’s CS50.

(This content will be editable later via the Rails admin CMS.)
`.trim(),
  },
  // Optional: add fallback shells for new notes so UI never looks empty if API is down
  "edu-cs50": {
    title: "Harvard CS50",
    body: "Loading… (API unavailable fallback)",
  },
  "edu-learn-academy": {
    title: "LEARN Academy (Frontend)",
    body: "Loading… (API unavailable fallback)",
  },
  "edu-kean": {
    title: "Kean University — Accounting",
    body: "Loading… (API unavailable fallback)",
  },
};

export function NotesApp({ slug }: Props) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"api" | "fallback">("api");

  const fallback = useMemo(() => FALLBACKS[slug] ?? { title: slug, body: "Note not available." }, [slug]);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLoading(true);
      try {
        const data = await fetchNote(slug);
        if (!alive) return;

        setNote({ title: data.title, body: data.body });
        setSource("api");
      } catch {
        if (!alive) return;

        setNote(fallback);
        setSource("fallback");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [slug, fallback]);

  if (loading) {
    return <div style={{ padding: 18, opacity: 0.7 }}>Loading note…</div>;
  }

  if (!note) {
    return <div style={{ padding: 18, color: "rgba(255,255,255,0.6)" }}>Failed to load note.</div>;
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
            whiteSpace: "pre-wrap",
          }}
        >
          {para}
        </p>
      ))}

      <div style={{ marginTop: 18, fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
        Slug: {slug} • Source: {source === "api" ? "Rails API" : "Local fallback"}
      </div>
    </div>
  );
}
