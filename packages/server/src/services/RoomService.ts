// packages/server/src/services/RoomService.ts

import { GameService, GameState } from './GameService';

type Room = {
  id: string;
  players: string[];
  game: GameState | null;
};

export class RoomService {
  private rooms: Map<string, Room> = new Map();
  private gameService = new GameService();

  // ===============================
  // 🏠 CREATE ROOM
  // ===============================
  createRoom(roomId: string): Room {
    const room: Room = {
      id: roomId,
      players: [],
      game: null,
    };

    this.rooms.set(roomId, room);
    return room;
  }

  // ===============================
  // 👥 JOIN ROOM
  // ===============================
  joinRoom(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (!room.players.includes(playerId)) {
      room.players.push(playerId);
    }

    return room;
  }

  // ===============================
  // 🚪 LEAVE ROOM
  // ===============================
  leaveRoom(roomId: string, playerId: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    room.players = room.players.filter((p) => p !== playerId);

    return room;
  }

  // ===============================
  // ▶️ START GAME
  // ===============================
  startGame(roomId: string): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    if (room.players.length < 2) return null;

    const game = this.gameService.createGame(roomId, room.players);

    room.game = game;

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
    if (!room || !room.game) return null;

    const updated = this.gameService.playMove(
      room.game,
      playerId,
      dominoId,
      side
    );

    return updated;
  }

  // ===============================
  // ⛔ PASS TURN
  // ===============================
  passTurn(roomId: string, playerId: string): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.game) return null;

    return this.gameService.passTurn(room.game, playerId);
  }

  // ===============================
  // 🃏 DRAW
  // ===============================
  draw(roomId: string, playerId: string): GameState | null {
    const room = this.rooms.get(roomId);
    if (!room || !room.game) return null;

    return this.gameService.drawUntilPlayable(room.game, playerId);
  }

  // ===============================
  // 📡 GET ROOM
  // ===============================
  getRoom(roomId: string): Room | null {
    return this.rooms.get(roomId) || null;
  }
}

export const roomService = new RoomService();