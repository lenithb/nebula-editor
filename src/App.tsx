import { lazy, Suspense, useState, useCallback, useRef, useEffect } from "react";
import { Header } from "./components/Header";
import { Preview } from "./components/Preview";
import { Console } from "./components/Console";
import { ActivityBar, ProjectSidebar } from "./components/WorkspaceChrome";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useConsole } from "./hooks/useConsole";
import type { ConsoleLevel } from "./hooks/useConsole";

const Editor = lazy(() =>
  import("./components/Editor").then((module) => ({ default: module.Editor })),
);

const DEFAULT_CODE = `console.log("Hello from Nebula JS ✦");

document.body.innerHTML = \`
<div style="font-family:'Poppins',system-ui,sans-serif;padding:3rem;max-width:640px;background:#000;min-height:100vh;color:#fafafa">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:2.5rem">
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="13" r="12" stroke="#2a2a2a" stroke-width="1" fill="#000"/>
      <circle cx="13" cy="13" r="7" stroke="#f5f5f5" stroke-width="1" fill="none" stroke-dasharray="3 2" opacity="0.55"/>
      <circle cx="13" cy="13" r="4" fill="#fff"/>
      <circle cx="13" cy="13" r="1.5" fill="#000"/>
    </svg>
    <div>
      <h1 style="margin:0;font-size:18px;font-weight:600;letter-spacing:-0.02em;color:#fafafa">Nebula JS</h1>
      <p style="margin:0;font-size:11px;color:#52525b;font-weight:400">Write. Run. Explore.</p>
    </div>
  </div>
  <div style="background:#0a0a0a;border:1px solid #242424;border-radius:8px;padding:1.25rem;margin-bottom:1rem">
    <p style="margin:0 0 6px;font-size:10px;color:#f5f5f5;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Status</p>
    <p style="margin:0;font-size:14px;color:#fafafa;font-weight:500">Your code is running successfully.</p>
  </div>
  <p style="font-size:12px;color:#52525b;margin:0;line-height:1.7">
    Edit the code in the editor and press
    <kbd style="background:#0a0a0a;border:1px solid #242424;border-radius:4px;padding:2px 6px;font-size:10px;font-family:'JetBrains Mono',monospace;color:#f5f5f5">Ctrl+Enter</kbd>
    to run it.
  </p>
</div>
\`;

console.log("DOM updated successfully ✓");
console.warn("This is a warning example");
`;

type RunStatus = "idle" | "running" | "success" | "error";

const STORAGE_VERSION = "v2";
(function clearStaleStorage() {
  if (localStorage.getItem("nebula-js:version") !== STORAGE_VERSION) {
    localStorage.removeItem("nebula-js:code");
    localStorage.setItem("nebula-js:version", STORAGE_VERSION);
  }
})();

export function App() {
  const [code, setCode] = useLocalStorage("nebula-js:code", DEFAULT_CODE);
  const [runKey, setRunKey] = useState(0);
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [consoleHeight, setConsoleHeight] = useLocalStorage(
    "nebula-js:console-height",
    220,
  );
  const [consoleCollapsed, setConsoleCollapsed] = useLocalStorage(
    "nebula-js:console-collapsed",
    false,
  );
  const [sidebarOpen, setSidebarOpen] = useLocalStorage(
    "nebula-js:sidebar-open",
    true,
  );

  const [editorWidthPct, setEditorWidthPct] = useLocalStorage(
    "nebula-js:editor-width",
    62,
  );
  const workspaceRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);
  const editorWidthPctRef = useRef(editorWidthPct);
  editorWidthPctRef.current = editorWidthPct;

  const { entries, addEntry, clearEntries, errorCount, warnCount } =
    useConsole();

  const addEntryRef = useRef(addEntry);
  addEntryRef.current = addEntry;
  const setRunStatusRef = useRef(setRunStatus);
  setRunStatusRef.current = setRunStatus;

  const handleRun = useCallback(() => {
    setRunStatus("running");
    clearEntries();
    setTimeout(() => {
      setRunKey((k) => k + 1);
      setRunStatus("success");
      setTimeout(() => setRunStatus("idle"), 2000);
    }, 80);
  }, [clearEntries]);

  const handleConsoleMessage = useCallback(
    (level: ConsoleLevel, message: string) => {
      addEntryRef.current(level, message);
      if (level === "error") {
        setRunStatusRef.current("error");
      }
    },
    [],
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleRun();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleRun]);

  function handleVerticalResizeMouseDown(e: React.MouseEvent) {
    isResizingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    const startX = e.clientX;
    const startPct = editorWidthPctRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !workspaceRef.current) return;
      const rect = workspaceRef.current.getBoundingClientRect();
      const delta = e.clientX - startX;
      const deltaPct = (delta / rect.width) * 100;
      const newPct = Math.max(25, Math.min(80, startPct + deltaPct));
      setEditorWidthPct(newPct);
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document
        .querySelectorAll("iframe")
        .forEach((f) => (f.style.pointerEvents = ""));
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    document
      .querySelectorAll("iframe")
      .forEach((f) => (f.style.pointerEvents = "none"));
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  }

  function handleVerticalResizeKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const direction = e.key === "ArrowLeft" ? -2 : 2;
    setEditorWidthPct((current) => Math.max(28, Math.min(78, current + direction)));
  }

  return (
      <div className="app">
        <Header
          code={code}
          onRun={handleRun}
          runStatus={runStatus}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        />

        <div className="workbench">
          <ActivityBar
            sidebarOpen={sidebarOpen}
            consoleOpen={!consoleCollapsed}
            onToggleSidebar={() => setSidebarOpen((open) => !open)}
            onToggleConsole={() => setConsoleCollapsed((collapsed) => !collapsed)}
            onRun={handleRun}
          />
          <ProjectSidebar
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          <main className="workspace">
            <div className="workspace-panels" ref={workspaceRef}>
              <div
                className="editor-pane"
                style={{ width: `${editorWidthPct}%` }}
              >
                <Suspense fallback={<EditorShellLoading />}>
                  <Editor
                    code={code}
                    onChange={setCode}
                    onRun={handleRun}
                  />
                </Suspense>
              </div>

              <div
                className="resize-handle-vertical"
                onMouseDown={handleVerticalResizeMouseDown}
                onKeyDown={handleVerticalResizeKeyDown}
                role="separator"
                aria-label="Resize editor and preview"
                aria-orientation="vertical"
                aria-valuemin={28}
                aria-valuemax={78}
                aria-valuenow={Math.round(editorWidthPct)}
                tabIndex={0}
              />

              <div className="preview-pane">
                <Preview
                  code={code}
                  runKey={runKey}
                  onRun={handleRun}
                  onConsoleMessage={handleConsoleMessage}
                />
              </div>
            </div>

            <Console
              entries={entries}
              onClear={clearEntries}
              errorCount={errorCount}
              warnCount={warnCount}
              height={consoleHeight}
              onHeightChange={setConsoleHeight}
              collapsed={consoleCollapsed}
              onCollapsedChange={setConsoleCollapsed}
            />
          </main>
        </div>
      </div>
  );
}

function EditorShellLoading() {
  return (
    <div className="panel editor-panel">
      <div className="editor-tabs">
        <div className="editor-tab active">
          <span className="file-type-icon">JS</span>
          <span>project.js</span>
        </div>
      </div>
      <div className="editor-loading" aria-live="polite">
        <span className="editor-loading-spinner" />
        <div>
          <strong>Loading editor</strong>
          <span>Preparing JavaScript intelligence…</span>
        </div>
      </div>
    </div>
  );
}
