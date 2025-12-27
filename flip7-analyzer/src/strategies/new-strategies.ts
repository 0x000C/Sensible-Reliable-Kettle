import type { Strategy, StrategyContext } from './types'

function calculateBustProb(hand: Set<number>, deckSize: number): number {
  if (deckSize === 0) return 1

  let bustCards = 0
  for (const num of hand) {
    const initialCount = num === 0 ? 1 : num
    const estimated = initialCount * (deckSize / 94)
    bustCards += estimated
  }

  return Math.min(bustCards / deckSize, 1)
}

export const riskAverseStrategy: Strategy = {
  name: "Risk-Averse Conservative",
  description: "Stops at 3-4 cards with 12+ points, never exceeds 15% bust risk",

  shouldHit(context: StrategyContext): boolean {
    const { myHand, deckSize } = context
    const cardCount = myHand.numbers.size
    const score = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0)
    const bustProb = calculateBustProb(myHand.numbers, deckSize)

    // Never exceed 15% bust probability
    if (bustProb > 0.15) return false

    // Stop early if we have decent points
    if (cardCount >= 3 && score >= 12) return false
    if (cardCount >= 4) return false

    return cardCount < 5
  }
}

export const highValueHunterStrategy: Strategy = {
  name: "High-Value Hunter",
  description: "Aggressively pursues 10-12 cards, stops after getting one",

  shouldHit(context: StrategyContext): boolean {
    const { myHand, deckSize } = context
    const cardCount = myHand.numbers.size
    const hasHigh = Array.from(myHand.numbers).some(n => n >= 10)
    const bustProb = calculateBustProb(myHand.numbers, deckSize)

    // If we got a high card, be conservative
    if (hasHigh) {
      if (cardCount >= 3) return false
      if (bustProb > 0.20) return false
    }

    // Otherwise, aggressively seek high cards
    if (bustProb > 0.35) return false
    return cardCount < 5
  }
}

export const deckDepletionStrategy: Strategy = {
  name: "Deck Depletion Specialist",
  description: "Adjusts risk based on remaining deck size",

  shouldHit(context: StrategyContext): boolean {
    const { myHand, deckSize } = context
    const cardCount = myHand.numbers.size
    const score = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0)
    const bustProb = calculateBustProb(myHand.numbers, deckSize)
    const deckProportion = deckSize / 94

    if (deckProportion > 0.75) {
      // Early game: very conservative
      if (cardCount >= 3 && score >= 15) return false
      if (bustProb > 0.18) return false
    } else if (deckProportion > 0.40) {
      // Mid game: balanced
      if (cardCount >= 4 && score >= 20) return false
      if (bustProb > 0.25) return false
    } else {
      // Late game: aggressive (fewer duplicates likely)
      if (bustProb > 0.35) return false
    }

    return cardCount < 6
  }
}

export const flip7ChaserStrategy: Strategy = {
  name: "Flip 7 Probability Chaser",
  description: "Calculates Flip 7 odds, only pursues when >40% probable",

  shouldHit(context: StrategyContext): boolean {
    const { myHand, deckSize } = context
    const cardCount = myHand.numbers.size
    const bustProb = calculateBustProb(myHand.numbers, deckSize)

    if (cardCount < 3) return true

    // Calculate probability of getting Flip 7
    const cardsNeeded = 7 - cardCount
    if (cardsNeeded <= 0) return false

    // Rough estimate: probability all remaining draws are unique
    const flip7Prob = deckSize > 0
      ? Math.pow((13 - cardCount) / deckSize, cardsNeeded)
      : 0

    // If Flip 7 is reasonably likely (>40%), go for it
    if (flip7Prob > 0.40 && bustProb < 0.30) {
      return cardCount < 7
    }

    // Otherwise play conservatively
    const score = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0)
    if (score >= 18 && bustProb > 0.20) return false

    return cardCount < 5
  }
}

export const cardDistributionStrategy: Strategy = {
  name: "Card Distribution Expert",
  description: "Tracks full card distribution for precise probabilities",

  shouldHit(context: StrategyContext): boolean {
    const { myHand, deckSize } = context
    const cardCount = myHand.numbers.size
    if (cardCount < 2) return true

    // Calculate exact remaining distribution
    const remaining = new Array(13).fill(0).map((_, i) => i === 0 ? 1 : i)

    // Subtract our hand
    for (const num of myHand.numbers) {
      remaining[num] -= 1
    }

    // Calculate safe cards (won't bust)
    const safeCards = remaining.reduce((sum, count, i) => {
      if (!myHand.numbers.has(i as any)) {
        return sum + Math.max(0, count)
      }
      return sum
    }, 0)

    const totalRemaining = deckSize - 22 // Approximate (subtract modifiers/actions)
    const bustProb = totalRemaining > 0
      ? 1 - (safeCards / totalRemaining)
      : 1

    const score = Array.from(myHand.numbers).reduce((sum: number, n) => sum + n, 0)

    // Use precise probabilities for decisions
    if (bustProb > 0.25) return false
    if (cardCount >= 4 && score >= 20 && bustProb > 0.18) return false
    if (cardCount >= 5 && bustProb > 0.12) return false

    return cardCount < 6
  }
}
