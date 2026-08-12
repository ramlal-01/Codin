import Editor from "@monaco-editor/react";

function CodeEditor({ code, language, onChange }) {
  return (
    <div className="h-[52vh] min-h-[360px] overflow-hidden rounded-lg border border-slate-800 lg:h-[560px]">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        onChange={onChange}
        options={{
          fontSize: 14,
          minimap: { enabled: true },
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
        }}
      />
    </div>
  );
}

export default CodeEditor;
