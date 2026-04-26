import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocket } from '../lib/socket'

export default function JoinRoom() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleJoinRoom = () => {
    if (!playerName || roomCode.length < 4) return

    setLoading(true)
    setError('')

    const socket = getSocket()

    socket.emit('join_room', { roomCode: roomCode.toUpperCase(), playerName })

    socket.once('room_joined', (data) => {
      setLoading(false)

      if (!data.success) {
        setError(data.error || 'Erro ao entrar na sala')
        return
      }

      // Salvar dados do jogador no localStorage
      localStorage.setItem('domino_player', JSON.stringify({
        id: data.playerId,
        name: data.playerName || playerName,
        roomCode: roomCode.toUpperCase(),
      }))

      navigate(`/game/${roomCode.toUpperCase()}`)
    })
  }

  const isFormValid = playerName && roomCode.length >= 4

  return (
    <div className="min-h-screen bg-wood-grain flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ivory-50">
            Entrar na <span className="text-felt-500">Sala</span>
          </h1>
          <p className="text-ivory-100/50 mt-2">Junte-se aos seus amigos</p>
        </div>

        <div className="card space-y-6">
          {error && (
            <div className="bg-red-900/40 border border-red-500/40 rounded-lg px-4 py-3 text-red-300 text-sm">
              ❌ {error}
            </div>
          )}

          <div>
            <label htmlFor="input-player-name" className="label">Nome do Jogador</label>
            <input
              id="input-player-name"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Seu nome"
              className="input-field"
              maxLength={20}
            />
          </div>

          <div>
            <label htmlFor="input-room-code" className="label">Código da Sala</label>
            <input
              id="input-room-code"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Ex: ABC123"
              className="input-field font-mono text-center tracking-[0.3em] uppercase text-amber-400 font-bold"
              maxLength={8}
            />
          </div>

          <button
            id="btn-join-room"
            onClick={handleJoinRoom}
            disabled={!isFormValid || loading}
            className="btn-primary w-full text-lg mt-2 !bg-felt-500 hover:!bg-felt-400"
          >
            {loading ? '⏳ Entrando...' : 'Entrar'}
          </button>
        </div>

        <button
          id="btn-back"
          onClick={() => navigate('/')}
          className="mt-4 w-full text-center text-ivory-100/40 hover:text-ivory-100/70 transition-colors text-sm py-2"
        >
          ← Voltar ao início
        </button>
      </div>
    </div>
  )
}
