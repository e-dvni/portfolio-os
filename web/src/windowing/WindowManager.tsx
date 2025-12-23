import { APPS } from "../data/apps";
import { WindowFrame } from "./WindowFrame";
import type { WindowState } from "./types";
import { PdfViewerApp } from "../apps/PdfViewerApp";
import { IframeApp } from "../apps/IframeApp";
import { NotesApp } from "../apps/NotesApp";
import { FinderApp } from "../apps/FinderApp";
import { TerminalApp } from "../apps/TerminalApp";
import { MailApp } from "../apps/MailApp";
import { AdminDashboardApp } from "../apps/AdminDashboardApp";

function renderApp(appId: string) {
  const app = APPS.find((a) => a.id === appId);
  if (!app) return <div style={{ padding: 16 }}>App not found</div>;

  if (app.type === "pdf") return <PdfViewerApp src={app.url!} />;
  if (app.type === "iframe") return <IframeApp src={app.url!} />;
  if (app.type === "external") {
    window.open(app.url!, "_blank", "noopener,noreferrer");
    return <div style={{ padding: 16 }}>Opening {app.name}…</div>;
  }

  // internal apps
  switch (app.internalKey) {
    case "notes":
      return <NotesApp />;
    case "finder":
      return <FinderApp />;
    case "terminal":
      return <TerminalApp />;
    case "mail":
      return <MailApp />;
    case "admin":
      return <AdminDashboardApp />;
    default:
      return <div style={{ padding: 16 }}>Unknown internal app</div>;
  }
}

export function WindowManager(props: {
  wins: WindowState[];
  onClose: (winId: string) => void;
  onFocus: (winId: string) => void;
  onMove: (winId: string, x: number, y: number) => void;
  onResize: (winId: string, w: number, h: number) => void;
}) {
  const { wins, onClose, onFocus, onMove, onResize } = props;

  return (
    <>
      {wins.map((win) => (
        <WindowFrame
          key={win.winId}
          win={win}
          onClose={() => onClose(win.winId)}
          onFocus={() => onFocus(win.winId)}
          onMove={(x, y) => onMove(win.winId, x, y)}
          onResize={(w, h) => onResize(win.winId, w, h)}
        >
          {renderApp(win.appId)}
        </WindowFrame>
      ))}
    </>
  );
}
