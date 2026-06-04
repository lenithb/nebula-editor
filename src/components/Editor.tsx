import { useRef, useCallback } from "react";
import MonacoEditor, { OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
  onMount?: () => void;
}

export function Editor({ code, onChange, onRun, onMount }: EditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;

      monaco.editor.defineTheme("nebula", {
        base: "vs-dark",
        inherit: true,
        rules: [
          { token: "", foreground: "cbd5e1" },
          { token: "comment", foreground: "475569", fontStyle: "italic" },
          { token: "comment.doc", foreground: "64748b", fontStyle: "italic" },

          { token: "keyword", foreground: "a78bfa", fontStyle: "bold" },
          { token: "keyword.operator", foreground: "94a3b8" },
          { token: "keyword.control", foreground: "c084fc", fontStyle: "bold" },

          { token: "string", foreground: "34d399" },
          { token: "string.escape", foreground: "6ee7b7" },
          { token: "string.template", foreground: "2dd4bf" },

          { token: "number", foreground: "fb923c" },
          { token: "number.float", foreground: "fdba74" },

          { token: "regexp", foreground: "f472b6" },

          { token: "type", foreground: "38bdf8" },
          { token: "type.identifier", foreground: "67e8f9" },

          { token: "function", foreground: "fbbf24" },
          { token: "function.call", foreground: "fcd34d" },

          { token: "variable", foreground: "e2e8f0" },
          { token: "variable.name", foreground: "f1f5f9" },
          { token: "variable.parameter", foreground: "94a3b8" },
          { token: "variable.predefined", foreground: "93c5fd" },

          { token: "identifier", foreground: "e2e8f0" },

          { token: "constant", foreground: "f87171" },
          { token: "constant.language", foreground: "fb7185", fontStyle: "bold" },

          { token: "operator", foreground: "94a3b8" },
          { token: "operator.assignment", foreground: "c084fc" },

          { token: "delimiter", foreground: "64748b" },
          { token: "delimiter.bracket", foreground: "818cf8" },
          { token: "delimiter.curly", foreground: "a78bfa" },
          { token: "delimiter.parenthesis", foreground: "8b5cf6" },

          { token: "tag", foreground: "60a5fa" },
          { token: "attribute.name", foreground: "34d399" },
          { token: "attribute.value", foreground: "fbbf24" },
        ],
        colors: {
          "editor.background": "#0a0a0d",
          "editor.foreground": "#cbd5e1",
          "editor.lineHighlightBackground": "#0f0f14",
          "editor.selectionBackground": "#312e81aa",
          "editor.inactiveSelectionBackground": "#1e1b4b66",
          "editorLineNumber.foreground": "#334155",
          "editorLineNumber.activeForeground": "#818cf8",
          "editorCursor.foreground": "#a78bfa",
          "editorWhitespace.foreground": "#1e293b",
          "editorIndentGuide.background": "#1e293b",
          "editorIndentGuide.activeBackground": "#334155",
          "editor.findMatchBackground": "#6366f144",
          "editor.findMatchHighlightBackground": "#6366f122",
          "editorSuggestWidget.background": "#0f0f14",
          "editorSuggestWidget.border": "#1e293b",
          "editorSuggestWidget.selectedBackground": "#1e1b4b",
          "editorSuggestWidget.foreground": "#cbd5e1",
          "editorHoverWidget.background": "#0f0f14",
          "editorHoverWidget.border": "#1e293b",
          "scrollbarSlider.background": "#1e293b",
          "scrollbarSlider.hoverBackground": "#334155",
          "scrollbarSlider.activeBackground": "#475569",
          "minimap.background": "#09090b",
          "editorGutter.background": "#0a0a0d",
          "editorBracketMatch.background": "#4f46e522",
          "editorBracketMatch.border": "#818cf8aa",
          "editorOverviewRuler.border": "#0a0a0d",
        },
      });

      monaco.editor.setTheme("nebula");

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
        () => { onRun(); }
      );

      editor.addCommand(
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
        () => { editor.getAction("editor.action.formatDocument")?.run(); }
      );

      onMount?.();
    },
    [onRun, onMount]
  );

  return (
    <div className="panel editor-panel" style={{ width: "100%", flex: 1 }}>
      <div className="panel-header">
        <div className="panel-title">
          <span className="panel-title-icon">
            <CodeIcon />
          </span>
          project.js
        </div>
        <div className="panel-actions">
          <span className="lang-badge">JavaScript</span>
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
          loading={null}
          options={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 13,
            fontLigatures: true,
            lineHeight: 22,
            minimap: { enabled: true, scale: 1, renderCharacters: false },
            scrollBeyondLastLine: false,
            renderLineHighlight: "line",
            smoothScrolling: true,
            cursorBlinking: "smooth",
            cursorSmoothCaretAnimation: "on",
            formatOnPaste: true,
            formatOnType: false,
            wordWrap: "on",
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
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4,
              useShadows: false,
            },
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            padding: { top: 16, bottom: 16 },
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}

function CodeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4L1 6.5L4 9" />
      <path d="M9 4L12 6.5L9 9" />
      <path d="M7.5 2.5L5.5 10.5" />
    </svg>
  );
}
