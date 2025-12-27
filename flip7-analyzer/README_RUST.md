# Blazingly Fast Rust Arena Simulator

Your M3 Max will love this! 🚀

## Build & Run (One Command)

```bash
cargo run --release --bin arena
```

That's it! The `--release` flag enables optimizations for maximum speed.

## What It Does

- Runs all 30 matchups (6 strategies × 5 opponents each)
- Each matchup = 500 games
- **Parallelized across all 16 cores** of your M3 Max
- Outputs results to `src/data/arena-results.json`

## Expected Performance

On your M3 Max with 16 cores:
- **Total time: ~30-60 seconds** (vs 60+ minutes in JavaScript!)
- Each matchup: ~1-2 seconds
- Uses all your performance cores efficiently

## Output

You'll see real-time progress:
```
🎮 FLIP 7 STRATEGY ARENA (Rust Edition)

Running on 16 cores
Total matchups: 30

[1/30] John's Current Strategy vs Perfect Memory ... 55.6% (0.81s)
[2/30] John's Current Strategy vs Blackjack-Inspired ... 62.4% (0.79s)
...

📊 OVERALL WIN RATES:
🥇 1. John's Current Strategy    58.3%
...

✅ Results saved to src/data/arena-results.json
```

## Share Results

Just paste the contents of `src/data/arena-results.json` back to me!

## Notes

- First build will download dependencies (~30 seconds)
- Subsequent runs are instant
- The code is optimized for your Apple Silicon architecture
- Uses rayon for embarrassingly parallel execution across cores
