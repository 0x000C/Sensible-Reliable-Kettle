import type { Card, GameState, PlayerHand } from './types';
import { createDeck, shuffleDeck } from './deck';

export function createPlayer(): PlayerHand {
  return {
    numbers: new Set(),
    modifiers: [],
    hasSecondChance: false,
    isFrozen: false,
    busted: false,
    stayed: false,
  };
}

export function initializeGame(numPlayers: number): GameState {
  return {
    deck: shuffleDeck(createDeck()),
    players: Array(numPlayers).fill(null).map(() => createPlayer()),
    currentPlayerIndex: 0,
    roundNumber: 0,
    scores: Array(numPlayers).fill(0),
  };
}

export function dealInitialCard(state: GameState, playerIndex: number): Card | null {
  if (state.deck.length === 0) return null;

  const card = state.deck.pop()!;
  applyCardToPlayer(state.players[playerIndex], card, state);

  return card;
}

function applyCardToPlayer(player: PlayerHand, card: Card, _state: GameState): boolean {
  if (card.type === 'number') {
    // Check if player already has this number
    if (player.numbers.has(card.value)) {
      // Check for Second Chance
      if (player.hasSecondChance) {
        player.hasSecondChance = false;
        return false; // Card discarded, didn't bust
      } else {
        player.busted = true;
        return true; // Busted
      }
    } else {
      player.numbers.add(card.value);

      // Check for Flip 7
      if (player.numbers.size === 7) {
        return true; // Flip 7 achieved, special handling needed
      }
    }
  } else if (card.type === 'action') {
    // Actions are resolved immediately during dealing or drawing
    // For now, store them to be resolved by strategy
    if (card.value === 'SECOND_CHANCE') {
      if (!player.hasSecondChance) {
        player.hasSecondChance = true;
      }
      // If player already has Second Chance, it should be passed to another player
      // This will be handled by the game logic
    }
  } else if (card.type === 'modifier') {
    player.modifiers.push(card.value);
  }

  return false;
}

export function drawCard(state: GameState, playerIndex: number): {
  card: Card | null;
  busted: boolean;
  flip7: boolean;
} {
  if (state.deck.length === 0) {
    return { card: null, busted: false, flip7: false };
  }

  const card = state.deck.pop()!;
  const player = state.players[playerIndex];

  if (card.type === 'number') {
    if (player.numbers.has(card.value)) {
      if (player.hasSecondChance) {
        player.hasSecondChance = false;
        return { card, busted: false, flip7: false };
      } else {
        player.busted = true;
        return { card, busted: true, flip7: false };
      }
    } else {
      player.numbers.add(card.value);
      const flip7 = player.numbers.size === 7;
      return { card, busted: false, flip7 };
    }
  } else if (card.type === 'modifier') {
    player.modifiers.push(card.value);
  } else if (card.type === 'action') {
    if (card.value === 'SECOND_CHANCE') {
      if (!player.hasSecondChance) {
        player.hasSecondChance = true;
      }
    }
    // FREEZE and FLIP_THREE need to be handled by strategy
  }

  return { card, busted: false, flip7: false };
}

export function calculateScore(player: PlayerHand, flip7: boolean): number {
  if (player.busted) return 0;

  // Sum number cards
  let score = Array.from(player.numbers).reduce((sum: number, num) => sum + num, 0);

  // Apply x2 modifier if present
  const hasMultiplier = player.modifiers.includes('x2');
  if (hasMultiplier) {
    score *= 2;
  }

  // Add + modifiers
  player.modifiers.forEach(mod => {
    if (mod.startsWith('+')) {
      score += parseInt(mod.substring(1));
    }
  });

  // Add Flip 7 bonus
  if (flip7) {
    score += 15;
  }

  return score;
}

export function isPlayerActive(player: PlayerHand): boolean {
  return !player.busted && !player.stayed && !player.isFrozen;
}

export function getActivePlayers(state: GameState): number[] {
  return state.players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => isPlayerActive(player))
    .map(({ index }) => index);
}

export function stayPlayer(state: GameState, playerIndex: number): void {
  state.players[playerIndex].stayed = true;
}

export function freezePlayer(state: GameState, playerIndex: number): void {
  state.players[playerIndex].isFrozen = true;
  state.players[playerIndex].stayed = true;
}
