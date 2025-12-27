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

console.log('🎮 FLIP 7 STRATEGY ARENA\n');
console.log(`Running head-to-head matchups between ${strategies.length} strategies`);
console.log(`Total matchups: ${strategies.length * (strategies.length - 1)}\n`);

// Results matrix: [strategyA][strategyB] = win rate of A vs B
const matchupResults: Record<string, Record<string, { wins: number; games: number }>> = {};

strategies.forEach(s => {
  matchupResults[s.name] = {};
});

let matchupCount = 0;
const totalMatchups = strategies.length * (strategies.length - 1);

// Run every strategy against every other strategy
for (let i = 0; i < strategies.length; i++) {
  for (let j = 0; j < strategies.length; j++) {
    if (i === j) continue; // Skip self-matchups

    matchupCount++;
    const stratA = strategies[i];
    const stratB = strategies[j];

    const startTime = Date.now();
    process.stdout.write(`[${matchupCount}/${totalMatchups}] ${stratA.name} vs ${stratB.name}... `);

    const result = runSimulation({
      numGames: 500,
      numPlayers: 2,
      strategies: [stratA, stratB],
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const winRate = ((result.wins[0] / result.config.numGames) * 100).toFixed(1);

    console.log(`${winRate}% (${elapsed}s)`);

    // Store results
    matchupResults[stratA.name][stratB.name] = {
      wins: result.wins[0],
      games: result.config.numGames,
    };
  }
}

// Calculate overall win rates
console.log('\n📊 OVERALL WIN RATES (average across all matchups):\n');

const overallWinRates = strategies.map(strategy => {
  let totalWins = 0;
  let totalGames = 0;

  Object.entries(matchupResults[strategy.name]).forEach(([_, result]) => {
    totalWins += result.wins;
    totalGames += result.games;
  });

  return {
    name: strategy.name,
    winRate: (totalWins / totalGames) * 100,
    totalWins,
    totalGames,
  };
}).sort((a, b) => b.winRate - a.winRate);

overallWinRates.forEach((stat, index) => {
  const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
  console.log(`${medal} ${index + 1}. ${stat.name.padEnd(25)} ${stat.winRate.toFixed(1)}% (${stat.totalWins}/${stat.totalGames})`);
});

// Print matchup matrix
console.log('\n📋 HEAD-TO-HEAD MATRIX (win % of row vs column):\n');

// Print header
process.stdout.write('Strategy'.padEnd(25));
strategies.forEach(s => {
  process.stdout.write(s.name.substring(0, 8).padEnd(10));
});
console.log();
console.log('-'.repeat(25 + strategies.length * 10));

// Print rows
strategies.forEach(stratA => {
  process.stdout.write(stratA.name.padEnd(25));
  strategies.forEach(stratB => {
    if (stratA === stratB) {
      process.stdout.write('  -   '.padEnd(10));
    } else {
      const result = matchupResults[stratA.name][stratB.name];
      const winRate = ((result.wins / result.games) * 100).toFixed(0);
      process.stdout.write(`${winRate}%`.padEnd(10));
    }
  });
  console.log();
});

// Save results to JSON
const output = {
  matchups: matchupResults,
  overallRankings: overallWinRates,
  strategies: strategies.map(s => ({
    name: s.name,
    description: s.description,
  })),
};

writeFileSync('src/data/arena-results.json', JSON.stringify(output, null, 2));
console.log('\n✅ Results saved to src/data/arena-results.json');
