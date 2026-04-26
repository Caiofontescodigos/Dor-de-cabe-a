import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function JoinRoom() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')

  const handleJoinRoom = () => {
    if (!playerName || !roomCode) {
      return
    }

    // TODO: Integrar com Socket.IO para entrar na sala
    console.log('Entrando na sala:', {
      playerName,
      roomCode
    })

    navigate(`/game/${roomCode}`)
  }

  const isFormValid = playerName && roomCode.length >= 6

  return (
    <div className="min-h-screen bg-wood-grain flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ivory-50">
            Entrar na <span className="text-felt-500">Sala</span>
          </h1>
          <p className="text-ivory-100/50 mt-2">Junte-se aos seus amigos</p>
        </div>

        {/* Form Card */}
        <div className="card space-y-6">
          {/* Player Name */}
          <div>
            <label htmlFor="input-player-name" className="label">
              Nome do Jogador
            </label>
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

          {/* Room Code */}
          <div>
            <label htmlFor="input-room-code" className="label">
              Código da Sala
            </label>
            <input
              id="input-room-code"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Ex: ABC123"
              className="input-field font-mono text-center tracking-[0.3em] uppercase text-amber-400 font-bold"
              maxLength={6}
            />
          </div>

          {/* Submit */}
          <button
            id="btn-join-room"
            onClick={handleJoinRoom}
            disabled={!isFormValid}
            className="btn-primary w-full text-lg mt-2 !bg-felt-500 hover:!bg-felt-400"
          >
            Entrar
          </button>
        </div>

        {/* Back */}
        <button
          id="btn-back"
          onClick={() => navigate('/')}
          className="mt-4 w-full text-center text-ivory-100/40 hover:text-ivory-100/70 
                     transition-colors text-sm py-2"
        >
          ← Voltar ao início
        </button>
      </div>
    </div>
  )
}
