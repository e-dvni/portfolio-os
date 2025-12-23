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

function InternalApp({ internalKey }: { internalKey?: string }) {
  switch (internalKey) {
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
  const { getApp } = useAppRegistry();

  return (
    <>
      {wins.map((win) => {
        const app = getApp(win.appId);

        return (
          <WindowFrame
            key={win.winId}
            win={win}
            onClose={() => onClose(win.winId)}
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
              // external app: open in new tab and show message
              <ExternalOpener url={app.url!} />
            ) : (
              <InternalApp internalKey={app.internalKey} />
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
