// packages/server/src/services/RoomService.ts

import { GameService, GameState } from './GameService';
import { Player } from '../types/player';
import { Room, RoomConfig, RoomInfo } from '../types/room';

export class RoomService {
  private rooms: Map<string, Room> = new Map();
  private players: Map<string, Player> = new Map();
  private gameService = new GameService();

  // ===============================
  // 🔑 HELPERS PRIVADOS
  // ===============================

  private generateCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  // ===============================
  // 🏠 CREATE ROOM
  // ===============================
  async createRoom(config: RoomConfig): Promise<Room> {
    const code = this.generateCode();

    const ownerPlayer: Player = {
      id: this.generateId(),
      name: config.ownerName,
      socketId: '',
      roomCode: code,
      isReady: false,
      isActive: true,
      position: 'left',
      hand: [],
      score: 0,
    };

    const room: Room = {
      code,
      name: config.name,
      owner: ownerPlayer.id,
      maxPlayers: config.maxPlayers,
      players: [ownerPlayer],
      gameMode: config.gameMode,
      status: 'waiting',
      createdAt: Date.now(),
    };

    this.rooms.set(code, room);
    this.players.set(ownerPlayer.id, ownerPlayer);

    return room;
  }

  // ===============================
  // 👥 JOIN ROOM
  // ===============================
  async joinRoom(
    roomCode: string,
    playerName: string,
    socketId: string
  ): Promise<{ success: boolean; error?: string; player?: Player; room?: Room }> {
    const room = this.rooms.get(roomCode);

    if (!room) {
      return { success: false, error: 'Sala não encontrada' };
    }

    if (room.status !== 'waiting') {
      return { success: false, error: 'Jogo já iniciado' };
    }

    if (room.players.length >= room.maxPlayers) {
      return { success: false, error: 'Sala cheia' };
    }

    const positions: Array<'left' | 'top' | 'right' | 'bottom'> = [
      'left',
      'top',
      'right',
      'bottom',
    ];
    const usedPositions = room.players.map((p) => p.position);
    const position =
      positions.find((pos) => !usedPositions.includes(pos)) || 'left';

    const player: Player = {
      id: this.generateId(),
      name: playerName,
      socketId,
      roomCode,
      isReady: false,
      isActive: true,
      position,
      hand: [],
      score: 0,
    };

    room.players.push(player);
    this.players.set(player.id, player);

    return { success: true, player, room };
  }

  // ===============================
  // 🚪 LEAVE ROOM
  // ===============================
  async leaveRoom(
    playerId: string
  ): Promise<{ success: boolean; roomDeleted?: boolean }> {
    const player = this.players.get(playerId);
    if (!player) {
      return { success: false };
    }

    const room = this.rooms.get(player.roomCode);
    if (!room) {
      this.players.delete(playerId);
      return { success: true };
    }

    room.players = room.players.filter((p) => p.id !== playerId);
    this.players.delete(playerId);

    if (room.players.length === 0) {
      this.rooms.delete(room.code);
      return { success: true, roomDeleted: true };
    }

    // Se o dono saiu, transferir para o próximo
    if (room.owner === playerId && room.players.length > 0) {
      room.owner = room.players[0].id;
    }

    return { success: true, roomDeleted: false };
  }

  // ===============================
  // ▶️ START GAME
  // ===============================
  async startGame(roomCode: string): Promise<GameState | null> {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    if (room.players.length < 2) return null;

    const playerIds = room.players.map((p) => p.id);
    const game = this.gameService.createGame(roomCode, playerIds);

    room.status = 'in_progress';
    room.startedAt = Date.now();

    return game;
  }

  // ===============================
  // 🎯 PLAY MOVE
  // ===============================
  playMove(
    roomId: string,
    playerId: string,
    dominoId: string,
    side: 'left' | 'right'
  ): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const game = this.gameService.getGame(roomId);
    if (!game) return null;

    const updated = this.gameService.playMove(game, playerId, dominoId, side);
    return updated;
  }

  // ===============================
  // ⛔ PASS TURN
  // ===============================
  passTurn(roomId: string, playerId: string): GameState | null {
    const game = this.gameService.getGame(roomId);
    if (!game) return null;

    return this.gameService.passTurn(game, playerId);
  }

  // ===============================
  // 🃏 DRAW
  // ===============================
  draw(roomId: string, playerId: string): GameState | null {
    const game = this.gameService.getGame(roomId);
    if (!game) return null;

    return this.gameService.drawUntilPlayable(game, playerId);
  }

  // ===============================
  // 📡 GET ROOM (objeto completo)
  // ===============================
  getRoom(roomCode: string): Room | null {
    return this.rooms.get(roomCode) || null;
  }

  // ===============================
  // 📋 GET ROOM INFO (resumo público)
  // ===============================
  getRoomInfo(roomCode: string): RoomInfo | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    return {
      code: room.code,
      name: room.name,
      playerCount: room.players.length,
      maxPlayers: room.maxPlayers,
      status: room.status,
      gameMode: room.gameMode,
      players: room.players.map((p) => ({
        id: p.id,
        name: p.name,
        isReady: p.isReady,
      })),
    };
  }

  // ===============================
  // 👤 GET PLAYER
  // ===============================
  getPlayer(playerId: string): Player | null {
    return this.players.get(playerId) || null;
  }

  // ===============================
  // 📋 LIST ROOMS
  // ===============================
  listRooms(): RoomInfo[] {
    return Array.from(this.rooms.values())
      .filter((room) => room.status === 'waiting')
      .map((room) => this.getRoomInfo(room.code)!);
  }
}

export const roomService = new RoomService();