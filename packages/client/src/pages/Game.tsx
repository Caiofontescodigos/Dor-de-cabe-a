import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Board from '@components/Board'
import Hand from '@components/Hand'
import PlayersList from '@components/PlayersList'
import GameControls from '@components/GameControls'
import DominoTileBack from '@components/DominoTileBack'
import {
  mockGameState,
  mockPlayerHand,
  mockPlayableDominoIds,
  DominoWithId,
} from '../mocks/mockData'

export default function Game() {
  const { roomCode } = useParams()
  const navigate = useNavigate()

  // Local state for UI prototyping
  const [selectedDomino, setSelectedDomino] = useState<DominoWithId | undefined>()

  const handleSelectDomino = (domino: DominoWithId) => {
    if (selectedDomino?.id === domino.id) {
      setSelectedDomino(undefined) // Deselect
    } else {
      setSelectedDomino(domino)
    }
  }

  // Get players by position for the UI layout
  const players = mockGameState.players
  const localPlayer = players.find((p) => p.position === 'bottom')
  const topPlayer = players.find((p) => p.position === 'top')
  const leftPlayer = players.find((p) => p.position === 'left')
  const rightPlayer = players.find((p) => p.position === 'right')

  // Helper to render opponent hands (backs of dominos)
  const renderOpponentHand = (count: number, orientation: 'horizontal' | 'vertical') => {
    return (
      <div className={`flex ${orientation === 'vertical' ? 'flex-col' : 'flex-row'} gap-1 justify-center items-center`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={orientation === 'vertical' ? '-mt-6 first:mt-0' : '-ml-4 first:ml-0'}>
            <DominoTileBack orientation={orientation === 'vertical' ? 'horizontal' : 'vertical'} size="sm" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-wood-grain flex flex-col p-4 md:p-6 overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center mb-4 z-10">
        <div className="bg-wood-800/80 backdrop-blur-md border border-wood-500/30 px-6 py-2 rounded-full shadow-lg">
          <span className="text-ivory-100/60 text-sm mr-2 uppercase tracking-wider font-semibold">Sala:</span>
          <span className="text-amber-400 font-mono font-bold tracking-widest">{roomCode}</span>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-wood-800/80 backdrop-blur-md border border-wood-500/30 px-6 py-2 rounded-full shadow-lg flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-felt-500 animate-pulse"></span>
            <span className="text-ivory-100 font-medium">
              Vez de <span className="text-amber-400 font-bold">{players[mockGameState.currentPlayerIndex].name}</span>
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
        
        {/* Left Sidebar: Players */}
        <aside className="hidden lg:flex flex-col z-10 shrink-0">
          <h2 className="text-ivory-100/50 text-xs font-bold uppercase tracking-widest mb-3 pl-2">Jogadores</h2>
          <PlayersList players={mockGameState.players} currentPlayerIndex={mockGameState.currentPlayerIndex} />
        </aside>

        {/* Center: The Table */}
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
                <span className="text-ivory-100/80 text-sm font-bold writing-vertical-rl rotate-180">{leftPlayer.name}</span>
              </div>
            </div>
          )}

          {/* Right Opponent */}
          {rightPlayer && (
            <div className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-end z-20 pointer-events-none">
              <div className="bg-wood-800/60 py-6 pr-2 pl-6 rounded-l-2xl border-l border-y border-wood-500/30 backdrop-blur-sm shadow-xl flex flex-row items-center gap-2">
                <span className="text-ivory-100/80 text-sm font-bold writing-vertical-rl">{rightPlayer.name}</span>
                {renderOpponentHand(rightPlayer.handCount, 'vertical')}
              </div>
            </div>
          )}

          {/* Board */}
          <div className="absolute inset-0 flex items-center justify-center p-8 lg:p-12 z-0">
            <Board dominos={mockGameState.board as DominoWithId[]} />
          </div>

          {/* Bottom Local Player Area */}
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end z-20 pb-2">
            <GameControls
              canPlay={localPlayer?.canPlay ?? false}
              canPass={Boolean(!localPlayer?.canPlay && localPlayer?.isActive)}
              canDraw={Boolean(!localPlayer?.canPlay && localPlayer?.isActive)}
              selectedDomino={selectedDomino}
              onPlayLeft={() => console.log('Play left', selectedDomino)}
              onPlayRight={() => console.log('Play right', selectedDomino)}
              onPass={() => console.log('Pass turn')}
              onDraw={() => console.log('Draw domino')}
            />
            
            <div className="mt-4">
              <Hand
                dominos={mockPlayerHand}
                selectedId={selectedDomino?.id}
                playableDominoIds={mockPlayableDominoIds}
                onSelect={handleSelectDomino}
                isCurrentPlayer={localPlayer?.isActive}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
