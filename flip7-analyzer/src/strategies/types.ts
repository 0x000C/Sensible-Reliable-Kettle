import type { GameState, PlayerHand, Card } from '../game/types';

export interface StrategyContext {
  myHand: PlayerHand;
  myIndex: number;
  gameState: GameState;
  allPlayers: PlayerHand[];
  deckSize: number;
}

export interface Strategy {
  name: string;
  description: string;
  shouldHit(context: StrategyContext): boolean;
  handleAction?(card: Card, context: StrategyContext): {
    targetPlayer?: number;
    action: 'use' | 'pass';
  };
}
