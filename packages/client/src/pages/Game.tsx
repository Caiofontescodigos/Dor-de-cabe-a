import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Board from '@components/Board'
import Hand from '@components/Hand'
import PlayersList from '@components/PlayersList'
import GameControls from '@components/GameControls'
import DominoTileBack from '@components/DominoTileBack'
import { getSocket } from '../lib/socket'
import type { Player } from '../types/game'

// ─── Tipos do servidor ────────────────────────────────────────────────────────
interface ServerDomino {
  id: string
  left: number
  right: number
}

interface ServerGameState {
  board: ServerDomino[]
  players: Array<{
    id: string
    name: string
    position: string
    handCount: number
    score: number
    isActive: boolean
    canPlay: boolean
  }>
  currentPlayerId: string
  status: string
  winner: string | null
  winType: string | null
  stockCount: number
}

// ─── Estado local da partida ──────────────────────────────────────────────────
interface GameUIState {
  gameState: ServerGameState | null
  myHand: ServerDomino[]
  phase: 'lobby' | 'playing' | 'finished'
  winner: { name: string; winType: string } | null
  error: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function serverPlayersToUIPlayers(
  serverPlayers: ServerGameState['players'],
  currentPlayerId: string
): Player[] {
  const currentIdx = serverPlayers.findIndex((p) => p.id === currentPlayerId)
  return serverPlayers.map((p) => ({
    id: p.id,
    name: p.name,
    position: p.position as Player['position'],
    handCount: p.handCount,
    score: p.score,
    isActive: p.isActive,
    canPlay: p.canPlay,
  }))
}

// ─── Componente ───────────────────────────────────────────────────────────────
export default function Game() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()

  // Dados do jogador local (do localStorage)
  const [myPlayer] = useState(() => {
    try {
      const raw = localStorage.getItem('domino_player')
      return raw ? JSON.parse(raw) as { id: string; name: string; roomCode: string } : null
    } catch {
      return null
    }
  })

  const [ui, setUi] = useState<GameUIState>({
    gameState: null,
    myHand: [],
    phase: 'lobby',
    winner: null,
    error: null,
  })

  const [selectedDomino, setSelectedDomino] = useState<ServerDomino | undefined>()

  // ─── Socket setup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!roomCode || !myPlayer) return

    const socket = getSocket()

    // Solicitar estado atual (caso recarregou a página)
    socket.emit('get_game_state', { roomCode, playerId: myPlayer.id })

    const onGameStateResponse = (data: { success: boolean; game?: ServerGameState; hand?: ServerDomino[]; error?: string }) => {
      if (!data.success || !data.game) return
      setUi((prev) => ({
        ...prev,
        gameState: data.game!,
        myHand: data.hand ?? [],
        phase: data.game!.status === 'playing' ? 'playing' : prev.phase,
        error: null,
      }))
    }

    const onGameStarted = () => {
      // O servidor vai emitir game_updated + your_hand logo após este evento
      setUi((prev) => ({ ...prev, phase: 'playing', error: null }))
    }

    const onGameUpdated = (data: { game: ServerGameState }) => {
      setUi((prev) => ({
        ...prev,
        gameState: data.game,
        phase: data.game.status === 'playing' ? 'playing' : prev.phase,
        error: null,
      }))
      setSelectedDomino(undefined)
    }

    const onYourHand = (data: { hand: ServerDomino[] }) => {
      setUi((prev) => ({ ...prev, myHand: data.hand }))
    }

    const onGameFinished = (data: { winner: string; winnerName: string; winType: string }) => {
      setUi((prev) => ({
        ...prev,
        phase: 'finished',
        winner: { name: data.winnerName, winType: data.winType },
      }))
    }

    const onMoveError = (data: { error: string }) => {
      setUi((prev) => ({ ...prev, error: data.error }))
      setTimeout(() => setUi((prev) => ({ ...prev, error: null })), 3000)
    }

    const onPlayerJoined = (data: { players: Array<{ id: string; name: string }> }) => {
      console.log('Jogador entrou:', data)
    }

    socket.on('game_state_response', onGameStateResponse)
    socket.on('game_started_notify', onGameStarted)
    socket.on('game_updated', onGameUpdated)
    socket.on('your_hand', onYourHand)
    socket.on('game_finished', onGameFinished)
    socket.on('move_error', onMoveError)
    socket.on('player_joined_notify', onPlayerJoined)

