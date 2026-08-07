import { useRef, useEffect, useState } from "react";
import type { ConsoleEntry } from "../hooks/useConsole";

interface ConsoleProps {
  entries: ConsoleEntry[];
  onClear: () => void;
  errorCount: number;
  warnCount: number;
  height: number;
  onHeightChange: (h: number) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

type ConsoleFilter = "all" | "error" | "warn";

export function Console({
  entries,
  onClear,
  errorCount,
  warnCount,
  height,
  onHeightChange,
  collapsed,
  onCollapsedChange,
}: ConsoleProps) {
  const collapsedHeight = 40;
  const bodyRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState<ConsoleFilter>("all");
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  useEffect(() => {
    if (!collapsed && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [entries, collapsed]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        onCollapsedChange(!collapsed);
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [collapsed, onCollapsedChange]);

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

  function handleResizeKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const delta = e.key === "ArrowUp" ? 16 : -16;
    onHeightChange(Math.max(120, Math.min(520, height + delta)));
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

  const visibleEntries = entries.filter((entry) => {
    if (filter === "all") return true;
    return entry.level === filter;
  });

  return (
    <div
      className="console-panel"
      style={{
        height: collapsed ? collapsedHeight : height,
        minHeight: collapsed ? collapsedHeight : 120,
      }}
    >
      <div
        className="resize-handle-horizontal"
        onMouseDown={handleResizeMouseDown}
        onKeyDown={handleResizeKeyDown}
        role="separator"
        aria-label="Resize console"
        aria-orientation="horizontal"
        aria-valuemin={120}
        aria-valuemax={520}
        aria-valuenow={height}
        tabIndex={collapsed ? -1 : 0}
        style={{ display: collapsed ? "none" : "block" }}
      />

      <div className="console-header">
        <div className="console-header-left">
          <button
            className="console-title"
            onClick={() => onCollapsedChange(!collapsed)}
            aria-expanded={!collapsed}
          >
            <span className="console-title-icon">
              <TerminalIcon />
            </span>
            Console
          </button>
          <span className={`console-count ${countClass}`}>
            {entries.length}
          </span>
          {!collapsed && entries.length > 0 && (
            <div className="console-filters" aria-label="Filter console output">
              <button
                className={filter === "all" ? "active" : ""}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              {errorCount > 0 && (
                <button
                  className={`error ${filter === "error" ? "active" : ""}`}
                  onClick={() => setFilter("error")}
                >
                  {errorCount} error{errorCount === 1 ? "" : "s"}
                </button>
              )}
              {warnCount > 0 && (
                <button
                  className={`warn ${filter === "warn" ? "active" : ""}`}
                  onClick={() => setFilter("warn")}
                >
                  {warnCount} warning{warnCount === 1 ? "" : "s"}
                </button>
              )}
            </div>
          )}
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
          <span className="console-shortcut">Ctrl J</span>
          <button
            className={`console-toggle ${collapsed ? "" : "open"}`}
            onClick={() => onCollapsedChange(!collapsed)}
            aria-label={collapsed ? "Expand console" : "Collapse console"}
            aria-expanded={!collapsed}
          >
            <ChevronIcon />
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="console-body" ref={bodyRef}>
          {visibleEntries.length === 0 ? (
            <div className="console-empty">
              <TerminalEmptyIcon />
              <div>
                <strong>{entries.length === 0 ? "No output yet" : "No matching output"}</strong>
                <p>{entries.length === 0 ? "Run your project to inspect logs and errors" : "Choose another filter to view entries"}</p>
              </div>
            </div>
          ) : (
            visibleEntries.map((entry) => (
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
