import type { Strategy, StrategyContext } from './types';
import type { NumberCard } from '../game/types';

// Perfect card counter - tracks all visible cards and calculates exact probabilities
export const perfectMemoryStrategy: Strategy = {
  name: "Perfect Memory",
  description: "Tracks all visible cards perfectly, calculates exact bust probabilities. Stops when bust risk exceeds 20%.",

  shouldHit(context: StrategyContext): boolean {
    const { myHand, allPlayers, deckSize } = context;
    const cardCount = myHand.numbers.size;

    // Always draw at least 2 cards
    if (cardCount < 2) return true;

    // Calculate exact bust probability based on visible cards
    const visibleCards = new Map<NumberCard, number>();

    // Count my cards
    myHand.numbers.forEach(num => {
      visibleCards.set(num, (visibleCards.get(num) || 0) + 1);
    });

    // Count all other players' cards
    allPlayers.forEach(player => {
      player.numbers.forEach(num => {
        visibleCards.set(num, (visibleCards.get(num) || 0) + 1);
      });
    });

    // Calculate how many cards in deck would bust me
    let bustCards = 0;
    myHand.numbers.forEach(num => {
      const initialCount = num === 0 ? 1 : num;
      const alreadySeen = visibleCards.get(num) || 0;
      const remaining = Math.max(0, initialCount - alreadySeen);
      bustCards += remaining;
    });

    const bustProbability = deckSize > 0 ? bustCards / deckSize : 1.0;

    // More aggressive threshold since we have perfect information
    if (bustProbability > 0.20) return false;

    // Calculate expected value
    const currentScore = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0);

    // Stop if we have a good score and moderate risk
    if (currentScore >= 25 && bustProbability > 0.15) return false;

    // Don't be too greedy
    return cardCount < 6;
  }
};

// Blackjack-inspired strategy - "stand on 17" equivalent
export const blackjackStrategy: Strategy = {
  name: "Blackjack-Inspired",
  description: "Uses blackjack-style risk management. Stands on strong hands (18+ points), hits on weak hands (<13).",

  shouldHit(context: StrategyContext): boolean {
    const { myHand } = context;
    const cardCount = myHand.numbers.size;

    // Always draw first 2 cards
    if (cardCount < 2) return true;

    const currentScore = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0);
    const bustProb = calculateBustProbability(context);

    // "Stand on 17" - but adjusted for Flip 7
    if (currentScore >= 18 && cardCount >= 3) return false;

    // Hit on weak hands
    if (currentScore < 13) return true;

    // For medium hands (13-17), consider bust probability
    if (currentScore >= 13 && currentScore < 18) {
      if (bustProb > 0.25) return false;
      if (cardCount >= 4 && bustProb > 0.18) return false;
    }

    // Don't go past 6 cards
    return cardCount < 6;
  }
};

// Expected Value maximizer - makes mathematically optimal decisions
export const expectedValueStrategy: Strategy = {
  name: "Expected Value Maximizer",
  description: "Calculates expected value of each decision, only draws when EV is positive.",

  shouldHit(context: StrategyContext): boolean {
    const { myHand } = context;
    const cardCount = myHand.numbers.size;

    // Always draw first card
    if (cardCount < 1) return true;

    const currentScore = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0);
    const bustProb = calculateBustProbability(context);

    // Calculate EV of staying
    const evStay = currentScore;

    // Calculate EV of hitting (simplified)
    // Average card value we could draw (excluding busts)
    const avgCardValue = 6.5; // Approximate average of 0-12
    const evHit = (1 - bustProb) * (currentScore + avgCardValue);

    // Only hit if expected value is higher
    if (evHit <= evStay) return false;

    // Safety valve - don't be too greedy
    if (bustProb > 0.35) return false;

    return cardCount < 6;
  }
};

// High-risk, high-reward strategy inspired by poker aggression
export const aggressiveStrategy: Strategy = {
  name: "Aggressive (Poker-style)",
  description: "Takes calculated risks for higher scores. Aims for 5+ cards and 30+ points.",

  shouldHit(context: StrategyContext): boolean {
    const { myHand } = context;
    const cardCount = myHand.numbers.size;

    // Always draw first 4 cards
    if (cardCount < 4) return true;

    const currentScore = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0);
    const bustProb = calculateBustProbability(context);

    // Aim for high scores
    if (currentScore < 30 && bustProb < 0.40) return true;

    // Stop if risk is too high
    if (bustProb > 0.45) return false;

    // Go for 6 cards if we're doing well
    return cardCount < 6 && currentScore < 35;
  }
};

// Low-variance strategy - consistent modest scores
export const lowVarianceStrategy: Strategy = {
  name: "Low Variance",
  description: "Minimizes risk, aims for consistent 12-18 point scores with 3-4 cards.",

  shouldHit(context: StrategyContext): boolean {
    const { myHand } = context;
    const cardCount = myHand.numbers.size;

    // Draw exactly 3 cards
    if (cardCount < 3) return true;

    const currentScore = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0);
    const bustProb = calculateBustProbability(context);

    // Very conservative - stop early
    if (currentScore >= 12 && bustProb > 0.15) return false;
    if (currentScore >= 18) return false;

    // Maximum 4 cards
    return cardCount < 4;
  }
};

// Adaptive strategy based on game state
export const contextAwareStrategy: Strategy = {
  name: "Context-Aware Adaptive",
  description: "Adjusts strategy based on deck state, position, and opponents' hands.",

  shouldHit(context: StrategyContext): boolean {
    const { myHand, deckSize, allPlayers, myIndex } = context;
    const cardCount = myHand.numbers.size;

    if (cardCount < 2) return true;

    const deckProportion = deckSize / 94;
    const currentScore = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0);
    const bustProb = calculateBustProbability(context);

    // Look at opponents' visible scores
    const opponentScores = allPlayers
      .filter((_, idx) => idx !== myIndex)
      .map(p => Array.from(p.numbers).reduce((sum: number, n) => sum + n, 0));
    const maxOpponentScore = Math.max(...opponentScores, 0);

    // If opponents are doing well, take more risks
    const needToCompete = currentScore < maxOpponentScore - 5;

    // Early game: be conservative
    if (deckProportion > 0.7) {
      if (cardCount >= 3 && currentScore >= 15) return false;
      if (bustProb > 0.22) return false;
    }

    // Mid game: balanced
    if (deckProportion > 0.3 && deckProportion <= 0.7) {
      if (cardCount >= 4 && currentScore >= 20 && !needToCompete) return false;
      if (bustProb > 0.28) return false;
    }

    // Late game: more aggressive
    if (deckProportion <= 0.3) {
      if (needToCompete && bustProb < 0.40) return true;
      if (bustProb > 0.35) return false;
    }

    return cardCount < 6;
  }
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
