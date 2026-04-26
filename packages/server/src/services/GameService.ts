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

export class GameService {
  private games: Map<string, GameState> = new Map();

  // ===============================
  // 📦 GET GAME
  // ===============================
  getGame(gameId: string): GameState | null {
    return this.games.get(gameId) || null;
  }

  // ===============================
  // 🎲 CREATE GAME
  // ===============================
  createGame(gameId: string, players: string[]): GameState {
    const all = this.generateAllDominos();
    const shuffled = this.shuffle(all);

    const hands = new Map<string, Domino[]>();

    players.forEach((p) => {
      hands.set(p, shuffled.splice(0, 7));
    });

    const stock = shuffled;

    const currentPlayer = this.findStartingPlayer(hands, players);

    const game: GameState = {
      id: gameId,
      players,
      hands,
      board: [],
      stock,
      currentPlayer,
      status: 'playing',
      passesInRow: 0,
      winner: null,
      winType: null,
      scores: new Map(),
    };

    this.games.set(gameId, game);
    return game;
  }

  // ===============================
  // 🎯 PLAY MOVE
  // ===============================
  playMove(
    game: GameState,
    playerId: string,
    dominoId: string,
    side: MoveSide
  ): GameState | null {
    if (game.status !== 'playing') return null;
    if (game.currentPlayer !== playerId) return null;
    if (side !== 'left' && side !== 'right') return null;

    const hand = game.hands.get(playerId);
    if (!hand) return null;

    const index = hand.findIndex((d) => d.id === dominoId);
    if (index === -1) return null;

    let domino = hand[index];

    if (game.board.length === 0) {
      game.board.push(domino);
    } else {
      const leftEnd = game.board[0].left;
      const rightEnd = game.board[game.board.length - 1].right;

      if (side === 'left') {
        if (domino.right === leftEnd) {
        } else if (domino.left === leftEnd) {
          domino = this.flip(domino);
        } else {
          return null;
        }
        game.board.unshift(domino);
      }

      if (side === 'right') {
        if (domino.left === rightEnd) {
        } else if (domino.right === rightEnd) {
          domino = this.flip(domino);
        } else {
          return null;
        }
        game.board.push(domino);
      }
    }

    hand.splice(index, 1);
    game.passesInRow = 0;

    // vitória por mão
    if (hand.length === 0) {
      this.finishGame(game, 'hand', playerId);
      return game;
    }

    // carroça
    const doubles = hand.filter((d) => d.left === d.right);
    if (doubles.length >= 5) {
      this.finishGame(game, 'carroca', playerId);
      return game;
    }

    this.nextTurn(game);
    return game;
  }

  // ===============================
  // ⛔ PASS TURN
  // ===============================
  passTurn(game: GameState, playerId: string): GameState | null {
    if (game.status !== 'playing') return null;
    if (game.currentPlayer !== playerId) return null;

    const hand = game.hands.get(playerId);
    if (!hand) return null;

    const validMoves = this.getValidMoves(hand, game.board);
    if (validMoves.length > 0) return null;

    game.passesInRow++;

    if (game.passesInRow >= game.players.length) {
      this.finishGame(game, 'trancado');
      return game;
    }

    this.nextTurn(game);
    return game;
  }

  // ===============================
  // 🃏 DRAW
  // ===============================
  drawUntilPlayable(game: GameState, playerId: string): GameState | null {
    if (game.status !== 'playing') return null;
    if (game.currentPlayer !== playerId) return null;

    const hand = game.hands.get(playerId);
    if (!hand) return null;

    // não pode comprar se tiver jogada
    const validMoves = this.getValidMoves(hand, game.board);
    if (validMoves.length > 0) return game;

    while (game.stock.length > 0) {
      const piece = game.stock.pop()!;
      hand.push(piece);

      const newMoves = this.getValidMoves(hand, game.board);
      if (newMoves.length > 0) break;
    }

    return game;
  }

  // ===============================
  // 🔁 NEXT TURN
  // ===============================
  nextTurn(game: GameState) {
    const i = game.players.indexOf(game.currentPlayer);
    const next = (i - 1 + game.players.length) % game.players.length;
    game.currentPlayer = game.players[next];
  }

  // ===============================
  // 🏁 FINISH GAME
  // ===============================
  finishGame(
    game: GameState,
    type: 'hand' | 'trancado' | 'carroca',
    winnerId?: string
  ) {
    game.status = 'finished';
    game.winType = type;

    const scores = this.calculateScores(game);
    game.scores = scores;

    if (type === 'hand' || type === 'carroca') {
      game.winner = winnerId!;
      return;
    }

    let winner = game.players[0];
    let min = scores.get(winner)!;

    for (const p of game.players) {
      const s = scores.get(p)!;
      if (s < min) {
        min = s;
        winner = p;
      }
    }

    game.winner = winner;
  }

  // ===============================
  // 🧮 SCORE
  // ===============================
  calculateScores(game: GameState): Map<string, number> {
    const scores = new Map<string, number>();

    for (const p of game.players) {
      const hand = game.hands.get(p)!;

      const total = hand.reduce(
        (sum, d) => sum + d.left + d.right,
        0
      );

      scores.set(p, total);
    }

    return scores;
  }

  // ===============================
  // 🎯 VALID MOVES
  // ===============================
  getValidMoves(hand: Domino[], board: Domino[]): Domino[] {
    if (board.length === 0) return hand;

    const left = board[0].left;
    const right = board[board.length - 1].right;

    return hand.filter(
      (d) =>
        d.left === left ||
        d.right === left ||
        d.left === right ||
        d.right === right
    );
  }

  // ===============================
  // 🧠 START PLAYER
  // ===============================
  findStartingPlayer(
    hands: Map<string, Domino[]>,
    players: string[]
  ): string {
    let best = players[0];
    let bestVal = -1;

    for (const p of players) {
      const hand = hands.get(p)!;

      for (const d of hand) {
        if (d.left === 6 && d.right === 6) return p;

        const val = d.left + d.right;
        if (val > bestVal) {
          bestVal = val;
          best = p;
        }
      }
    }

    return best;
  }

  // ===============================
  // 🔄 HELPERS
  // ===============================
  flip(d: Domino): Domino {
    return { ...d, left: d.right, right: d.left };
  }

  generateAllDominos(): Domino[] {
    const list: Domino[] = [];
    let id = 0;

    for (let i = 0; i <= 6; i++) {
      for (let j = i; j <= 6; j++) {
        list.push({ id: `${id++}`, left: i, right: j });
      }
    }

    return list;
  }

  shuffle(array: Domino[]): Domino[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}