import { useCallback, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { downloadFile } from "../utils/download";
import nebulaLogo from "../assets/logos/nebula.png";

type RunStatus = "idle" | "running" | "success" | "error";

interface HeaderProps {
  code: string;
  onRun: () => void;
  runStatus: RunStatus;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({
  code,
  onRun,
  runStatus,
  sidebarOpen,
  onToggleSidebar,
}: HeaderProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [toastVisible, setToastVisible] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState("copied");
      setToastVisible(true);
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {}
  }, [code]);

  useEffect(() => {
    if (!toastVisible) return;
    const timer = setTimeout(() => setToastVisible(false), 2000);
    return () => clearTimeout(timer);
  }, [toastVisible]);

  const handleDownload = useCallback(() => {
    downloadFile(code, "project.js");
  }, [code]);

  const statusLabel =
    runStatus === "running"
      ? "Running"
      : runStatus === "success"
        ? "Executed"
        : runStatus === "error"
          ? "Error"
          : "Ready";

  const statusDotClass =
    runStatus === "running"
      ? "running"
      : runStatus === "error"
        ? "error"
        : runStatus === "success"
          ? ""
          : "idle";

  return (
    <header className="header">
      <div className="header-brand">
        <button
          className={`sidebar-toggle ${sidebarOpen ? "active" : ""}`}
          onClick={onToggleSidebar}
          aria-label="Toggle explorer"
          aria-pressed={sidebarOpen}
          data-tooltip="Toggle explorer"
        >
          <SidebarIcon />
        </button>
        <img className="header-logo" src={nebulaLogo} alt="" />
        <div className="header-product">
          <span className="header-title">Nebula</span>
          <span className="header-separator">/</span>
          <span className="header-file">project.js</span>
        </div>
      </div>

      <div className="header-center">
        <div className={`status-bar ${statusDotClass}`}>
          <div className={`status-dot ${statusDotClass}`} />
          <span className="status-text">{statusLabel}</span>
          <span className="autosave-label">Saved locally</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          className={`btn btn-ghost btn-icon ${copyState === "copied" ? "btn-copy-flash" : ""}`}
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          data-tooltip="Copy code"
        >
          {copyState === "copied" ? <CheckIcon /> : <CopyIcon />}
        </button>

        <button
          className="btn btn-ghost btn-icon"
          onClick={handleDownload}
          aria-label="Download project"
          data-tooltip="Download project.js"
        >
          <DownloadIcon />
        </button>

        <div className="header-divider" />

        <button
          className={`btn btn-run ${runStatus === "running" ? "running" : ""}`}
          onClick={onRun}
          aria-label="Run code (Ctrl+Enter)"
        >
          {runStatus === "running" ? <SpinnerIcon /> : <PlayIcon />}
          <span>{runStatus === "running" ? "Running" : "Run"}</span>
          <span className="kbd">Ctrl ↵</span>
        </button>
      </div>

      {toastVisible &&
        createPortal(
          <div className="toast-success" aria-live="polite">
            <CheckIcon />
            <span>Código copiado al portapapeles</span>
          </div>,
          document.body,
        )}
    </header>
  );
}

function PlayIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor">
      <path d="M2 1.5L10 6L2 10.5V1.5Z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      style={{ animation: "spin 0.7s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="6" cy="6" r="4.5" strokeOpacity="0.2" />
      <path d="M6 1.5A4.5 4.5 0 0 1 10.5 6" strokeLinecap="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4.5" y="4.5" width="7" height="8" rx="1" />
      <path d="M2 9V2.5A1 1 0 0 1 3 1.5H9" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      stroke="var(--success)"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 7L5.5 10L11.5 4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 1v8M4 6.5L7 9.5L10 6.5" />
      <path d="M1.5 11h11" />
    </svg>
  );
}

function SidebarIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1.5" y="2" width="13" height="12" rx="2" />
      <path d="M5.5 2v12" />
    </svg>
  );
}
