export type GameMode = 'classico' | 'mexicano';
export type GameStatus = 'waiting' | 'in_progress' | 'finished';

export interface Domino {
  left: number;
  right: number;
}

export interface GameState {
  id: string;
  status: GameStatus;
  mode: GameMode;
  board: Domino[];
  players: string[];
  currentPlayerIndex: number;
  playersHands: Map<string, Domino[]>;
  usedDominos: Set<string>;
  round: number;
}

export interface GameRound {
  playedBy: string;
  domino: Domino;
  timestamp: number;
}