    return () => {
      socket.off('game_state_response', onGameStateResponse)
      socket.off('game_started_notify', onGameStarted)
      socket.off('game_updated', onGameUpdated)
      socket.off('your_hand', onYourHand)
      socket.off('game_finished', onGameFinished)
      socket.off('move_error', onMoveError)
      socket.off('player_joined_notify', onPlayerJoined)
    }
  }, [roomCode, myPlayer])

  // ─── Ações do jogador ──────────────────────────────────────────────────────
  const isMyTurn = ui.gameState?.currentPlayerId === myPlayer?.id

  const handlePlayLeft = useCallback(() => {
    if (!selectedDomino || !isMyTurn || !roomCode || !myPlayer) return
    getSocket().emit('play_move', {
      roomCode,
      playerId: myPlayer.id,
      dominoId: selectedDomino.id,
      side: 'left',
    })
  }, [selectedDomino, isMyTurn, roomCode, myPlayer])

  const handlePlayRight = useCallback(() => {
    if (!selectedDomino || !isMyTurn || !roomCode || !myPlayer) return
    getSocket().emit('play_move', {
      roomCode,
      playerId: myPlayer.id,
      dominoId: selectedDomino.id,
      side: 'right',
    })
  }, [selectedDomino, isMyTurn, roomCode, myPlayer])

  const handlePass = useCallback(() => {
    if (!isMyTurn || !roomCode || !myPlayer) return
    getSocket().emit('pass_turn', { roomCode, playerId: myPlayer.id })
  }, [isMyTurn, roomCode, myPlayer])

  const handleDraw = useCallback(() => {
    if (!isMyTurn || !roomCode || !myPlayer) return
    getSocket().emit('draw_domino', { roomCode, playerId: myPlayer.id })
  }, [isMyTurn, roomCode, myPlayer])

  const handleStartGame = useCallback(() => {
    if (!roomCode) return
    getSocket().emit('start_game', { roomCode })
  }, [roomCode])

  // ─── Derived UI values ─────────────────────────────────────────────────────
  const uiPlayers: Player[] = ui.gameState
    ? serverPlayersToUIPlayers(ui.gameState.players, ui.gameState.currentPlayerId)
    : []

  const currentPlayerIndex = uiPlayers.findIndex((p) => p.isActive)
  const localUIPlayer = uiPlayers.find((p) => p.id === myPlayer?.id)
  const topPlayer = uiPlayers.find((p) => p.position === 'top')
  const leftPlayer = uiPlayers.find((p) => p.position === 'left' && p.id !== myPlayer?.id)
  const rightPlayer = uiPlayers.find((p) => p.position === 'right')

  const playableDominoIds = ui.myHand
    .filter((d) => {
      if (!ui.gameState || ui.gameState.board.length === 0) return true
      const leftEnd = ui.gameState.board[0].left
      const rightEnd = ui.gameState.board[ui.gameState.board.length - 1].right
      return d.left === leftEnd || d.right === leftEnd || d.left === rightEnd || d.right === rightEnd
    })
    .map((d) => d.id)

  const renderOpponentHand = (count: number, orientation: 'horizontal' | 'vertical') => (
    <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} gap-1 justify-center items-center`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={orientation === 'vertical' ? '-mt-6 first:mt-0' : '-ml-4 first:ml-0'}>
          <DominoTileBack orientation={orientation === 'vertical' ? 'horizontal' : 'vertical'} size="sm" />
        </div>
      ))}
    </div>
  )

  // ─── Lobby ─────────────────────────────────────────────────────────────────
  if (ui.phase === 'lobby') {
    const roomPlayers = ui.gameState?.players ?? []
    return (
      <div className="min-h-screen bg-wood-grain flex items-center justify-center px-4">
        <div className="card w-full max-w-md text-center space-y-6">
          <h1 className="text-2xl font-bold text-ivory-50">
            Sala <span className="text-amber-400 font-mono tracking-widest">{roomCode}</span>
          </h1>
          <p className="text-ivory-100/60">Aguardando jogadores...</p>

          {roomPlayers.length > 0 && (
            <div className="space-y-2">
              {roomPlayers.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2 bg-wood-700/50 rounded-lg">
                  <span className="w-2 h-2 rounded-full bg-felt-500 animate-pulse" />
                  <span className="text-ivory-100 font-medium">{p.name}</span>
                  {p.id === myPlayer?.id && (
                    <span className="text-xs text-amber-400/70 ml-auto">(você)</span>
                  )}
                </div>
              ))}
            </div>
          )}

          <button onClick={handleStartGame} className="btn-primary w-full">
            🎮 Iniciar Jogo
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full text-center text-ivory-100/40 hover:text-ivory-100/70 transition-colors text-sm"
          >
            ← Sair da sala
          </button>
        </div>
      </div>
    )
  }

  // ─── Finished ──────────────────────────────────────────────────────────────
  if (ui.phase === 'finished' && ui.winner) {
    return (
      <div className="min-h-screen bg-wood-grain flex items-center justify-center px-4">
        <div className="card w-full max-w-md text-center space-y-6">
          <div className="text-6xl">🏆</div>
          <h1 className="text-3xl font-bold text-amber-400">{ui.winner.name} venceu!</h1>
          <p className="text-ivory-100/60">
            Vitória por{' '}
            <span className="text-ivory-100 font-semibold">
              {ui.winner.winType === 'hand' ? 'mão vazia' : ui.winner.winType === 'trancado' ? 'jogo trancado' : 'carroça'}
            </span>
          </p>
          <div className="space-y-2">
            {uiPlayers.map((p) => (
              <div key={p.id} className="flex justify-between px-4 py-2 bg-wood-700/50 rounded-lg">
                <span className="text-ivory-100">{p.name}</span>
                <span className="text-amber-400 font-mono">{p.score} pts</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
            Jogar Novamente
          </button>
        </div>
      </div>
    )
  }

  // ─── Playing ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-wood-grain flex flex-col p-4 md:p-6 overflow-hidden">
      {/* Error Toast */}
      {ui.error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-900/90 border border-red-500/50 text-red-200 px-6 py-3 rounded-full shadow-lg text-sm font-medium">
          ❌ {ui.error}
        </div>
      )}

      {/* Header */}
      <header className="flex justify-between items-center mb-4 z-10">
        <div className="bg-wood-800/80 backdrop-blur-md border border-wood-500/30 px-6 py-2 rounded-full shadow-lg">
          <span className="text-ivory-100/60 text-sm mr-2 uppercase tracking-wider font-semibold">Sala:</span>
          <span className="text-amber-400 font-mono font-bold tracking-widest">{roomCode}</span>
        </div>

        <div className="flex gap-4">
          <div className="bg-wood-800/80 backdrop-blur-md border border-wood-500/30 px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-felt-500 animate-pulse" />
            <span className="text-ivory-100 font-medium">
              {isMyTurn ? (
                <span className="text-amber-400 font-bold">Sua vez!</span>
              ) : (
                <>Vez de <span className="text-amber-400 font-bold">{uiPlayers.find((p) => p.isActive)?.name}</span></>
              )}
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 rounded-full bg-wood-800/80 hover:bg-red-600/80 border border-wood-500/30 text-ivory-100 transition-colors text-sm font-medium"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main Game Area */}
      <div className="flex-1 flex gap-6 min-h-0 relative">
        {/* Players Sidebar */}
        <aside className="hidden lg:flex flex-col z-10 shrink-0">
          <h2 className="text-ivory-100/50 text-xs font-bold uppercase tracking-widest mb-3 pl-2">Jogadores</h2>
          <PlayersList players={uiPlayers} currentPlayerIndex={currentPlayerIndex} />
        </aside>

        {/* Table */}
        <main className="flex-1 flex flex-col relative min-w-0">
          {/* Top Opponent */}
          {topPlayer && (
            <div className="absolute top-0 left-0 right-0 h-24 flex items-start justify-center z-20 pointer-events-none">
              <div className="bg-wood-800/60 px-6 pt-2 pb-6 rounded-b-2xl border-b border-x border-wood-500/30 backdrop-blur-sm shadow-xl flex flex-col items-center">
                <span className="text-ivory-100/80 text-sm font-bold mb-2">{topPlayer.name}</span>
                {renderOpponentHand(topPlayer.handCount, 'horizontal')}
              </div>
            </div>
          )}

          {/* Left Opponent */}
          {leftPlayer && (
            <div className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-start z-20 pointer-events-none">
              <div className="bg-wood-800/60 py-6 pl-2 pr-6 rounded-r-2xl border-r border-y border-wood-500/30 backdrop-blur-sm shadow-xl flex flex-row items-center gap-2">
                {renderOpponentHand(leftPlayer.handCount, 'vertical')}
                <span className="text-ivory-100/80 text-sm font-bold">{leftPlayer.name}</span>
              </div>
            </div>
          )}

          {/* Right Opponent */}
          {rightPlayer && (
            <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-end z-20 pointer-events-none">
              <div className="bg-wood-800/60 py-6 pr-2 pl-6 rounded-l-2xl border-l border-y border-wood-500/30 backdrop-blur-sm shadow-xl flex flex-row items-center gap-2">
                <span className="text-ivory-100/80 text-sm font-bold">{rightPlayer.name}</span>
                {renderOpponentHand(rightPlayer.handCount, 'vertical')}
              </div>
            </div>
          )}

          {/* Board */}
          <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12 z-0">
            <Board dominos={ui.gameState?.board ?? []} />
          </div>

          {/* Local Player Controls + Hand */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end z-20 pb-2">
            <GameControls
              canPlay={isMyTurn && !!selectedDomino && playableDominoIds.includes(selectedDomino?.id ?? '')}
              canPass={isMyTurn && playableDominoIds.length === 0}
              canDraw={isMyTurn && playableDominoIds.length === 0 && (ui.gameState?.stockCount ?? 0) > 0}
              selectedDomino={selectedDomino}
              onPlayLeft={handlePlayLeft}
              onPlayRight={handlePlayRight}
              onPass={handlePass}
              onDraw={handleDraw}
            />

            <div className="mt-4">
              <Hand
                dominos={ui.myHand}
                selectedId={selectedDomino?.id}
                playableDominoIds={isMyTurn ? playableDominoIds : []}
                onSelect={(d) => setSelectedDomino((prev) => prev?.id === d.id ? undefined : d)}
                isCurrentPlayer={isMyTurn}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
