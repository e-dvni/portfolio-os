import { useEffect, useMemo, useRef, useState } from "react";
import { fetchNotes, fetchProjects, type NoteSummaryDTO, type ProjectDTO } from "../data/api";
import { useLauncher } from "../app/launcherContext";

type TermLine = { kind: "out" | "err" | "cmd"; text: string };

const mono =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New"';

function nowTime() {
  try {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function padRight(s: string, n: number) {
  if (s.length >= n) return s;
  return s + " ".repeat(n - s.length);
}

function ellip(s: string, n: number) {
  if (s.length <= n) return s;
  return s.slice(0, Math.max(0, n - 1)) + "…";
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

function tokenize(input: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (!inQuotes && /\s/.test(ch)) {
      if (cur.length) out.push(cur);
      cur = "";
      continue;
    }

    cur += ch;
  }

  if (cur.length) out.push(cur);
  return out;
}

function isProbablyNoteSlug(s: string) {
  return /^[a-z0-9][a-z0-9-_]*$/i.test(s);
}

export function TerminalApp() {
  const { openNote } = useLauncher();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const [lines, setLines] = useState<TermLine[]>([
    { kind: "out", text: `Portfolio OS Terminal — ${nowTime()}` },
    { kind: "out", text: "Type `help` to see commands. Try `projects` or `notes`." },
  ]);

  const [history, setHistory] = useState<string[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[] | null>(null);
  const [notes, setNotes] = useState<NoteSummaryDTO[] | null>(null);

  const commandNames = useMemo(
    () => ["help", "clear", "whoami", "skills", "time", "projects", "notes", "open", "contact", "github", "linkedin", "email"],
    []
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const push = (l: TermLine | TermLine[]) => {
    setLines((prev) => prev.concat(l));
  };

  const ensureProjects = async (): Promise<ProjectDTO[] | null> => {
    if (projects) return projects;

    push({ kind: "out", text: "Fetching projects from API…" });
    try {
      const data = await fetchProjects();
      setProjects(data);
      push({ kind: "out", text: `Loaded ${data.length} project(s).` });
      return data;
    } catch {
      push({ kind: "err", text: "Failed to load projects (API unavailable). Try again later." });
      setProjects([]);
      return [];
    }
  };

  const ensureNotes = async (): Promise<NoteSummaryDTO[] | null> => {
    if (notes) return notes;

    push({ kind: "out", text: "Fetching notes from API…" });
    try {
      const data = await fetchNotes();
      setNotes(data);
      push({ kind: "out", text: `Loaded ${data.length} note(s).` });
      return data;
    } catch {
      push({ kind: "err", text: "Failed to load notes (API unavailable). Try again later." });
      setNotes([]);
      return [];
    }
  };

  const printHelp = (cmd?: string) => {
    const c = cmd ? normalize(cmd) : "";

    const blocks: Record<string, string[]> = {
      help: ["help", "help <command>", "Show available commands."],
      clear: ["clear", "Clear the terminal screen."],
      whoami: ["whoami", "Print a short profile summary."],
      skills: ["skills", "Show a quick skill matrix."],
      time: ["time", "Print the current time."],
      projects: ["projects", "List projects loaded from the Rails API."],
      notes: ["notes", "List notes available from the Rails API."],
      open: [
        "open <#|project name|note-slug> [repo|live]",
        "open new <#|project name|note-slug> [repo|live]",
        "Examples:",
        "  open 1",
        '  open "Custom LED Builder" live',
        "  open about",
        "  open new edu-cs50",
      ],
      contact: ["contact", "Show contact shortcuts."],
      github: ["github", "Open GitHub in a new tab."],
      linkedin: ["linkedin", "Open LinkedIn in a new tab."],
      email: ["email", "Open mailto link."],
    };

    if (c && blocks[c]) {
      push([
        { kind: "out", text: blocks[c][0] },
        { kind: "out", text: `  ${blocks[c].slice(1).join("\n  ")}` },
      ]);
      return;
    }

    push([
      { kind: "out", text: "Commands:" },
      { kind: "out", text: "  help [cmd]   clear   whoami   skills   time" },
      { kind: "out", text: "  projects     notes   open     contact" },
      { kind: "out", text: "  github       linkedin email" },
      { kind: "out", text: "Tips:" },
      { kind: "out", text: "  • Use ↑ / ↓ for history" },
      { kind: "out", text: "  • Press Tab to autocomplete commands (and open targets)" },
      { kind: "out", text: "  • `open <slug>` reuses the current Notes window" },
      { kind: "out", text: "  • `open new <slug>` opens a separate Notes window" },
    ]);
  };

  const printWhoami = () => {
    push([
      { kind: "out", text: "Daniel Lee" },
      { kind: "out", text: "Builder mindset • React + Rails • Product-oriented engineering" },
      { kind: "out", text: "Type `projects` or `notes`." },
    ]);
  };

  const printSkills = () => {
    push([
      { kind: "out", text: "Skill Matrix" },
      { kind: "out", text: "  Frontend: React, TypeScript, Vite, UI state mgmt" },
      { kind: "out", text: "  Backend:   Rails APIs, auth flows, CRUD, data modeling" },
      { kind: "out", text: "  Product:   UX polish, OS-like windowing, live CMS" },
      { kind: "out", text: "  Workflow:  Git/GitHub, debugging, incremental delivery" },
    ]);
  };

  const printProjects = async () => {
    const data = await ensureProjects();
    if (!data) return;

    if (data.length === 0) {
      push({ kind: "out", text: "No projects found." });
      return;
    }

    const sorted = data.slice().sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));

    const idxW = 3;
    const titleW = 28;
    const stackW = 22;

    push({ kind: "out", text: "" });
    push({
      kind: "out",
      text: `${padRight("#", idxW)}  ${padRight("Title", titleW)}  ${padRight("Stack", stackW)}  Links`,
    });
    push({ kind: "out", text: `${"-".repeat(idxW)}  ${"-".repeat(titleW)}  ${"-".repeat(stackW)}  -----` });

    sorted.forEach((p, i) => {
      const n = String(i + 1);
      const title = ellip(p.title ?? "Untitled", titleW);
      const stack = ellip(p.tech_stack ?? "—", stackW);
      const links = `${p.repo_url ? "repo" : "—"} / ${p.live_url ? "live" : "—"}`;
      push({ kind: "out", text: `${padRight(n, idxW)}  ${padRight(title, titleW)}  ${padRight(stack, stackW)}  ${links}` });
    });

    push({ kind: "out", text: "" });
    push({ kind: "out", text: "Use `open <#>` or `open <name>` to open a project." });
  };

  const printNotes = async () => {
    const data = await ensureNotes();
    if (!data) return;

    if (data.length === 0) {
      push({ kind: "out", text: "No notes found." });
      return;
    }

    const sorted = data.slice().sort((a, b) => normalize(a.title).localeCompare(normalize(b.title)));

    const slugW = 18;
    const titleW = 34;

    push({ kind: "out", text: "" });
    push({ kind: "out", text: `${padRight("Slug", slugW)}  ${padRight("Title", titleW)}` });
    push({ kind: "out", text: `${"-".repeat(slugW)}  ${"-".repeat(titleW)}` });

    sorted.forEach((n) => {
      push({
        kind: "out",
        text: `${padRight(ellip(n.slug, slugW), slugW)}  ${padRight(ellip(n.title, titleW), titleW)}`,
      });
    });

    push({ kind: "out", text: "" });
    push({ kind: "out", text: "Use `open <slug>` to open a note. Example: `open about`" });
  };

  const openProject = async (target: string, which?: string) => {
    const data = await ensureProjects();
    if (!data) return;

    const sorted = data.slice().sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999));

    let proj: ProjectDTO | null = null;

    const n = Number(target);
    if (!Number.isNaN(n) && Number.isFinite(n)) {
      const idx = clamp(Math.floor(n) - 1, 0, sorted.length - 1);
      proj = sorted[idx] ?? null;
    } else {
      const t = normalize(target);
      proj =
        sorted.find((p) => normalize(p.title ?? "") === t) ??
        sorted.find((p) => normalize(p.title ?? "").includes(t)) ??
        null;
    }

    if (!proj) {
      push({ kind: "err", text: `Project not found: ${target}` });
      return;
    }

    const mode = normalize(which ?? "");
    const repo = proj.repo_url ?? "";
    const live = proj.live_url ?? "";

    if (mode === "repo") {
      if (!repo) return push({ kind: "err", text: "That project has no repo URL." });
      window.open(repo, "_blank", "noopener,noreferrer");
      push({ kind: "out", text: `Opened repo: ${proj.title}` });
      return;
    }

    if (mode === "live") {
      if (!live) return push({ kind: "err", text: "That project has no live URL." });
      window.open(live, "_blank", "noopener,noreferrer");
      push({ kind: "out", text: `Opened live: ${proj.title}` });
      return;
    }

    if (live) {
      window.open(live, "_blank", "noopener,noreferrer");
      push({ kind: "out", text: `Opened live: ${proj.title}` });
      return;
    }
    if (repo) {
      window.open(repo, "_blank", "noopener,noreferrer");
      push({ kind: "out", text: `Opened repo: ${proj.title}` });
      return;
    }

    push({ kind: "err", text: "No links found for that project (repo/live missing)." });
  };

  const openNoteBySlug = async (slug: string, newWindow: boolean) => {
    const data = await ensureNotes();
    if (!data) return;

    const s = normalize(slug);
    const found = data.find((n) => normalize(n.slug) === s);

    if (!found) {
      push({ kind: "err", text: `Note not found: ${slug}. Run \`notes\` to list slugs.` });
      return;
    }

    openNote({ title: found.title, slug: found.slug }, { newWindow });

    push({ kind: "out", text: `Opened note: ${found.title}${newWindow ? " (new window)" : ""}` });
  };

  const printContact = () => {
    push([
      { kind: "out", text: "Contact shortcuts:" },
      { kind: "out", text: "  email     → open mailto" },
      { kind: "out", text: "  github    → open GitHub profile" },
      { kind: "out", text: "  linkedin  → open LinkedIn profile" },
    ]);
  };

  const runCommand = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setHistory((h) => [...h, trimmed]);
    push({ kind: "cmd", text: `> ${trimmed}` });

    const parts = tokenize(trimmed);
    const cmd = normalize(parts[0] ?? "");

    if (cmd === "help") return printHelp(parts[1]);
    if (cmd === "clear") {
      setLines([{ kind: "out", text: `Portfolio OS Terminal — ${nowTime()}` }]);
      return;
    }
    if (cmd === "whoami") return printWhoami();
    if (cmd === "skills") return printSkills();
    if (cmd === "time") return push({ kind: "out", text: nowTime() });

    if (cmd === "projects") return printProjects();
    if (cmd === "notes") return printNotes();

    if (cmd === "open") {
      const a1 = parts[1];
      const a2 = parts[2];
      const a3 = parts[3];

      if (!a1) {
        return push({ kind: "err", text: "Usage: open <#|project name|note-slug> [repo|live]" });
      }

      const isNew = normalize(a1) === "new";
      const target = isNew ? a2 : a1;
      const whichArg = isNew ? a3 : a2;

      if (!target) {
        return push({ kind: "err", text: "Usage: open new <#|project name|note-slug> [repo|live]" });
      }

      const which = normalize(whichArg ?? "");

      if (which === "repo" || which === "live") {
        return openProject(target, whichArg);
      }

      // Prefer note if slug exists
      if (isProbablyNoteSlug(target)) {
        const noteList = await ensureNotes();
        const hit = noteList?.some((n) => normalize(n.slug) === normalize(target));
        if (hit) return openNoteBySlug(target, isNew);
      }

      // Otherwise project
      return openProject(target, whichArg);
    }

    if (cmd === "contact") return printContact();

    if (cmd === "github") {
      window.open("https://github.com/e-dvni", "_blank", "noopener,noreferrer");
      push({ kind: "out", text: "Opened GitHub." });
      return;
    }

    if (cmd === "linkedin") {
      window.open("https://www.linkedin.com/in/daniel-lee-7157a31a8/", "_blank", "noopener,noreferrer");
      push({ kind: "out", text: "Opened LinkedIn." });
      return;
    }

    if (cmd === "email") {
      window.open("mailto:danielslee078@gmail.com?subject=Portfolio%20Contact", "_blank");
      push({ kind: "out", text: "Opened email." });
      return;
    }

    push({ kind: "err", text: `Unknown command: ${cmd}. Type \`help\`.` });
  };

  const tryAutocomplete = async () => {
    const el = inputRef.current;
    if (!el) return;

    const raw = el.value;
    const parts = tokenize(raw);

    // command autocomplete
    if (parts.length <= 1 && !raw.includes(" ")) {
      const prefix = normalize(raw);
      const matches = commandNames.filter((c) => c.startsWith(prefix));
      if (matches.length === 1) el.value = matches[0] + " ";
      else if (matches.length > 1) push({ kind: "out", text: matches.join("   ") });
      return;
    }

    const cmd = normalize(parts[0] ?? "");
    if (cmd !== "open") return;

    // support "open new <target>"
    const isNew = normalize(parts[1] ?? "") === "new";
    const targetPrefix = isNew ? (parts[2] ?? "") : (parts[1] ?? "");
    const pref = normalize(targetPrefix);

    const projData = await ensureProjects();
    const noteData = await ensureNotes();

    const projCandidates =
      (projData ?? [])
        .slice()
        .sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999))
        .map((p, i) => ({
          key: String(i + 1),
          label: `${i + 1}:${p.title ?? ""}`,
          value: `"${p.title ?? ""}"`,
        })) ?? [];

    const noteCandidates =
      (noteData ?? [])
        .slice()
        .sort((a, b) => normalize(a.slug).localeCompare(normalize(b.slug)))
        .map((n) => ({ key: n.slug, label: `note:${n.slug}`, value: n.slug })) ?? [];

    const matches = [
      ...projCandidates.filter((c) => normalize(c.key).startsWith(pref) || normalize(c.value).includes(pref)),
      ...noteCandidates.filter((c) => normalize(c.key).startsWith(pref)),
    ];

    if (matches.length === 1) {
      if (isNew) el.value = `${parts[0]} new ${matches[0].value} `;
      else el.value = `${parts[0]} ${matches[0].value} `;
      return;
    }

    if (matches.length > 1) {
      push({ kind: "out", text: matches.slice(0, 10).map((m) => m.label).join("   ") });
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;

    if (e.key === "Enter") {
      const v = el.value;
      el.value = "";
      void runCommand(v);
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      el.value = history[history.length - 1] ?? "";
      requestAnimationFrame(() => {
        el.selectionStart = el.value.length;
        el.selectionEnd = el.value.length;
      });
      return;
    }

    if (e.key === "Tab") {
      e.preventDefault();
      void tryAutocomplete();
    }
  };

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 16,
        fontFamily: mono,
        fontSize: 13,
        minHeight: 0,
      }}
      onMouseDown={() => inputRef.current?.focus()}
    >
      <div
        ref={scrollRef}
        style={{
          flex: "1 1 auto",
          minHeight: 0,
          overflow: "auto",
          whiteSpace: "pre-wrap",
          color: "rgba(255,255,255,0.85)",
          paddingRight: 6,
        }}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              color:
                l.kind === "err"
                  ? "rgba(255,160,160,0.92)"
                  : l.kind === "cmd"
                  ? "rgba(255,255,255,0.92)"
                  : "rgba(255,255,255,0.85)",
            }}
          >
            {l.text}
          </div>
        ))}
      </div>

      <input
        ref={inputRef}
        autoFocus
        onKeyDown={onKeyDown}
        placeholder="Type a command… (help, projects, notes, open about)"
        style={{
          marginTop: 12,
          width: "100%",
          padding: "10px 10px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.12)",
          background: "rgba(0,0,0,0.35)",
          color: "rgba(255,255,255,0.9)",
          outline: "none",
          fontFamily: mono,
          fontSize: 13,
        }}
      />
    </div>
  );
}
