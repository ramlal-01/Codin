import { useState, useEffect } from 'react'
import { useSocket } from '../hooks/useSocket'
import CodeEditor from './CodeEditor'
import Chat from './Chat'

interface Props {
  roomId: string
  username: string
}

function CollaborativeRoom({ roomId, username }: Props) {
  const { socket, connected } = useSocket(roomId, username)
  const [code, setCode] = useState('// Start coding together!')
  const [users, setUsers] = useState<Array<{ socketId: string; username: string }>>([])
  const [language, setLanguage] = useState('javascript')

  const [stdin, setStdin] = useState('')
  const [running, setRunning] = useState(false)
  const [runOutput, setRunOutput] = useState<{
    stdout: string | null
    stderr: string | null
    status: string
    error: string | null
    runBy: string | null
    time?: string | null
    memory?: number | null
  }>({
    stdout: null,
    stderr: null,
    status: '',
    error: null,
    runBy: null,
  })

  useEffect(() => {
    if (!socket) return

    socket.on('code-update', ({ code: newCode, userId }) => {
      if (userId !== socket.id) {
        setCode(newCode)
      }
    })

    socket.on('room-users', (currentUsers: Array<{ socketId: string; username: string }>) => {
      setUsers(currentUsers)
    })

    socket.on('run-result', (result) => {
      if (result.roomId !== roomId) return

      setRunning(false)
      setRunOutput({
        stdout: result.stdout,
        stderr: result.stderr,
        status: result.status,
        error: result.error || null,
        runBy: result.runBy || null,
        time: result.time || null,
        memory: result.memory || null,
      })
    })

    return () => {
      socket.off('code-update')
      socket.off('room-users')
      socket.off('run-result')
    }
  }, [socket, roomId])

  useEffect(() => {
    if (!socket) return

    socket.on('code-update', ({ code: newCode, userId }) => {
      if (userId !== socket.id) {
        setCode(newCode)
      }
    })

    socket.on('room-users', (currentUsers: Array<{ socketId: string; username: string }>) => {
      setUsers(currentUsers)
    })

    return () => {
      socket.off('code-update')
      socket.off('room-users')
    }
  }, [socket])

  const handleCodeChange = (value: string | undefined) => {
    const newCode = value || ''
    setCode(newCode)
    if (socket && connected) {
      socket.emit('code-change', { roomId, code: newCode })
    }
  }

  const copyRoomLink = () => {
    const link = `${window.location.origin}?room=${roomId}`
    navigator.clipboard.writeText(link)
    alert('Room link copied!')
  }

  const handleRun = () => {
    if (!socket || !connected) return

    setRunning(true)
    setRunOutput({
      stdout: null,
      stderr: null,
      status: 'Running...',
      error: null,
      runBy: username,
    })

    socket.emit('run-code', {
      roomId,
      language,
      sourceCode: code,
      stdin,
      runBy: username,
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-400">Users:</span>
            {users.map((user) => (
              <span
                key={user.socketId}
                className="px-2 py-1 bg-blue-600 rounded text-sm"
              >
                {user.username}
              </span>
            ))}
          </div>

          <div className="text-right">
            <h2 className="text-xl font-bold">Room: {roomId}</h2>
            <p className="text-gray-400 text-sm">You: {username}</p>
          </div>

          <button
            onClick={copyRoomLink}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold"
          >
            📋 Copy Room Link
          </button>

          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-sm">
              {connected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>

          <button
            onClick={handleRun}
            disabled={!connected || running}
            className={`px-4 py-2 rounded text-sm font-semibold ${
              running
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {running ? 'Running...' : 'Run'}
          </button>

        </div>
      </div>

      {/* Main layout */}
      <div className="p-6 grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-4">
          <CodeEditor code={code} language={language} onChange={handleCodeChange} />

          {/* Input textarea for stdin */}
          <div>
            <h3 className="text-sm font-semibold mb-2 text-gray-300">Input (stdin)</h3>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="w-full h-24 bg-gray-800 border border-gray-700 rounded p-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter input for the program..."
            />
          </div>
        </div>

        <div className="space-y-4">
          <Chat socket={socket} username={username} roomId={roomId} />

          {/* Output panel */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 h-56 overflow-auto">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-gray-200">Output</h3>
              {runOutput.status && (
                <span className="text-xs text-gray-400">
                  {runOutput.status}
                  {runOutput.runBy ? ` · run by ${runOutput.runBy}` : ''}
                </span>
              )}
            </div>

            {runOutput.error && (
              <p className="text-sm text-red-400 mb-2">
                Error: {runOutput.error}
              </p>
            )}

            {runOutput.stdout && (
              <>
                <p className="text-xs text-gray-400 mb-1">stdout:</p>
                <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                  {runOutput.stdout}
                </pre>
              </>
            )}

            {runOutput.stderr && (
              <>
                <p className="text-xs text-gray-400 mt-3 mb-1">stderr:</p>
                <pre className="text-sm text-red-300 whitespace-pre-wrap">
                  {runOutput.stderr}
                </pre>
              </>
            )}

            {!runOutput.stdout && !runOutput.stderr && !runOutput.error && (
              <p className="text-sm text-gray-500">
                No output yet. Write code and click Run.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollaborativeRoom
