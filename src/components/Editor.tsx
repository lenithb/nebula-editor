import { useRef, useCallback, useEffect, useState } from "react";
import MonacoEditor, { OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import "../monaco";
import { useLocalStorage } from "../hooks/useLocalStorage";

const EDITOR_FONTS = [
  {
    id: "jetbrains",
    label: "JetBrains Mono",
    family: "'JetBrains Mono', monospace",
  },
  { id: "fira", label: "Fira Code", family: "'Fira Code', monospace" },
  {
    id: "ibm",
    label: "IBM Plex Mono",
    family: "'IBM Plex Mono', monospace",
  },
  {
    id: "system",
    label: "System Mono",
    family: "ui-monospace, 'SFMono-Regular', Consolas, monospace",
  },
] as const;

type EditorFontId = (typeof EDITOR_FONTS)[number]["id"];

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

export function Editor({ code, onChange, onRun }: EditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontId, setFontId] = useLocalStorage<EditorFontId>(
    "nebula-js:editor-font",
    "jetbrains",
  );
  const [fontSize, setFontSize] = useLocalStorage(
    "nebula-js:editor-font-size",
    13.5,
  );
  const selectedFont =
    EDITOR_FONTS.find((font) => font.id === fontId) ?? EDITOR_FONTS[0];
  const safeFontSize = Number.isFinite(fontSize)
    ? Math.max(12, Math.min(20, fontSize))
    : 13.5;

  useEffect(() => {
    if (!settingsOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!settingsRef.current?.contains(event.target as Node)) {
        setSettingsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [settingsOpen]);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      monaco.editor.defineTheme("nebula", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "", foreground: "CAD0DC" },
          { token: "comment", foreground: "626A78", fontStyle: "italic" },
          { token: "comment.doc", foreground: "737C8C", fontStyle: "italic" },
          { token: "keyword", foreground: "C6A0F6" },
          { token: "keyword.operator", foreground: "91A4C7" },
          { token: "keyword.control", foreground: "C6A0F6" },
          { token: "string", foreground: "A6DA95" },
          { token: "string.escape", foreground: "8BD5CA" },
          { token: "string.template", foreground: "A6DA95" },
          { token: "number", foreground: "F5A97F" },
          { token: "number.float", foreground: "F5A97F" },
          { token: "regexp", foreground: "F5BDE6" },
          { token: "type", foreground: "7DC4E4" },
          { token: "type.identifier", foreground: "7DC4E4" },
          { token: "function", foreground: "8AADF4" },
          { token: "function.call", foreground: "8AADF4" },
          { token: "variable", foreground: "CAD0DC" },
          { token: "variable.name", foreground: "CAD0DC" },
          { token: "variable.parameter", foreground: "B7BDF8" },
          { token: "variable.predefined", foreground: "8AADF4" },
          { token: "identifier", foreground: "CAD0DC" },
          { token: "constant", foreground: "ED8796" },
          { token: "constant.language", foreground: "ED8796" },
          { token: "operator", foreground: "91A4C7" },
          { token: "operator.assignment", foreground: "91A4C7" },
          { token: "delimiter", foreground: "858B98" },
          { token: "delimiter.bracket", foreground: "AAB2C0" },
          { token: "delimiter.curly", foreground: "AAB2C0" },
          { token: "delimiter.parenthesis", foreground: "AAB2C0" },
          { token: "tag", foreground: "8AADF4" },
          { token: "attribute.name", foreground: "A6DA95" },
          { token: "attribute.value", foreground: "F5A97F" },
        ],
        colors: {
          "editor.background": "#050506",
          "editor.foreground": "#CAD0DC",
          "editor.lineHighlightBackground": "#0E0E10",
          "editor.selectionBackground": "#3A3A3FAA",
          "editor.inactiveSelectionBackground": "#28282C88",
          "editorLineNumber.foreground": "#444448",
          "editorLineNumber.activeForeground": "#B8B8BB",
          "editorCursor.foreground": "#F4F4F5",
          "editorWhitespace.foreground": "#1D1D20",
          "editorIndentGuide.background1": "#1A1A1D",
          "editorIndentGuide.activeBackground1": "#3D3D42",
          "editor.findMatchBackground": "#FFFFFF32",
          "editor.findMatchHighlightBackground": "#FFFFFF1C",
          "editorSuggestWidget.background": "#111112",
          "editorSuggestWidget.border": "#29292C",
          "editorSuggestWidget.selectedBackground": "#242427",
          "editorSuggestWidget.foreground": "#CAD0DC",
          "editorHoverWidget.background": "#111112",
          "editorHoverWidget.border": "#29292C",
          "scrollbarSlider.background": "#33333666",
          "scrollbarSlider.hoverBackground": "#4A4A4E88",
          "scrollbarSlider.activeBackground": "#606065AA",
          "editorGutter.background": "#050506",
          "editorBracketMatch.background": "#FFFFFF18",
          "editorBracketMatch.border": "#FFFFFF66",
          "editorOverviewRuler.border": "#050506",
          "editorWidget.background": "#111112",
          "editorWidget.border": "#29292C",
        },
      });

      monaco.editor.setTheme("nebula");

      editor.onDidChangeCursorPosition(({ position }) => {
        setCursor({ line: position.lineNumber, column: position.column });
      });

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => {
          onRun();
        },
      );

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        () => {
          editor.getAction("editor.action.formatDocument")?.run();
        },
      );

    },
    [onRun],
  );

  return (
    <div className="panel editor-panel" style={{ width: "100%", flex: 1 }}>
      <div className="editor-tabs" role="tablist" aria-label="Open files">
        <div className="editor-tab active" role="tab" aria-selected="true">
          <span className="file-type-icon">JS</span>
          <span>project.js</span>
          <span className="tab-saved" data-tooltip="Saved locally" />
        </div>
        <div className="editor-tab-spacer" />
        <div className="editor-toolbar" ref={settingsRef}>
          <div className="editor-context">
            <span className="context-dot" />
            Auto-save
          </div>
          <button
            className={`editor-settings-button ${settingsOpen ? "active" : ""}`}
            onClick={() => setSettingsOpen((open) => !open)}
            aria-label="Editor typography settings"
            aria-expanded={settingsOpen}
            data-tooltip="Editor typography"
          >
            <TypographyIcon />
          </button>

          {settingsOpen && (
            <div className="editor-settings-popover" role="dialog" aria-label="Editor typography">
              <div className="settings-popover-header">
                <div>
                  <strong>Editor typography</strong>
                  <span>Personalize your coding surface</span>
                </div>
                <button
                  onClick={() => {
                    setFontId("jetbrains");
                    setFontSize(13.5);
                  }}
                >
                  Reset
                </button>
              </div>

              <label className="editor-setting-field">
                <span>Font family</span>
                <select
                  value={selectedFont.id}
                  onChange={(event) => setFontId(event.target.value as EditorFontId)}
                >
                  {EDITOR_FONTS.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="editor-setting-field">
                <span className="font-size-label">
                  Font size
                  <output>{safeFontSize}px</output>
                </span>
                <input
                  type="range"
                  min="12"
                  max="20"
                  step="0.5"
                  value={safeFontSize}
                  onChange={(event) => setFontSize(Number(event.target.value))}
                />
              </label>

              <div
                className="font-preview"
                style={{ fontFamily: selectedFont.family, fontSize: safeFontSize }}
              >
                const nebula = "ready";
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="editor-body">
        <MonacoEditor
          height="100%"
          width="100%"
          language="javascript"
          value={code}
          onChange={(val) => onChange(val ?? "")}
          onMount={handleMount}
          loading={<EditorLoading />}
          options={{
            fontFamily: selectedFont.family,
            fontSize: safeFontSize,
            fontLigatures: true,
            lineHeight: Math.round(safeFontSize * 1.7),
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: "line",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            formatOnType: false,
            wordWrap: "off",
            tabSize: 2,
            insertSpaces: true,
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            suggest: {
              showKeywords: true,
              showSnippets: true,
            },
            parameterHints: { enabled: true },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              useShadows: false,
            },
            stickyScroll: { enabled: true, maxLineCount: 3 },
            lineNumbersMinChars: 3,
            lineDecorationsWidth: 8,
            glyphMargin: false,
            foldingHighlight: false,
            roundedSelection: true,
            renderWhitespace: "selection",
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            padding: { top: 14, bottom: 18 },
            automaticLayout: true,
          }}
        />
      </div>

      <div className="editor-statusbar" aria-label="Editor status">
        <div className="editor-status-left">
          <span className="status-branch-dot" />
          <span>Local</span>
        </div>
        <div className="editor-status-right">
          <span>Ln {cursor.line}, Col {cursor.column}</span>
          <span>Spaces: 2</span>
          <span>UTF-8</span>
          <span>JavaScript</span>
        </div>
      </div>
    </div>
  );
}

function EditorLoading() {
  return (
    <div className="editor-loading" aria-live="polite">
      <span className="editor-loading-spinner" />
      <div>
        <strong>Loading editor</strong>
        <span>Preparing JavaScript intelligence…</span>
      </div>
    </div>
  );
}

function TypographyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <path d="M2.5 4V2.5h7V4M6 2.5v9M4.25 11.5h3.5" />
      <path d="M10 7.5h3.5M11.75 5.75v3.5M10.25 12.5h3" opacity=".72" />
    </svg>
  );
}
