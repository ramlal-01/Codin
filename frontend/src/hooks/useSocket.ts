import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

const SERVER_URL = 'http://localhost:5000'

export function useSocket(roomId: string, username: string) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socketInstance = io(SERVER_URL)

    socketInstance.on('connect', () => {
      console.log('Connected to server:', socketInstance.id)
      setConnected(true)
      socketInstance.emit('join-room', roomId, username)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from server')
      setConnected(false)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [roomId, username])

  return { socket, connected }
}
