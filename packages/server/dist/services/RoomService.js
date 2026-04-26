// packages/server/src/services/RoomService.ts
import { GameService } from './GameService';
export class RoomService {
    constructor() {
        this.rooms = new Map();
        this.gameService = new GameService();
    }
    // ===============================
    // 🏠 CREATE ROOM
    // ===============================
    createRoom(roomId) {
        const room = {
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
    joinRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        if (!room.players.includes(playerId)) {
            room.players.push(playerId);
        }
        return room;
    }
    // ===============================
    // 🚪 LEAVE ROOM
    // ===============================
    leaveRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        room.players = room.players.filter((p) => p !== playerId);
        return room;
    }
    // ===============================
    // ▶️ START GAME
    // ===============================
    startGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        if (room.players.length < 2)
            return null;
        const game = this.gameService.createGame(roomId, room.players);
        room.game = game;
        return game;
    }
    // ===============================
    // 🎯 PLAY MOVE
    // ===============================
    playMove(roomId, playerId, dominoId, side) {
        const room = this.rooms.get(roomId);
        if (!room || !room.game)
            return null;
        const updated = this.gameService.playMove(room.game, playerId, dominoId, side);
        return updated;
    }
    // ===============================
    // ⛔ PASS TURN
    // ===============================
    passTurn(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room || !room.game)
            return null;
        return this.gameService.passTurn(room.game, playerId);
    }
    // ===============================
    // 🃏 DRAW
    // ===============================
    draw(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room || !room.game)
            return null;
        return this.gameService.drawUntilPlayable(room.game, playerId);
    }
    // ===============================
    // 📡 GET ROOM
    // ===============================
    getRoom(roomId) {
        return this.rooms.get(roomId) || null;
    }
}
export const roomService = new RoomService();
//# sourceMappingURL=RoomService.js.map