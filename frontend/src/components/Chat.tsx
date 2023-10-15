import { useState, useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'

interface Message {
  username: string
  text: string
  timestamp: string
}

interface Props {
  socket: Socket | null
  username: string
  roomId: string
}

function Chat({ socket, username, roomId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!socket) return

    socket.on('chat-message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    return () => {
      socket.off('chat-message')
    }
  }, [socket])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !socket) return

    const message: Message = {
      username,
      text: inputText,
      timestamp: new Date().toLocaleTimeString()
    }

    socket.emit('chat-message', { roomId, message })
    setMessages(prev => [...prev, message])
    setInputText('')
  }

  return (
    <div className="flex flex-col h-[600px] bg-gray-800 rounded-lg border border-gray-700">
      <div className="p-4 border-b border-gray-700">
        <h3 className="font-bold">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="text-sm">
            <span className="font-semibold text-blue-400">{msg.username}</span>
            <span className="text-gray-500 text-xs ml-2">{msg.timestamp}</span>
            <p className="text-gray-300">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-gray-700">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          className="w-full px-3 py-2 bg-gray-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </form>
    </div>
  )
}

export default Chat
