import { useState, useEffect } from 'react'
import './App.css'
import { runSimulation } from './simulation/simulator'
import type { SimulationResult } from './simulation/simulator'
import {
  johnsStrategy,
  conservativeStrategy,
  greedyStrategy,
  probabilityStrategy,
  balancedStrategy,
  adaptiveStrategy,
} from './strategies'
import { StrategyInsights } from './components/StrategyInsights'
import { WinRateChart } from './components/WinRateChart'

function App() {
  const [results, setResults] = useState<SimulationResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [playerCount, setPlayerCount] = useState(3)

  useEffect(() => {
    runSimulations()
  }, [playerCount])

  const runSimulations = () => {
    setLoading(true)

    // Run simulations in a timeout to allow UI to update
    setTimeout(() => {
      const strategies = [
        johnsStrategy,
        conservativeStrategy,
        greedyStrategy,
        probabilityStrategy,
        balancedStrategy,
        adaptiveStrategy,
      ].slice(0, playerCount)

      const result = runSimulation({
        numGames: 1000,
        numPlayers: playerCount,
        strategies,
      })

      setResults(result)
      setLoading(false)
    }, 100)
  }

  if (loading || !results) {
    return (
      <div className="container">
        <h1>Flip 7 Strategy Analyzer</h1>
        <p>Running simulations...</p>
      </div>
    )
  }

  const winPercentages = results.wins.map((w) => ((w / results.config.numGames) * 100).toFixed(1))

  return (
    <div className="container">
      <header>
        <h1>Flip 7 Strategy Analyzer</h1>
        <p>Discovering optimal strategies through simulation</p>
      </header>

      <section className="controls">
        <label>
          Number of Players:
          <select value={playerCount} onChange={(e) => setPlayerCount(Number(e.target.value))}>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5</option>
            <option value={6}>6</option>
          </select>
        </label>
        <button onClick={runSimulations}>Re-run Simulation</button>
        <p className="simulation-info">
          Ran {results.config.numGames.toLocaleString()} games with {playerCount} players
        </p>
      </section>

      <StrategyInsights results={results} />

      <section className="visualization">
        <WinRateChart results={results} />
      </section>

      <section className="all-strategies">
        <h2>All Strategies Tested</h2>
        <div className="strategy-grid">
          {results.config.strategies.map((strategy, index) => (
            <div key={index} className="strategy-card">
              <h3>{strategy.name}</h3>
              <p className="description">{strategy.description}</p>
              <div className="stats">
                <div className="stat">
                  <span className="stat-label">Win Rate</span>
                  <span className="stat-value">{winPercentages[index]}%</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Avg Points/Game</span>
                  <span className="stat-value">{results.averagePoints[index].toFixed(1)}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Total Wins</span>
                  <span className="stat-value">{results.wins[index]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="details">
        <h2>Detailed Results</h2>
        <table>
          <thead>
            <tr>
              <th>Strategy</th>
              <th>Wins</th>
              <th>Win %</th>
              <th>Avg Points</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            {results.config.strategies.map((strategy, index) => (
              <tr key={index}>
                <td>{strategy.name}</td>
                <td>{results.wins[index]}</td>
                <td>{winPercentages[index]}%</td>
                <td>{results.averagePoints[index].toFixed(1)}</td>
                <td>{results.totalPoints[index].toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export default App
