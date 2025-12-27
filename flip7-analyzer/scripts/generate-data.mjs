import { writeFileSync } from 'fs';
import { runSimulation } from '../src/simulation/simulator.js';
import {
  johnsStrategy,
  conservativeStrategy,
  greedyStrategy,
  probabilityStrategy,
  balancedStrategy,
  adaptiveStrategy,
} from '../src/strategies/index.js';

const allStrategies = [
  johnsStrategy,
  conservativeStrategy,
  greedyStrategy,
  probabilityStrategy,
  balancedStrategy,
  adaptiveStrategy,
];

// Run simulations for different player counts
const results = {};

for (let playerCount = 2; playerCount <= 6; playerCount++) {
  console.log(`Running simulations for ${playerCount} players...`);

  const strategies = allStrategies.slice(0, playerCount);

  const result = runSimulation({
    numGames: 10000, // Run 10,000 games for better statistical accuracy
    numPlayers: playerCount,
    strategies,
  });

  results[playerCount] = result;
  console.log(`Completed ${playerCount} players`);
}

// Save results to JSON file
writeFileSync(
  'src/data/simulation-results.json',
  JSON.stringify(results, null, 2)
);

console.log('All simulations complete! Results saved to src/data/simulation-results.json');
