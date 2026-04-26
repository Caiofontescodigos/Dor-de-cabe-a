import { io, Socket } from 'socket.io-client'

// URL do servidor — usa variável de ambiente do Vite
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('🔌 Socket conectado:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket desconectado:', reason)
    })

    socket.on('connect_error', (err) => {
      console.error('❌ Erro de conexão:', err.message)
    })
  }

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
