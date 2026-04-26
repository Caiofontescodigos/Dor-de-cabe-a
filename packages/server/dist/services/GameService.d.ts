export type Domino = {
    id: string;
    left: number;
    right: number;
};
export type MoveSide = 'left' | 'right';
export type GameState = {
    id: string;
    players: string[];
    hands: Map<string, Domino[]>;
    board: Domino[];
    stock: Domino[];
    currentPlayer: string;
    status: 'waiting' | 'playing' | 'finished';
    passesInRow: number;
    winner: string | null;
    winType: 'hand' | 'trancado' | 'carroca' | null;
    scores: Map<string, number>;
};
export declare class GameService {
    createGame(gameId: string, players: string[]): GameState;
    playMove(game: GameState, playerId: string, dominoId: string, side: MoveSide): GameState | null;
    passTurn(game: GameState, playerId: string): GameState | null;
    drawUntilPlayable(game: GameState, playerId: string): GameState | null;
    nextTurn(game: GameState): void;
    finishGame(game: GameState, type: 'hand' | 'trancado' | 'carroca', winnerId?: string): void;
    calculateScores(game: GameState): Map<string, number>;
    getValidMoves(hand: Domino[], board: Domino[]): Domino[];
    findStartingPlayer(hands: Map<string, Domino[]>, players: string[]): string;
    flip(d: Domino): Domino;
    generateAllDominos(): Domino[];
    shuffle(array: Domino[]): Domino[];
}
//# sourceMappingURL=GameService.d.ts.map