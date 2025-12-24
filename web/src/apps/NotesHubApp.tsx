import { useEffect, useMemo, useState } from "react";
import { fetchNotes, fetchNote } from "../data/api";

type NoteSummary = { slug: string; title: string };
type Note = { slug: string; title: string; body: string };

const FALLBACK_NOTES: Note[] = [
  {
    slug: "about",
    title: "About Me",
    body: `
Junior software developer with hands-on experience building production-level React
applications and custom web tools. Strong frontend foundation with growing full-stack
skills, including API integration, authentication, and admin dashboards.

Currently expanding CS fundamentals through Harvard’s CS50.
`.trim(),
  },
  { slug: "edu-cs50", title: "Harvard CS50", body: "Loading… (API unavailable fallback)" },
  {
    slug: "edu-learn-academy",
    title: "LEARN Academy (Frontend)",
    body: "Loading… (API unavailable fallback)",
  },
  { slug: "edu-kean", title: "Kean University — Accounting", body: "Loading… (API unavailable fallback)" },
];

function toNoteSummary(x: unknown): NoteSummary | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;

  const slug = typeof o.slug === "string" ? o.slug.trim() : "";
  if (!slug) return null;

  const titleRaw = o.title;
  const title =
    typeof titleRaw === "string" && titleRaw.trim()
      ? titleRaw.trim()
      : slug;

  return { slug, title };
}

export function NotesHubApp({ initialSlug }: { initialSlug?: string }) {
  const normalizedInitial = (initialSlug ?? "").trim();

  const [source, setSource] = useState<"api" | "fallback">("api");
  const [list, setList] = useState<NoteSummary[]>([]);
  const [activeSlug, setActiveSlug] = useState<string>(normalizedInitial || "about");

  const [note, setNote] = useState<Note | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [loadingNote, setLoadingNote] = useState(false);

  const fallbackList = useMemo(
    () => FALLBACK_NOTES.map((n) => ({ slug: n.slug, title: n.title })),
    []
  );

  const getFallbackNote = (slug: string): Note => {
    const found = FALLBACK_NOTES.find((n) => n.slug === slug);
    return found ?? { slug, title: slug, body: "Note not available." };
  };

  // If the window retargets NotesHub with a new slug, follow it.
  useEffect(() => {
    const s = normalizedInitial;
    if (!s) return;
    setActiveSlug((prev) => (prev === s ? prev : s));
  }, [normalizedInitial]);

  // Load list
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingList(true);
      try {
        const data = await fetchNotes(); // expects [{slug,title}]
        if (!alive) return;

        const mapped = (Array.isArray(data) ? data : [])
          .map(toNoteSummary)
          .filter((x): x is NoteSummary => Boolean(x));

        const finalList = mapped.length ? mapped : fallbackList;

        setList(finalList);
        setSource(mapped.length ? "api" : "fallback");

        // Keep activeSlug valid; prefer initialSlug if it's present in the list.
        const slugs = new Set(finalList.map((x) => x.slug));
        const preferred =
          normalizedInitial && slugs.has(normalizedInitial) ? normalizedInitial : null;

        setActiveSlug((prev) => {
          if (preferred) return preferred;
          if (slugs.has(prev)) return prev;
          return finalList[0]?.slug ?? "about";
        });
      } catch {
        if (!alive) return;

        setList(fallbackList);
        setSource("fallback");

        // if API fails, still honor initialSlug if it exists in fallback
        const slugs = new Set(fallbackList.map((x) => x.slug));
        if (normalizedInitial && slugs.has(normalizedInitial)) setActiveSlug(normalizedInitial);
      } finally {
        if (alive) setLoadingList(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [fallbackList, normalizedInitial]);

  // Load active note
  useEffect(() => {
    let alive = true;

    (async () => {
      setLoadingNote(true);
      try {
        const data = await fetchNote(activeSlug); // expects {title, body}
        if (!alive) return;

        setNote({ slug: activeSlug, title: data.title, body: data.body });
      } catch {
        if (!alive) return;
        setNote(getFallbackNote(activeSlug));
      } finally {
        if (alive) setLoadingNote(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [activeSlug]);

  return (
    <div style={{ height: "100%", display: "grid", gridTemplateColumns: "260px 1fr" }}>
      {/* Sidebar */}
      <div
        style={{
          borderRight: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(0,0,0,0.18)",
          padding: 12,
          overflow: "auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.60)" }}>Notes</div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            {loadingList ? "Loading…" : source === "api" ? "API" : "Local"}
          </div>
        </div>

        {list.map((n) => {
          const active = n.slug === activeSlug;
          return (
            <button
              key={n.slug}
              onClick={() => setActiveSlug(n.slug)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "10px 10px",
                marginBottom: 8,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.10)",
                background: active ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.20)",
                color: "rgba(255,255,255,0.92)",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 750, fontSize: 13 }}>{n.title}</div>
              <div style={{ marginTop: 4, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                {n.slug}
              </div>
            </button>
          );
        })}
      </div>

      {/* Note viewer */}
      <div style={{ padding: 16, overflow: "auto" }}>
        {loadingNote ? (
          <div style={{ padding: 18, opacity: 0.7 }}>Loading note…</div>
        ) : !note ? (
          <div style={{ padding: 18, color: "rgba(255,255,255,0.6)" }}>Failed to load note.</div>
        ) : (
          <div style={{ lineHeight: 1.55 }}>
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
              Slug: {note.slug} • Source: {source === "api" ? "Rails API" : "Local fallback"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
