import React from 'react'
import type { SimulationResult } from '../simulation/simulator'

interface Props {
  results: SimulationResult
}

export function StrategyInsights({ results }: Props) {
  // Find the best performing strategy
  const winRates = results.wins.map((w, i) => ({
    index: i,
    name: results.config.strategies[i].name,
    winRate: (w / results.config.numGames) * 100,
    avgPoints: results.averagePoints[i],
  }))

  const sorted = [...winRates].sort((a, b) => b.winRate - a.winRate)
  const best = sorted[0]
  const worst = sorted[sorted.length - 1]

  // Calculate some interesting stats
  const avgWinRate = winRates.reduce((sum, s) => sum + s.winRate, 0) / winRates.length
  const winRateSpread = best.winRate - worst.winRate

  return (
    <div className="insights">
      <h2>Key Findings</h2>
      <div className="insight-cards">
        <div className="insight-card highlight">
          <h3>🏆 Best Strategy</h3>
          <p className="strategy-name">{best.name}</p>
          <p className="stat-large">{best.winRate.toFixed(1)}% win rate</p>
          <p className="detail">
            Wins {((best.winRate / avgWinRate - 1) * 100).toFixed(0)}% more often than average
          </p>
        </div>

        <div className="insight-card">
          <h3>📊 Performance Gap</h3>
          <p className="stat-large">{winRateSpread.toFixed(1)}%</p>
          <p className="detail">
            Difference between best and worst strategy
          </p>
          <p className="detail">
            {winRateSpread > 10
              ? 'Strategy choice matters significantly'
              : 'Most strategies perform similarly'}
          </p>
        </div>

        <div className="insight-card">
          <h3>💡 What This Means</h3>
          <div className="heuristics">
            {generateHeuristics(best, worst)}
          </div>
        </div>
      </div>
    </div>
  )
}

function generateHeuristics(
  best: { name: string; winRate: number; avgPoints: number },
  worst: { name: string; winRate: number; avgPoints: number }
): React.ReactElement {
  const heuristics: string[] = []

  // Analyze what makes the best strategy work
  if (best.name.includes('Conservative')) {
    heuristics.push('Playing it safe with 3 solid cards beats going for broke')
    heuristics.push('Aim for 15+ points with 3-5 cards, then stop')
  } else if (best.name.includes('Balanced')) {
    heuristics.push('Drawing 4 cards gives a good risk/reward balance')
    heuristics.push('Stop when you hit 20+ points or bust risk exceeds 30%')
  } else if (best.name.includes('Probability')) {
    heuristics.push('Math matters: stop when bust probability exceeds 25%')
    heuristics.push('Track visible cards to estimate your odds')
  } else if (best.name.includes('Adaptive')) {
    heuristics.push('Adjust your strategy based on how much deck remains')
    heuristics.push('Play conservative early, more aggressive late')
  } else if (best.name.includes('John')) {
    heuristics.push('Your current strategy is already optimized!')
    heuristics.push('Drawing 3 then evaluating is working well')
  }

  // Warn about what doesn't work
  if (worst.name.includes('Greedy')) {
    heuristics.push("⚠️ Don't always go for Flip 7 - the 15-point bonus isn't worth the bust risk")
  }

  return (
    <>
      {heuristics.map((h, i) => (
        <p key={i} className="heuristic">
          • {h}
        </p>
      ))}
    </>
  )
}
