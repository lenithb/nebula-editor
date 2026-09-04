import { useRef, useEffect, useState } from "react";
import { buildSandboxHTML } from "../utils/sandbox";
import type { ConsoleLevel } from "../hooks/useConsole";
import { t } from "../i18n";

interface PreviewProps {
  code: string;
  runKey: number;
  onRun: () => void;
  onClose: () => void;
  onConsoleMessage: (level: ConsoleLevel, message: string) => void;
}

type Viewport = "desktop" | "tablet" | "mobile";

export function Preview({
  code,
  runKey,
  onRun,
  onClose,
  onConsoleMessage,
}: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const hasRun = runKey > 0;

  useEffect(() => {
    if (!hasRun) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const html = buildSandboxHTML(code);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    iframe.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [runKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        event.data &&
        typeof event.data === "object" &&
        event.data.type === "console"
      ) {
        onConsoleMessage(event.data.level as ConsoleLevel, event.data.message);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onConsoleMessage]);

  return (
    <div className="panel preview-panel">
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-icon">
            <PreviewIcon />
          </span>
          <span>{t.preview}</span>
          <span className="preview-address">sandbox://project</span>
        </div>
        <div className="panel-actions">
          <div className="viewport-switcher" aria-label={t.previewViewport}>
            <button
              className={viewport === "desktop" ? "active" : ""}
              onClick={() => setViewport("desktop")}
              aria-label={t.desktopVp}
              aria-pressed={viewport === "desktop"}
              data-tooltip={t.desktop}
            >
              <DesktopIcon />
            </button>
            <button
              className={viewport === "tablet" ? "active" : ""}
              onClick={() => setViewport("tablet")}
              aria-label={t.tabletVp}
              aria-pressed={viewport === "tablet"}
              data-tooltip={t.tablet}
            >
              <TabletIcon />
            </button>
            <button
              className={viewport === "mobile" ? "active" : ""}
              onClick={() => setViewport("mobile")}
              aria-label={t.mobileVp}
              aria-pressed={viewport === "mobile"}
              data-tooltip={t.mobile}
            >
              <MobileIcon />
            </button>
          </div>
          <button
            className="panel-action-button"
            onClick={onRun}
            aria-label={t.refreshPreview}
            data-tooltip={t.refreshPreview}
          >
            <RefreshIcon />
          </button>
          {hasRun && (
            <span className="live-badge">
              <span className="live-dot" />
              {t.live}
            </span>
          )}
          <button
            className="panel-action-button"
            onClick={onClose}
            aria-label={t.closePreview}
            data-tooltip={t.closePreview}
          >
            <CloseIcon />
          </button>
        </div>
      </div>

      <div className="preview-body">
        {!hasRun && (
          <div className="preview-placeholder">
            <div className="preview-placeholder-icon">
              <EmptyPreviewIcon />
            </div>
            <div>
              <strong>{t.previewReady}</strong>
              <p>{t.previewReadyHint}</p>
            </div>
            <button className="preview-run-button" onClick={onRun}>
              <PlayIcon />
              {t.runProject}
            </button>
          </div>
        )}
        {hasRun && (
          <div className="preview-stage">
            <div className={`preview-frame ${viewport}`}>
              <iframe
                ref={iframeRef}
                className="preview-iframe"
                sandbox="allow-scripts"
                title={t.codePreview}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviewIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="11" height="9" rx="1.5" />
      <path d="M1 5h11" />
      <circle cx="3" cy="3.5" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="5" cy="3.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function EmptyPreviewIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 36 36" fill="none" stroke="#d4d4d8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="30" height="24" rx="3" />
      <path d="M3 12h30" />
      <path d="M12 20l4 4 8-8" />
    </svg>
  );
}

function DesktopIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25">
      <rect x="1.5" y="2" width="11" height="7.5" rx="1.25" />
      <path d="M5 12h4M7 9.5V12" />
    </svg>
  );
}

function TabletIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25">
      <rect x="3" y="1.25" width="8" height="11.5" rx="1.4" />
      <circle cx="7" cy="10.75" r=".45" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25">
      <rect x="4.25" y="1" width="5.5" height="12" rx="1.3" />
      <path d="M6 2.75h2" />
      <circle cx="7" cy="11.25" r=".4" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="M11.25 5A4.75 4.75 0 1 0 11 9.5" />
      <path d="M11.25 2v3h-3" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      <path d="m3.5 3.5 7 7m0-7-7 7" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor">
      <path d="m3 2 7 4-7 4V2Z" />
    </svg>
  );
}
