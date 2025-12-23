import { useEffect, useState } from "react";
import { API_BASE } from "../data/api";

type LoginResp = { token: string; email: string };
type NoteResp = { title: string; body: string };

const STORAGE_KEY = "portfolio_admin_token";

type ApiError = {
  status: number;
  statusText: string;
  bodyText?: string;
};

function isApiError(x: unknown): x is ApiError {
  return (
    typeof x === "object" &&
    x !== null &&
    "status" in x &&
    "statusText" in x &&
    typeof (x as { status: unknown }).status === "number" &&
    typeof (x as { statusText: unknown }).statusText === "string"
  );
}

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw {
      status: res.status,
      statusText: res.statusText,
      bodyText,
    } satisfies ApiError;
  }
  return res.json() as Promise<T>;
}

function errorMessage(err: unknown): string {
  if (isApiError(err)) {
    const extra = err.bodyText ? ` — ${err.bodyText}` : "";
    return `${err.status} ${err.statusText}${extra}`;
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

function errorStatus(err: unknown): number | null {
  return isApiError(err) ? err.status : null;
}

export function AdminCmsApp() {
  const [email, setEmail] = useState("danielslee078@gmail.com");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? "");
  const [status, setStatus] = useState<string>("");

  const [noteTitle, setNoteTitle] = useState("About Me");
  const [noteBody, setNoteBody] = useState("");
  const [loadingNote, setLoadingNote] = useState(false);

  const authed = token.length > 0;

  useEffect(() => {
    if (!authed) return;

    let alive = true;

    (async () => {
      setLoadingNote(true);
      try {
        const res = await fetch(`${API_BASE}/api/notes/about`);
        const data = await jsonOrThrow<NoteResp>(res);
        if (!alive) return;

        setNoteTitle(data.title);
        setNoteBody(data.body);
        setStatus("Loaded About note.");
      } catch (err: unknown) {
        if (!alive) return;
        setStatus(errorMessage(err));
      } finally {
        if (alive) setLoadingNote(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [authed]);

  const login = async () => {
    setStatus("Logging in…");
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await jsonOrThrow<LoginResp>(res);

      localStorage.setItem(STORAGE_KEY, data.token);
      setToken(data.token);
      setPassword("");
      setStatus(`Logged in as ${data.email}`);
    } catch (err: unknown) {
      setStatus(errorMessage(err));
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setStatus("Logged out.");
  };

  const saveAbout = async () => {
    setStatus("Saving…");
    try {
      const res = await fetch(`${API_BASE}/api/admin/notes/about`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ no brackets
        },
        body: JSON.stringify({ note: { title: noteTitle, body: noteBody } }),
      });

      await jsonOrThrow<NoteResp>(res);
      setStatus("Saved ✅");
    } catch (err: unknown) {
      const status = errorStatus(err);

      // If token expired/invalid, force logout and show message
      if (status === 401) {
        logout();
        setStatus("Session expired. Please log in again.");
        return;
      }

      setStatus(errorMessage(err));
    }
  };

  return (
    <div
      style={{
        padding: 16,
        height: "100%",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <h3 style={{ margin: 0 }}>Admin CMS</h3>
        <div style={{ marginLeft: "auto", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
          {authed ? "Authenticated" : "Not logged in"}
        </div>
      </div>

      {!authed ? (
        <div style={{ marginTop: 14, maxWidth: 420 }}>
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="email"
              />
            </label>

            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
              Password
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                style={inputStyle}
                placeholder="password"
              />
            </label>

            <button onClick={login} style={btnStyle}>
              Login
            </button>

            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
              Tip: This is for local dev right now. We’ll harden it before deploy.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={logout} style={{ ...btnStyle, width: "fit-content" }}>
              Logout
            </button>
            {loadingNote && (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>Loading…</div>
            )}
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Edit About Note</div>

            <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} style={inputStyle} />

            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              style={{ ...inputStyle, minHeight: 220, resize: "vertical" }}
            />

            <button onClick={saveAbout} style={btnStyle}>
              Save About
            </button>
          </div>
        </div>
      )}

      <div style={{ marginTop: 10, fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
        {status}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 6,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "rgba(255,255,255,0.92)",
  outline: "none",
};

const btnStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.10)",
  color: "rgba(255,255,255,0.92)",
  cursor: "pointer",
  fontWeight: 650,
};
