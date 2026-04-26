import { GameState } from './GameService.js';
import { Player } from '../types/player.js';
import { Room, RoomConfig, RoomInfo } from '../types/room.js';
export declare class RoomService {
    private rooms;
    private players;
    private gameService;
    private generateCode;
    private generateId;
    createRoom(config: RoomConfig): Promise<Room>;
    joinRoom(roomCode: string, playerName: string, socketId: string): Promise<{
        success: boolean;
        error?: string;
        player?: Player;
        room?: Room;
    }>;
    leaveRoom(playerId: string): Promise<{
        success: boolean;
        roomDeleted?: boolean;
    }>;
    startGame(roomCode: string): Promise<GameState | null>;
    playMove(roomId: string, playerId: string, dominoId: string, side: 'left' | 'right'): GameState | null;
    passTurn(roomId: string, playerId: string): GameState | null;
    draw(roomId: string, playerId: string): GameState | null;
    getRoom(roomCode: string): Room | null;
    getRoomInfo(roomCode: string): RoomInfo | null;
    getPlayer(playerId: string): Player | null;
    listRooms(): RoomInfo[];
}
export declare const roomService: RoomService;
//# sourceMappingURL=RoomService.d.ts.map