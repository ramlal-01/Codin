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

  useEffect(() => {
    if (!socket) return

    socket.on('code-update', ({ code: newCode, userId }) => {
      if (userId !== socket.id) {
        setCode(newCode)
      }
    })

    socket.on('user-joined', ({ username: newUser, socketId }) => {
      setUsers(prev => [...prev, { username: newUser, socketId }])
    })

    socket.on('user-left', ({ socketId }) => {
      setUsers(prev => prev.filter(u => u.socketId !== socketId))
    })

    socket.on('room-users', (currentUsers) => {
      setUsers(currentUsers)
    })

    return () => {
      socket.off('code-update')
      socket.off('user-joined')
      socket.off('user-left')
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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Users:</span>
            {users.map(user => (
              <span key={user.socketId} className="px-2 py-1 bg-blue-600 rounded text-sm">
                {user.username}
              </span>
            ))}
          </div>
          <div>
            <h2 className="text-xl font-bold">Room: {roomId}</h2>
            <p className="text-gray-400 text-sm">User: {username}</p>
          </div>
          <button 
            onClick={copyRoomLink}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold"
          >
            📋 Copy Room Link
          </button>
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
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
        </div>
      </div>
      {/* Main layout */}
      <div className="p-6 grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <CodeEditor code={code} language={language} onChange={handleCodeChange} />
        </div>
        <div>
          <Chat socket={socket} username={username} roomId={roomId} />
        </div>
      </div>
    </div>
  )
}

export default CollaborativeRoom
