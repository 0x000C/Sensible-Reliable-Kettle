// Card types in Flip 7
export type NumberCard = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type ActionCard = 'FREEZE' | 'FLIP_THREE' | 'SECOND_CHANCE';
export type ModifierCard = '+2' | '+3' | '+4' | '+5' | '+6' | '+7' | '+8' | '+9' | '+10' | 'x2';

export type Card =
  | { type: 'number'; value: NumberCard }
  | { type: 'action'; value: ActionCard }
  | { type: 'modifier'; value: ModifierCard };

export interface PlayerHand {
  numbers: Set<NumberCard>;
  modifiers: ModifierCard[];
  hasSecondChance: boolean;
  isFrozen: boolean;
  busted: boolean;
  stayed: boolean;
}

export interface GameState {
  deck: Card[];
  players: PlayerHand[];
  currentPlayerIndex: number;
  roundNumber: number;
  scores: number[];
}

export interface RoundResult {
  scores: number[];
  winner: number | null; // null if no one achieved Flip 7
  flip7Achieved: boolean;
}

export interface GameResult {
  finalScores: number[];
  winner: number;
  rounds: number;
}
