import { useState } from 'react'
import CollaborativeRoom from './components/CollaborativeRoom'
import { useEffect } from 'react'

function App() {
  const [joined, setJoined] = useState(false)
  const [roomId, setRoomId] = useState('')
  const [username, setUsername] = useState('')

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomId && username) {
      setJoined(true)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const room = params.get('room')
    if (room) setRoomId(room)
  }, [])

  if (!joined) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">
            Collaborative Code Editor
          </h1>
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <input
              type="text"
              placeholder="Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button 
              type="submit"
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
            >
              Join Room
            </button>
          </form>
        </div>
      </div>
    )
  }

  return <CollaborativeRoom roomId={roomId} username={username} />
}

export default App
