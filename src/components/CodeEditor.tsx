import Editor, { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";
import "monaco-editor/esm/vs/basic-languages/python/python.contribution";

loader.config({ monaco });

interface CodeEditorProps {
  value: string;
  levelId: number;
  onChange: (value: string) => void;
}

export default function CodeEditor({ value, levelId, onChange }: CodeEditorProps) {
  return (
    <div className="h-full overflow-hidden rounded-md bg-[#0b100d] shadow-[inset_0_0_0_1px_rgba(18,27,18,0.9),inset_0_0_36px_rgba(0,0,0,0.38)]">
      <Editor
        path={`instinct-level-${levelId}.py`}
        height="100%"
        language="python"
        value={value}
        theme="instinct-dark"
        beforeMount={(monaco) => {
          monaco.editor.defineTheme("instinct-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [
              { token: "comment", foreground: "6d756d" },
              { token: "string", foreground: "8dff7a" },
              { token: "number", foreground: "d8903a" },
              { token: "keyword", foreground: "b7a2ff" }
            ],
            colors: {
              "editor.background": "#0d1110",
              "editor.foreground": "#d9d6c7",
              "editorLineNumber.foreground": "#5d665e",
              "editorCursor.foreground": "#8dff7a",
              "editor.selectionBackground": "#254225",
              "editor.lineHighlightBackground": "#151c18"
            }
          });
        }}
        onChange={(nextValue) => onChange(nextValue ?? "")}
        loading={
          <div className="flex h-full items-center justify-center bg-[#0d1110] font-mono text-xs uppercase tracking-[0.24em] text-[#d8b574]/50">
            Loading editor
          </div>
        }
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "JetBrains Mono, Menlo, monospace",
          lineHeight: 22,
          padding: { top: 14, bottom: 14 },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          wordWrap: "on",
          tabSize: 4,
          automaticLayout: true,
          bracketPairColorization: { enabled: true }
        }}
      />
    </div>
  );
}
