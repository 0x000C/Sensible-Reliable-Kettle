import { writeFileSync } from 'fs';
import { runSimulation } from '../src/simulation/simulator';
import {
  johnsStrategy,
  perfectMemoryStrategy,
  blackjackStrategy,
  expectedValueStrategy,
  contextAwareStrategy,
  aggressiveStrategy,
} from '../src/strategies';

const strategies = [
  johnsStrategy,
  perfectMemoryStrategy,
  blackjackStrategy,
  expectedValueStrategy,
  contextAwareStrategy,
  aggressiveStrategy,
];

console.log('Starting simulations with 6 advanced strategies...\n');
console.log('This will run 1,000 games for each player count (2-6)');
console.log('Estimated time: 30-60 seconds\n');

const results: Record<number, any> = {};

for (let playerCount = 2; playerCount <= 6; playerCount++) {
  const startTime = Date.now();
  console.log(`[${playerCount}/6] Running ${playerCount} players...`);

  const playerStrategies = strategies.slice(0, playerCount);

  const result = runSimulation({
    numGames: 1000,
    numPlayers: playerCount,
    strategies: playerStrategies,
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`  ✓ Completed in ${elapsed}s`);

  // Convert to JSON-safe format
  results[playerCount] = {
    config: {
      numGames: result.config.numGames,
      numPlayers: result.config.numPlayers,
      strategies: playerStrategies.map(s => ({
        name: s.name,
        description: s.description,
      })),
    },
    wins: result.wins,
    totalPoints: result.totalPoints,
    averagePoints: result.averagePoints,
    flip7Count: result.flip7Count,
    bustRate: result.bustRate,
  };

  // Print results
  console.log(`\n${playerCount} Players Results:`);
  playerStrategies.forEach((strategy, index) => {
    const winRate = ((result.wins[index] / result.config.numGames) * 100).toFixed(1);
    console.log(`  ${strategy.name}: ${winRate}% (${result.wins[index]} wins)`);
  });
  console.log('');
}

// Save to file
const outputPath = 'src/data/precomputed-results.json';
writeFileSync(outputPath, JSON.stringify(results, null, 2));

console.log(`\nSimulations complete! Results saved to ${outputPath}`);
console.log('\nTop Strategy Summary:');

// Find overall best strategy
const strategyTotalWins: Record<string, number> = {};
const strategyGamesPlayed: Record<string, number> = {};

for (const playerCount in results) {
  results[playerCount].config.strategies.forEach((strat: any, idx: number) => {
    if (!strategyTotalWins[strat.name]) {
      strategyTotalWins[strat.name] = 0;
      strategyGamesPlayed[strat.name] = 0;
    }
    strategyTotalWins[strat.name] += results[playerCount].wins[idx];
    strategyGamesPlayed[strat.name] += results[playerCount].config.numGames;
  });
}

const winRates = Object.keys(strategyTotalWins)
  .map(name => ({
    name,
    winRate: (strategyTotalWins[name] / strategyGamesPlayed[name]) * 100,
  }))
  .sort((a, b) => b.winRate - a.winRate);

winRates.forEach((stat, index) => {
  console.log(`${index + 1}. ${stat.name}: ${stat.winRate.toFixed(2)}% average win rate`);
});
