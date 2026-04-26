import { GameState } from './GameService';
type Room = {
    id: string;
    players: string[];
    game: GameState | null;
};
export declare class RoomService {
    private rooms;
    private gameService;
    createRoom(roomId: string): Room;
    joinRoom(roomId: string, playerId: string): Room | null;
    leaveRoom(roomId: string, playerId: string): Room | null;
    startGame(roomId: string): GameState | null;
    playMove(roomId: string, playerId: string, dominoId: string, side: 'left' | 'right'): GameState | null;
    passTurn(roomId: string, playerId: string): GameState | null;
    draw(roomId: string, playerId: string): GameState | null;
    getRoom(roomId: string): Room | null;
}
export declare const roomService: RoomService;
export {};
//# sourceMappingURL=RoomService.d.ts.map