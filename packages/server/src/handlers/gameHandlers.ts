import { Socket, Server as SocketIOServer } from 'socket.io';
import { roomService } from '../services/RoomService.js';
import { GameState } from '../services/GameService.js';
import { Room } from '../types/room.js';
import { sqsService } from '../services/SqsService.js';

// ─────────────────────────────────────────────
// Serializa o estado público do jogo (sem mãos)
// ─────────────────────────────────────────────
function buildPublicGameState(game: GameState, room: Room) {
  return {
    board: game.board,
    players: room.players.map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      handCount: game.hands.get(p.id)?.length ?? 0,
      score: game.scores.get(p.id) ?? 0,
      isActive: game.currentPlayer === p.id,
      canPlay: game.currentPlayer === p.id,
    })),
    currentPlayerId: game.currentPlayer,
    status: game.status,
    winner: game.winner,
    winType: game.winType,
    stockCount: game.stock.length,
  };
}

// ─────────────────────────────────────────────
// Emite estado para todos + mão individual a cada jogador
// ─────────────────────────────────────────────
export function broadcastGameState(io: SocketIOServer, roomCode: string, game: GameState) {
  const room = roomService.getRoom(roomCode);
  if (!room) return;

  const publicState = buildPublicGameState(game, room);
  io.to(roomCode).emit('game_updated', { game: publicState });

  // Mão privada para cada jogador
  for (const player of room.players) {
    if (player.socketId) {
      io.to(player.socketId).emit('your_hand', {
        hand: game.hands.get(player.id) ?? [],
      });
    }
  }

  // Fim de jogo
  if (game.status === 'finished') {
    const winnerPlayer = room.players.find((p) => p.id === game.winner);
    const scoresMap: Record<string, number> = {};
    game.scores.forEach((val, key) => { scoresMap[key] = val; });

    io.to(roomCode).emit('game_finished', {
      winner: game.winner,
      winnerName: winnerPlayer?.name ?? 'Desconhecido',
      winType: game.winType,
      scores: scoresMap,
    });

    console.log(`🏆 Jogo finalizado na sala ${roomCode}. Vencedor: ${winnerPlayer?.name}`);
  }
}

// ─────────────────────────────────────────────
// Handlers Socket.IO de jogo
// ─────────────────────────────────────────────
export function registerGameHandlers(io: SocketIOServer, socket: Socket) {

  /**
   * Jogar peça
   * Cliente: socket.emit('play_move', { roomCode, playerId, dominoId, side })
   */
  socket.on('play_move', (data) => {
    try {
      const { roomCode, playerId, dominoId, side } = data;
      const updated = roomService.playMove(roomCode, playerId, dominoId, side);

      if (!updated) {
        socket.emit('move_error', { error: 'Jogada inválida ou não é sua vez' });
        return;
      }

      console.log(`🎯 Jogada: ${playerId} jogou ${dominoId} (${side}) em ${roomCode}`);
      broadcastGameState(io, roomCode, updated);

      sqsService.sendMessage({
        type: 'move_played',
        roomCode,
        timestamp: Date.now(),
        data: { playerId, dominoId, side }
      }).catch(console.error);
    } catch (err) {
      socket.emit('move_error', { error: 'Erro ao processar jogada' });
      console.error('❌ play_move:', err);
    }
  });

  /**
   * Passar vez
   * Cliente: socket.emit('pass_turn', { roomCode, playerId })
   */
  socket.on('pass_turn', (data) => {
    try {
      const { roomCode, playerId } = data;
      const updated = roomService.passTurn(roomCode, playerId);

      if (!updated) {
        socket.emit('move_error', { error: 'Você tem jogadas disponíveis, não pode passar' });
        return;
      }

      console.log(`⏭️ Passou vez: ${playerId} em ${roomCode}`);
      broadcastGameState(io, roomCode, updated);
    } catch (err) {
      socket.emit('move_error', { error: 'Erro ao passar vez' });
      console.error('❌ pass_turn:', err);
    }
  });

  /**
   * Comprar peça
   * Cliente: socket.emit('draw_domino', { roomCode, playerId })
   */
  socket.on('draw_domino', (data) => {
    try {
      const { roomCode, playerId } = data;
      const updated = roomService.draw(roomCode, playerId);

      if (!updated) {
        socket.emit('move_error', { error: 'Não é possível comprar' });
        return;
      }

      console.log(`🃏 Comprou: ${playerId} em ${roomCode}`);
      broadcastGameState(io, roomCode, updated);
    } catch (err) {
      socket.emit('move_error', { error: 'Erro ao comprar peça' });
      console.error('❌ draw_domino:', err);
    }
  });

  /**
   * Solicitar estado atual do jogo
   * Cliente: socket.emit('get_game_state', { roomCode, playerId })
   */
  socket.on('get_game_state', (data) => {
    try {
      const { roomCode, playerId } = data;
      const game = roomService.getGameState(roomCode);

      if (!game) {
        socket.emit('game_state_response', { success: false, error: 'Jogo não iniciado' });
        return;
      }

      const room = roomService.getRoom(roomCode);
      if (!room) return;

      socket.emit('game_state_response', {
        success: true,
        game: buildPublicGameState(game, room),
        hand: game.hands.get(playerId) ?? [],
      });
    } catch (err) {
      socket.emit('game_state_response', { success: false, error: 'Erro ao obter estado' });
      console.error('❌ get_game_state:', err);
    }
  });
}
