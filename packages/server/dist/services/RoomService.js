// packages/server/src/services/RoomService.ts
import { GameService } from './GameService';
export class RoomService {
    constructor() {
        this.rooms = new Map();
        this.players = new Map();
        this.gameService = new GameService();
    }
    // ===============================
    // 🔑 HELPERS PRIVADOS
    // ===============================
    generateCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    // ===============================
    // 🏠 CREATE ROOM
    // ===============================
    async createRoom(config) {
        const code = this.generateCode();
        const ownerPlayer = {
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
        const room = {
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
    async joinRoom(roomCode, playerName, socketId) {
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
        const positions = [
            'left',
            'top',
            'right',
            'bottom',
        ];
        const usedPositions = room.players.map((p) => p.position);
        const position = positions.find((pos) => !usedPositions.includes(pos)) || 'left';
        const player = {
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
    async leaveRoom(playerId) {
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
    async startGame(roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room)
            return null;
        if (room.players.length < 2)
            return null;
        const playerIds = room.players.map((p) => p.id);
        const game = this.gameService.createGame(roomCode, playerIds);
        room.status = 'in_progress';
        room.startedAt = Date.now();
        return game;
    }
    // ===============================
    // 🎯 PLAY MOVE
    // ===============================
    playMove(roomId, playerId, dominoId, side) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        const game = this.gameService.getGame(roomId);
        if (!game)
            return null;
        const updated = this.gameService.playMove(game, playerId, dominoId, side);
        return updated;
    }
    // ===============================
    // ⛔ PASS TURN
    // ===============================
    passTurn(roomId, playerId) {
        const game = this.gameService.getGame(roomId);
        if (!game)
            return null;
        return this.gameService.passTurn(game, playerId);
    }
    // ===============================
    // 🃏 DRAW
    // ===============================
    draw(roomId, playerId) {
        const game = this.gameService.getGame(roomId);
        if (!game)
            return null;
        return this.gameService.drawUntilPlayable(game, playerId);
    }
    // ===============================
    // 📡 GET ROOM (objeto completo)
    // ===============================
    getRoom(roomCode) {
        return this.rooms.get(roomCode) || null;
    }
    // ===============================
    // 📋 GET ROOM INFO (resumo público)
    // ===============================
    getRoomInfo(roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room)
            return null;
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
    getPlayer(playerId) {
        return this.players.get(playerId) || null;
    }
    // ===============================
    // 📋 LIST ROOMS
    // ===============================
    listRooms() {
        return Array.from(this.rooms.values())
            .filter((room) => room.status === 'waiting')
            .map((room) => this.getRoomInfo(room.code));
    }
}
export const roomService = new RoomService();
//# sourceMappingURL=RoomService.js.map