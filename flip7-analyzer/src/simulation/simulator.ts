import type { GameState, RoundResult, GameResult } from '../game/types';
import type { Strategy, StrategyContext } from '../strategies/types';
import { initializeGame, dealInitialCard, drawCard, calculateScore, getActivePlayers, stayPlayer, isPlayerActive } from '../game/game';

export interface SimulationConfig {
  numGames: number;
  numPlayers: number;
  strategies: Strategy[];
}

export interface SimulationResult {
  config: SimulationConfig;
  wins: number[]; // Count of wins for each strategy
  totalPoints: number[]; // Total points across all games
  averagePoints: number[]; // Average points per game
  flip7Count: number[]; // How many times each strategy achieved Flip 7
  bustRate: number[]; // Percentage of rounds that ended in bust
}

export function runSimulation(config: SimulationConfig): SimulationResult {
  const { numGames, numPlayers, strategies } = config;

  if (strategies.length !== numPlayers) {
    throw new Error('Number of strategies must match number of players');
  }

  const wins = Array(numPlayers).fill(0);
  const totalPoints = Array(numPlayers).fill(0);
  const flip7Count = Array(numPlayers).fill(0);
  const bustCount = Array(numPlayers).fill(0);
  const totalRounds = Array(numPlayers).fill(0);

  for (let game = 0; game < numGames; game++) {
    const result = playGame(numPlayers, strategies);

    wins[result.winner]++;

    result.finalScores.forEach((score, index) => {
      totalPoints[index] += score;
    });

    // Track busts and Flip 7s (would need to modify playGame to return this data)
  }

  const averagePoints = totalPoints.map(total => total / numGames);
  const bustRate = bustCount.map((busts, index) =>
    totalRounds[index] > 0 ? busts / totalRounds[index] : 0
  );

  return {
    config,
    wins,
    totalPoints,
    averagePoints,
    flip7Count,
    bustRate,
  };
}

function playGame(numPlayers: number, strategies: Strategy[]): GameResult {
  const state = initializeGame(numPlayers);
  let gameOver = false;

  while (!gameOver) {
    const roundResult = playRound(state, strategies);

    // Update scores
    roundResult.scores.forEach((score, index) => {
      state.scores[index] += score;
    });

    // Check if anyone has reached 200 points
    if (state.scores.some(score => score >= 200)) {
      gameOver = true;
    }

    state.roundNumber++;
  }

  // Find winner (highest score)
  let winner = 0;
  let highScore = state.scores[0];
  for (let i = 1; i < state.scores.length; i++) {
    if (state.scores[i] > highScore) {
      highScore = state.scores[i];
      winner = i;
    }
  }

  return {
    finalScores: state.scores,
    winner,
    rounds: state.roundNumber,
  };
}

function playRound(state: GameState, strategies: Strategy[]): RoundResult {
  // Reset player states for new round
  state.players.forEach(player => {
    player.numbers.clear();
    player.modifiers = [];
    player.hasSecondChance = false;
    player.isFrozen = false;
    player.busted = false;
    player.stayed = false;
  });

  // Deal initial cards
  for (let i = 0; i < state.players.length; i++) {
    dealInitialCard(state, i);
  }

  let roundOver = false;
  let flip7Achieved = false;
  let flip7Player: number | null = null;

  // Play round
  while (!roundOver) {
    const activePlayers = getActivePlayers(state);

    if (activePlayers.length === 0) {
      roundOver = true;
      break;
    }

    // Each active player takes their turn
    for (const playerIndex of activePlayers) {
      if (!isPlayerActive(state.players[playerIndex])) {
        continue;
      }

      const strategy = strategies[playerIndex];
      const context: StrategyContext = {
        myHand: state.players[playerIndex],
        myIndex: playerIndex,
        gameState: state,
        allPlayers: state.players,
        deckSize: state.deck.length,
      };

      // Decide whether to hit
      const shouldHit = strategy.shouldHit(context);

      if (!shouldHit) {
        stayPlayer(state, playerIndex);
        continue;
      }

      // Draw a card
      const { busted, flip7 } = drawCard(state, playerIndex);

      if (busted) {
        // Player busted, they're out
        continue;
      }

      if (flip7) {
        // Round ends immediately
        flip7Achieved = true;
        flip7Player = playerIndex;
        roundOver = true;
        break;
      }

      // Check if deck is empty
      if (state.deck.length === 0) {
        roundOver = true;
        break;
      }
    }
  }

  // Calculate scores
  const scores = state.players.map((player, index) => {
    const isFlip7Winner = flip7Achieved && flip7Player === index;
    return calculateScore(player, isFlip7Winner);
  });

  return {
    scores,
    winner: flip7Player,
    flip7Achieved,
  };
}
