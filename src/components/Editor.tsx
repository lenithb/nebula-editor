import { useRef, useCallback, useState } from "react";
import MonacoEditor, { OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import "../monaco";

interface EditorProps {
  code: string;
  onChange: (value: string) => void;
  onRun: () => void;
}

export function Editor({ code, onChange, onRun }: EditorProps) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [cursor, setCursor] = useState({ line: 1, column: 1 });

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
          "editor.background": "#101114",
          "editor.foreground": "#CAD0DC",
          "editor.lineHighlightBackground": "#17191E",
          "editor.selectionBackground": "#3B4261AA",
          "editor.inactiveSelectionBackground": "#30344988",
          "editorLineNumber.foreground": "#4F5561",
          "editorLineNumber.activeForeground": "#AAB2C0",
          "editorCursor.foreground": "#B7BDF8",
          "editorWhitespace.foreground": "#282B32",
          "editorIndentGuide.background1": "#23262C",
          "editorIndentGuide.activeBackground1": "#454A55",
          "editor.findMatchBackground": "#8AADF444",
          "editor.findMatchHighlightBackground": "#8AADF425",
          "editorSuggestWidget.background": "#181A1F",
          "editorSuggestWidget.border": "#2A2D35",
          "editorSuggestWidget.selectedBackground": "#292D3E",
          "editorSuggestWidget.foreground": "#CAD0DC",
          "editorHoverWidget.background": "#181A1F",
          "editorHoverWidget.border": "#2A2D35",
          "scrollbarSlider.background": "#3B3E4666",
          "scrollbarSlider.hoverBackground": "#51566188",
          "scrollbarSlider.activeBackground": "#676D7AAA",
          "editorGutter.background": "#101114",
          "editorBracketMatch.background": "#8AADF422",
          "editorBracketMatch.border": "#8AADF488",
          "editorOverviewRuler.border": "#101114",
          "editorWidget.background": "#181A1F",
          "editorWidget.border": "#2A2D35",
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
        <div className="editor-context">
          <span className="context-dot" />
          Auto-save
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
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 13.5,
            fontLigatures: true,
            lineHeight: 23,
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
