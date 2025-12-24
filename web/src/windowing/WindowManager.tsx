import { useEffect } from "react";
import type { WindowState } from "./types";
import { WindowFrame } from "./WindowFrame";
import { useAppRegistry } from "../app/appRegistryContext";

import { PdfViewerApp } from "../apps/PdfViewerApp";
import { IframeApp } from "../apps/IframeApp";
import { NotesApp } from "../apps/NotesApp";
import { FinderApp } from "../apps/FinderApp";
import { TerminalApp } from "../apps/TerminalApp";
import { MailApp } from "../apps/MailApp";
import { AdminDashboardApp } from "../apps/AdminDashboardApp";
import { AdminCmsApp } from "../apps/AdminCmsApp";

function InternalApp({ internalKey, appId }: { internalKey?: string; appId: string }) {
  switch (internalKey) {
    case "notes":
      // For internal notes apps, we treat appId as the note slug (e.g. "about")
      return <NotesApp slug={appId} />;
    case "finder":
      return <FinderApp />;
    case "terminal":
      return <TerminalApp />;
    case "mail":
      return <MailApp />;
    case "admin":
      return <AdminDashboardApp />;
    case "admin-cms":
      return <AdminCmsApp />;
    default:
      return <div style={{ padding: 16 }}>Unknown internal app</div>;
  }
}

export function WindowManager(props: {
  wins: WindowState[];
  onClose: (winId: string) => void;
  onMinimize: (winId: string) => void;
  onToggleMaximize: (winId: string) => void;
  onFocus: (winId: string) => void;
  onMove: (winId: string, x: number, y: number) => void;
  onResize: (winId: string, w: number, h: number) => void;
}) {
  const { wins, onClose, onMinimize, onToggleMaximize, onFocus, onMove, onResize } = props;
  const { getApp } = useAppRegistry();

  return (
    <>
      {wins
        .filter((w) => !w.minimized)
        .map((win) => {
          // dynamic url window?
          if (win.appId.startsWith("__url__:")) {
            const [, kind, encoded] = win.appId.split(":");
            const url = decodeURIComponent(encoded ?? "");

            return (
              <WindowFrame
                key={win.winId}
                win={win}
                onClose={() => onClose(win.winId)}
                onMinimize={() => onMinimize(win.winId)}
                onToggleMaximize={() => onToggleMaximize(win.winId)}
                onFocus={() => onFocus(win.winId)}
                onMove={(x, y) => onMove(win.winId, x, y)}
                onResize={(w, h) => onResize(win.winId, w, h)}
              >
                {kind === "external" ? <ExternalOpener url={url} /> : <IframeApp src={url} />}
              </WindowFrame>
            );
          }

          // dynamic note window?
          if (win.appId.startsWith("__note__:")) {
            const [, encoded] = win.appId.split(":");
            const slug = decodeURIComponent(encoded ?? "");

            return (
              <WindowFrame
                key={win.winId}
                win={win}
                onClose={() => onClose(win.winId)}
                onMinimize={() => onMinimize(win.winId)}
                onToggleMaximize={() => onToggleMaximize(win.winId)}
                onFocus={() => onFocus(win.winId)}
                onMove={(x, y) => onMove(win.winId, x, y)}
                onResize={(w, h) => onResize(win.winId, w, h)}
              >
                <NotesApp slug={slug} />
              </WindowFrame>
            );
          }

          const app = getApp(win.appId);

          return (
            <WindowFrame
              key={win.winId}
              win={win}
              onClose={() => onClose(win.winId)}
              onMinimize={() => onMinimize(win.winId)}
              onToggleMaximize={() => onToggleMaximize(win.winId)}
              onFocus={() => onFocus(win.winId)}
              onMove={(x, y) => onMove(win.winId, x, y)}
              onResize={(w, h) => onResize(win.winId, w, h)}
            >
              {!app ? (
                <div style={{ padding: 16 }}>App not found</div>
              ) : app.type === "pdf" ? (
                <PdfViewerApp src={app.url!} />
              ) : app.type === "iframe" ? (
                <IframeApp src={app.url!} />
              ) : app.type === "external" ? (
                <ExternalOpener url={app.url!} />
              ) : (
                <InternalApp internalKey={app.internalKey} appId={app.id} />
              )}
            </WindowFrame>
          );
        })}
    </>
  );
}

function ExternalOpener({ url }: { url: string }) {
  useEffect(() => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, [url]);

  return <div style={{ padding: 16 }}>Opening…</div>;
}
