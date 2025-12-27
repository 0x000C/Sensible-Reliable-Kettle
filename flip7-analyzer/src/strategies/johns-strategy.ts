import type { Strategy, StrategyContext } from './types';

export const johnsStrategy: Strategy = {
  name: "John's Current Strategy",
  description: "Draw 3 cards immediately, then stop if cards are 9-12 (or 5-8 if deck is fresh). Track 0-3 and special cards.",

  shouldHit(context: StrategyContext): boolean {
    const { myHand, deckSize } = context;
    const cardCount = myHand.numbers.size;

    // Always draw if we have fewer than 3 cards
    if (cardCount < 3) {
      return true;
    }

    // Check if we have high-risk cards
    const hasHighCards = Array.from(myHand.numbers).some(n => n >= 9);
    const hasMidCards = Array.from(myHand.numbers).some(n => n >= 5 && n <= 8);

    // If we have high cards (9-12), stop
    if (hasHighCards) {
      return false;
    }

    // If deck is fresh (>70 cards) and we have mid cards (5-8), stop
    if (deckSize > 70 && hasMidCards) {
      return false;
    }

    // Calculate bust probability
    const bustRisk = calculateBustProbability(context);

    // If bust risk is too high, stop
    if (bustRisk > 0.3) {
      return false;
    }

    // Otherwise, keep drawing (but not past 6 cards to leave room for Flip 7)
    return cardCount < 6;
  },
};

function calculateBustProbability(context: StrategyContext): number {
  const { myHand, deckSize } = context;

  if (deckSize === 0) return 1.0;

  // Count how many cards in the deck would cause a bust
  let bustCards = 0;
  myHand.numbers.forEach(num => {
    // Estimate how many of this number remain in deck
    const initialCount = num === 0 ? 1 : num;
    const estimated = initialCount * (deckSize / 94);
    bustCards += estimated;
  });

  return Math.min(1.0, bustCards / deckSize);
}
