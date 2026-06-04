import { useState, useCallback, useRef, useEffect } from "react";
import { Header } from "./components/Header";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { Console } from "./components/Console";
import { Skeleton } from "./components/Skeleton";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { useConsole } from "./hooks/useConsole";
import type { ConsoleLevel } from "./hooks/useConsole";

const DEFAULT_CODE = `console.log("Hello from Nebula JS ✦");

document.body.innerHTML = \`
<div style="font-family:'Poppins',system-ui,sans-serif;padding:3rem;max-width:640px;background:#09090b;min-height:100vh;color:#fafafa">
  <div style="display:flex;align-items:center;gap:14px;margin-bottom:2.5rem">
    <svg width="28" height="28" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="13" r="12" stroke="#27272a" stroke-width="1" fill="#09090b"/>
      <circle cx="13" cy="13" r="7" stroke="#6366f1" stroke-width="1" fill="none" stroke-dasharray="3 2" opacity="0.5"/>
      <circle cx="13" cy="13" r="4" fill="#818cf8"/>
      <circle cx="13" cy="13" r="1.5" fill="#09090b"/>
    </svg>
    <div>
      <h1 style="margin:0;font-size:18px;font-weight:600;letter-spacing:-0.02em;color:#fafafa">Nebula JS</h1>
      <p style="margin:0;font-size:11px;color:#52525b;font-weight:400">Write. Run. Explore.</p>
    </div>
  </div>
  <div style="background:#141416;border:1px solid #27272a;border-radius:8px;padding:1.25rem;margin-bottom:1rem">
    <p style="margin:0 0 6px;font-size:10px;color:#6366f1;font-weight:600;text-transform:uppercase;letter-spacing:0.08em">Status</p>
    <p style="margin:0;font-size:14px;color:#fafafa;font-weight:500">Your code is running successfully.</p>
  </div>
  <p style="font-size:12px;color:#52525b;margin:0;line-height:1.7">
    Edit the code in the editor and press
    <kbd style="background:#141416;border:1px solid #27272a;border-radius:4px;padding:2px 6px;font-size:10px;font-family:'JetBrains Mono',monospace;color:#818cf8">Ctrl+Enter</kbd>
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
  const [editorReady, setEditorReady] = useState(false);
  const [consoleHeight, setConsoleHeight] = useLocalStorage(
    "nebula-js:console-height",
    220,
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

  return (
    <>
      {!editorReady && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999 }}>
          <Skeleton />
        </div>
      )}

      <div
        className="app"
        style={{ visibility: editorReady ? "visible" : "hidden" }}
      >
        <Header
          code={code}
          onRun={handleRun}
          onClear={clearEntries}
          runStatus={runStatus}
        />

        <div className="workspace">
          <div className="workspace-panels" ref={workspaceRef}>
            <div
              style={{
                width: `${editorWidthPct}%`,
                display: "flex",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <Editor
                code={code}
                onChange={setCode}
                onRun={handleRun}
                onMount={() => setEditorReady(true)}
              />
            </div>

            <div
              className="resize-handle-vertical"
              onMouseDown={handleVerticalResizeMouseDown}
            />

            <div
              style={{
                flex: 1,
                display: "flex",
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <Preview
                code={code}
                runKey={runKey}
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
          />
        </div>
      </div>
    </>
  );
}
