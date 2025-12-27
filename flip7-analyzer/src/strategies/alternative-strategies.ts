import type { Strategy, StrategyContext } from './types';

export const conservativeStrategy: Strategy = {
  name: "Conservative",
  description: "Stop at 3 cards with a total score of 15+ points",

  shouldHit(context: StrategyContext): boolean {
    const { myHand } = context;
    const cardCount = myHand.numbers.size;

    if (cardCount < 3) {
      return true;
    }

    const totalPoints = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0);

    // Stop if we have 3+ cards and 15+ points
    if (cardCount >= 3 && totalPoints >= 15) {
      return false;
    }

    // Don't go past 5 cards
    return cardCount < 5;
  },
};

export const greedyStrategy: Strategy = {
  name: "Greedy (Always Flip 7)",
  description: "Always try to achieve Flip 7, regardless of risk",

  shouldHit(context: StrategyContext): boolean {
    const { myHand } = context;
    // Always draw until we have 7 cards or bust
    return myHand.numbers.size < 7;
  },
};

export const probabilityStrategy: Strategy = {
  name: "Probability-Based",
  description: "Stop when bust probability exceeds 25%",

  shouldHit(context: StrategyContext): boolean {
    const { myHand, deckSize } = context;

    if (deckSize === 0) return false;

    // Always draw at least 2 cards
    if (myHand.numbers.size < 2) {
      return true;
    }

    // Calculate bust probability
    const bustProb = calculateBustProbability(context);

    // Stop if bust probability > 25%
    if (bustProb > 0.25) {
      return false;
    }

    // Don't go past 6 cards
    return myHand.numbers.size < 6;
  },
};

export const balancedStrategy: Strategy = {
  name: "Balanced",
  description: "Draw 4 cards, then stop if total > 20 or bust risk > 30%",

  shouldHit(context: StrategyContext): boolean {
    const { myHand } = context;
    const cardCount = myHand.numbers.size;

    // Always draw first 4 cards
    if (cardCount < 4) {
      return true;
    }

    const totalPoints = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0);

    // Stop if we have good points
    if (totalPoints > 20) {
      return false;
    }

    // Stop if bust risk is high
    const bustProb = calculateBustProbability(context);
    if (bustProb > 0.30) {
      return false;
    }

    // Don't go past 6 cards
    return cardCount < 6;
  },
};

export const adaptiveStrategy: Strategy = {
  name: "Adaptive",
  description: "Adjusts risk based on deck depletion and current score",

  shouldHit(context: StrategyContext): boolean {
    const { myHand, deckSize } = context;
    const cardCount = myHand.numbers.size;

    // Always draw at least 2 cards
    if (cardCount < 2) {
      return true;
    }

    const deckProportion = deckSize / 94;
    const totalPoints = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0);

    // Early deck (>75% remaining): more conservative
    if (deckProportion > 0.75) {
      if (cardCount >= 3 && totalPoints >= 12) {
        return false;
      }
    }

    // Mid deck (25-75% remaining): balanced
    if (deckProportion > 0.25 && deckProportion <= 0.75) {
      if (cardCount >= 4 && totalPoints >= 18) {
        return false;
      }
    }

    // Late deck (<25% remaining): more aggressive
    if (deckProportion <= 0.25) {
      const bustProb = calculateBustProbability(context);
      if (bustProb > 0.40) {
        return false;
      }
    }

    // Don't go past 6 cards
    return cardCount < 6;
  },
};

function calculateBustProbability(context: StrategyContext): number {
  const { myHand, deckSize } = context;

  if (deckSize === 0) return 1.0;

  let bustCards = 0;
  myHand.numbers.forEach(num => {
    const initialCount = num === 0 ? 1 : num;
    const estimated = initialCount * (deckSize / 94);
    bustCards += estimated;
  });

  return Math.min(1.0, bustCards / deckSize);
}
