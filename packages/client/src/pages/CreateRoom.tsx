import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSocket } from '../lib/socket'

export default function CreateRoom() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')
  const [roomName, setRoomName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('2')
  const [gameMode, setGameMode] = useState('classico')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateRoom = () => {
    if (!playerName || !roomName) return

    setLoading(true)
    setError('')

    const socket = getSocket()

    socket.emit('create_room', {
      name: roomName,
      maxPlayers: parseInt(maxPlayers),
      gameMode,
      playerName,
    })

    socket.once('room_created', (data) => {
      setLoading(false)

      if (!data.success) {
        setError(data.error || 'Erro ao criar sala')
        return
      }

      // Salvar dados do jogador no localStorage
      localStorage.setItem('domino_player', JSON.stringify({
        id: data.playerId,
        name: data.playerName || playerName,
        roomCode: data.roomCode,
      }))

      navigate(`/game/${data.roomCode}`)
    })
  }

  const isFormValid = playerName && roomName

  return (
    <div className="min-h-screen bg-wood-grain flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ivory-50">
            Criar <span className="text-amber-400">Sala</span>
          </h1>
          <p className="text-ivory-100/50 mt-2">Configure sua partida de dominó</p>
        </div>

        <div className="card space-y-5">
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
            <label htmlFor="input-room-name" className="label">Nome da Sala</label>
            <input
              id="input-room-name"
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Ex: Jogo com Amigos"
              className="input-field"
              maxLength={30}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="select-max-players" className="label">Jogadores</label>
              <select
                id="select-max-players"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(e.target.value)}
                className="select-field"
              >
                <option value="2">2 Jogadores</option>
                <option value="3">3 Jogadores</option>
                <option value="4">4 Jogadores</option>
              </select>
            </div>
            <div>
              <label htmlFor="select-game-mode" className="label">Modo de Jogo</label>
              <select
                id="select-game-mode"
                value={gameMode}
                onChange={(e) => setGameMode(e.target.value)}
                className="select-field"
              >
                <option value="classico">Clássico</option>
                <option value="mexicano">Mexicano</option>
              </select>
            </div>
          </div>

          <button
            id="btn-create-room"
            onClick={handleCreateRoom}
            disabled={!isFormValid || loading}
            className="btn-primary w-full text-lg mt-2"
          >
            {loading ? '⏳ Criando...' : 'Criar Sala'}
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
