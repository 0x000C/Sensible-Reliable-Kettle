# Run Arena Simulations on Your Mac

## Quick Start

1. Open Terminal
2. Navigate to this folder:
   ```bash
   cd path/to/Sensible-Reliable-Kettle/flip7-analyzer
   ```

3. Install dependencies (first time only):
   ```bash
   npm install
   ```

4. Run the arena:
   ```bash
   npm run arena
   ```

The simulation will:
- Run 30 head-to-head matchups (500 games each)
- Take approximately 60 minutes total
- Show progress as it runs
- Save results to `src/data/arena-results.json`

## What You'll See

```
🎮 FLIP 7 STRATEGY ARENA

Running head-to-head matchups between 6 strategies
Total matchups: 30

[1/30] John's Current Strategy vs Perfect Memory... 55.6% (0.0s)
[2/30] John's Current Strategy vs Blackjack-Inspired... 62.4% (0.1s)
...

📊 OVERALL WIN RATES:
🥇 1. John's Current Strategy    58.3%
🥈 2. Perfect Memory             52.1%
...

📋 HEAD-TO-HEAD MATRIX:
...
```

## After It Finishes

The results will be saved in:
- **`src/data/arena-results.json`** - Complete results data

Just share that file with me and I'll integrate it into the web app!

## If It's Too Slow

You can reduce the number of games per matchup by editing `scripts/run-arena.ts`:

Change this line:
```typescript
numGames: 500,
```

To:
```typescript
numGames: 100,  // Faster but less accurate
```

Then run `npm run arena` again.
