export type GameMode = 'classico' | 'mexicano';
export type GameStatus = 'waiting' | 'in_progress' | 'finished';
export type PlayerPosition = 'left' | 'top' | 'right' | 'bottom';

export interface Domino {
  left: number;
  right: number;
}

export interface Player {
  id: string;
  name: string;
  position: PlayerPosition;
  handCount: number;
  score: number;
  isActive: boolean;
  canPlay: boolean;
}

export interface GameState {
  status: GameStatus;
  mode: GameMode;
  board: Domino[];
  players: Player[];
  currentPlayerIndex: number;
  round: number;
}

export interface Room {
  code: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  status: GameStatus;
  gameMode: GameMode;
  players: Player[];
}

export interface PlayerMove {
  playerId: string;
  domino: Domino;
  side: 'left' | 'right';
}
