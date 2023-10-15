import Editor from '@monaco-editor/react'

interface Props {
  code: string
  language: string
  onChange: (value: string | undefined) => void
}

function CodeEditor({ code, language, onChange }: Props) {
  return (
    <div className="h-[600px] border border-gray-700 rounded-lg overflow-hidden">
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
          wordWrap: 'on',
        }}
      />
    </div>
  )
}

export default CodeEditor
