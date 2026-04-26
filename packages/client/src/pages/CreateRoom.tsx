import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CreateRoom() {
  const navigate = useNavigate()
  const [playerName, setPlayerName] = useState('')
  const [roomName, setRoomName] = useState('')
  const [maxPlayers, setMaxPlayers] = useState('2')
  const [gameMode, setGameMode] = useState('classico')
  const [roomCode, setRoomCode] = useState('')

  const generateRoomCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    setRoomCode(code)
  }

  const handleCreateRoom = () => {
    if (!playerName || !roomName || !roomCode) {
      return
    }

    // TODO: Integrar com Socket.IO para criar sala no backend
    console.log('Criando sala:', {
      playerName,
      roomName,
      maxPlayers,
      gameMode,
      roomCode
    })

    navigate(`/game/${roomCode}`)
  }

  const isFormValid = playerName && roomName && roomCode

  return (
    <div className="min-h-screen bg-wood-grain flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ivory-50">
            Criar <span className="text-amber-400">Sala</span>
          </h1>
          <p className="text-ivory-100/50 mt-2">Configure sua partida de dominó</p>
        </div>

        {/* Form Card */}
        <div className="card space-y-5">
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

          {/* Room Name */}
          <div>
            <label htmlFor="input-room-name" className="label">
              Nome da Sala
            </label>
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

          {/* Players + Mode Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="select-max-players" className="label">
                Jogadores
              </label>
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
              <label htmlFor="select-game-mode" className="label">
                Modo de Jogo
              </label>
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

          {/* Room Code */}
          <div>
            <label className="label">Código da Sala</label>
            <div className="flex gap-3">
              <div className="flex-1 flex items-center justify-center 
                              bg-wood-800/60 border border-wood-500/30 rounded-lg px-4 py-3
                              min-h-[48px]">
                {roomCode ? (
                  <span className="text-xl font-mono font-bold text-amber-400 tracking-[0.3em]">
                    {roomCode}
                  </span>
                ) : (
                  <span className="text-ivory-100/30 text-sm">
                    Clique para gerar →
                  </span>
                )}
              </div>
              <button
                id="btn-generate-code"
                type="button"
                onClick={generateRoomCode}
                className="btn-secondary whitespace-nowrap text-sm"
              >
                🎲 Gerar
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="btn-create-room"
            onClick={handleCreateRoom}
            disabled={!isFormValid}
            className="btn-primary w-full text-lg mt-2"
          >
            Criar Sala
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
