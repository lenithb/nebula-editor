import { useRef, useEffect } from "react";
import { buildSandboxHTML } from "../utils/sandbox";
import type { ConsoleLevel } from "../hooks/useConsole";

interface PreviewProps {
  code: string;
  runKey: number;
  onConsoleMessage: (level: ConsoleLevel, message: string) => void;
}

export function Preview({ code, runKey, onConsoleMessage }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
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
          Preview
        </div>
        <div className="panel-actions">
          {hasRun && (
            <span className="live-badge">
              <span className="live-dot" />
              live
            </span>
          )}
        </div>
      </div>

      <div className="preview-body">
        {!hasRun && (
          <div className="preview-placeholder">
            <EmptyPreviewIcon />
            <p>Press Run to execute your code</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          className="preview-iframe"
          sandbox="allow-scripts"
          title="Code Preview"
          style={{ display: hasRun ? "block" : "none" }}
        />
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
