import type { Card, NumberCard } from './types';

export function createDeck(): Card[] {
  const deck: Card[] = [];

  // Number cards: one 0, one 1, two 2s, three 3s, ... twelve 12s
  deck.push({ type: 'number', value: 0 });
  for (let num = 1; num <= 12; num++) {
    for (let count = 0; count < num; count++) {
      deck.push({ type: 'number', value: num as NumberCard });
    }
  }

  // Action cards
  deck.push({ type: 'action', value: 'FREEZE' });
  deck.push({ type: 'action', value: 'FLIP_THREE' });
  deck.push({ type: 'action', value: 'SECOND_CHANCE' });

  // Modifier cards
  const modifiers = ['+2', '+3', '+4', '+5', '+6', '+7', '+8', '+9', '+10', 'x2'] as const;
  modifiers.forEach(mod => {
    deck.push({ type: 'modifier', value: mod });
  });

  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getDeckStats(deck: Card[]): {
  numberCounts: Map<NumberCard, number>;
  actionCounts: Map<string, number>;
  modifierCounts: Map<string, number>;
} {
  const numberCounts = new Map<NumberCard, number>();
  const actionCounts = new Map<string, number>();
  const modifierCounts = new Map<string, number>();

  deck.forEach(card => {
    if (card.type === 'number') {
      numberCounts.set(card.value, (numberCounts.get(card.value) || 0) + 1);
    } else if (card.type === 'action') {
      actionCounts.set(card.value, (actionCounts.get(card.value) || 0) + 1);
    } else {
      modifierCounts.set(card.value, (modifierCounts.get(card.value) || 0) + 1);
    }
  });

  return { numberCounts, actionCounts, modifierCounts };
}
