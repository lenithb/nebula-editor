import { useRef, useEffect, useState } from "react";
import type { ConsoleEntry } from "../hooks/useConsole";

interface ConsoleProps {
  entries: ConsoleEntry[];
  onClear: () => void;
  errorCount: number;
  warnCount: number;
  height: number;
  onHeightChange: (h: number) => void;
}

export function Console({
  entries,
  onClear,
  errorCount,
  warnCount,
  height,
  onHeightChange,
}: ConsoleProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    if (!collapsed && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [entries, collapsed]);

  function handleResizeMouseDown(e: React.MouseEvent) {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = height;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const delta = startYRef.current - e.clientY;
      const newHeight = Math.max(120, Math.min(520, startHeightRef.current + delta));
      onHeightChange(newHeight);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.querySelectorAll("iframe").forEach((f) => (f.style.pointerEvents = ""));
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    document.querySelectorAll("iframe").forEach((f) => (f.style.pointerEvents = "none"));
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  const countClass =
    errorCount > 0
      ? "has-errors"
      : warnCount > 0
      ? "has-warnings"
      : "";

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div
      className="console-panel"
      style={{ height: collapsed ? 38 : height, minHeight: collapsed ? 38 : 120 }}
    >
      <div
        className="resize-handle-horizontal"
        onMouseDown={handleResizeMouseDown}
        style={{ display: collapsed ? "none" : "block" }}
      />

      <div className="console-header" onClick={() => setCollapsed((c) => !c)}>
        <div className="console-header-left">
          <div className="console-title">
            <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>
              <TerminalIcon />
            </span>
            Console
          </div>
          <span className={`console-count ${countClass}`}>
            {entries.length}
          </span>
        </div>

        <div className="console-header-right">
          {entries.length > 0 && (
            <button
              className="btn btn-ghost btn-icon"
              style={{ height: 24, width: 24 }}
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              data-tooltip="Clear"
              aria-label="Clear console"
            >
              <ClearIcon />
            </button>
          )}
          <span className={`console-toggle ${collapsed ? "" : "open"}`}>
            <ChevronIcon />
          </span>
        </div>
      </div>

      {!collapsed && (
        <div className="console-body" ref={bodyRef}>
          {entries.length === 0 ? (
            <div className="console-empty">
              <TerminalEmptyIcon />
              <p>No output yet</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className={`console-entry ${entry.level}`}>
                <span className="console-entry-icon">
                  {entry.level === "log" && <LogIcon />}
                  {entry.level === "warn" && <WarnIcon />}
                  {entry.level === "error" && <ErrorIcon />}
                  {entry.level === "info" && <InfoIcon />}
                </span>
                <span className="console-entry-content">{entry.message}</span>
                <span className="console-entry-time">{formatTime(entry.timestamp)}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function TerminalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="11" height="9" rx="1.5" />
      <path d="M3.5 5L5.5 6.5L3.5 8" />
      <path d="M6.5 8h3" />
    </svg>
  );
}

function TerminalEmptyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="20" height="16" rx="2.5" />
      <path d="M5 8.5l3 2.5-3 2.5" />
      <path d="M11 13.5h5" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M1.5 1.5l8 8M9.5 1.5l-8 8" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4.5L6 8.5L10 4.5" />
    </svg>
  );
}

function LogIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 10 10" fill="currentColor">
      <circle cx="5" cy="5" r="2" />
    </svg>
  );
}

function WarnIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5.5 1L10 9.5H1L5.5 1Z" />
      <path d="M5.5 4.5v2" />
      <circle cx="5.5" cy="7.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="5.5" cy="5.5" r="4.5" />
      <path d="M3.5 3.5l4 4M7.5 3.5l-4 4" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 11 11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="5.5" cy="5.5" r="4.5" />
      <path d="M5.5 5v3" />
      <circle cx="5.5" cy="3.2" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
