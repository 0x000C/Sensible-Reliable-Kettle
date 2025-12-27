import { useState } from 'react'
import './App.css'
import {
  johnsStrategy,
  perfectMemoryStrategy,
  blackjackStrategy,
  expectedValueStrategy,
  contextAwareStrategy,
  aggressiveStrategy,
  riskAverseStrategy,
  highValueHunterStrategy,
  deckDepletionStrategy,
  flip7ChaserStrategy,
  cardDistributionStrategy,
} from './strategies'
import arenaResults from './data/arena-results.json'

const allStrategies = [
  johnsStrategy,
  perfectMemoryStrategy,
  blackjackStrategy,
  expectedValueStrategy,
  contextAwareStrategy,
  aggressiveStrategy,
  riskAverseStrategy,
  highValueHunterStrategy,
  deckDepletionStrategy,
  flip7ChaserStrategy,
  cardDistributionStrategy,
]

interface MatchupResult {
  wins: number
  games: number
}

interface Ranking {
  name: string
  winRate: number
  totalWins: number
  totalGames: number
}

function App() {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)

  const rankings = arenaResults.overall_rankings as unknown as Ranking[]
  const matchups = arenaResults.matchups as unknown as Record<string, Record<string, MatchupResult>>

  const getMatchupWinRate = (stratA: string, stratB: string): number | null => {
    if (stratA === stratB) return null
    const result = matchups[stratA]?.[stratB]
    if (!result) return null
    return (result.wins / result.games) * 100
  }

  return (
    <div className="container">
      <header>
        <h1>🎮 Flip 7 Strategy Arena</h1>
        <p>11 strategies • 110 head-to-head matchups • 55,000 simulated games</p>
      </header>

      <section className="arena-summary">
        <h2>🏆 Overall Rankings</h2>
        <p className="subtitle">Based on 5,000 games per strategy (10 opponents × 500 games each)</p>
        <div className="rankings">
          {rankings.map((ranking, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '
            const strategy = allStrategies.find(s => s.name === ranking.name)
            const isJohns = ranking.name === "John's Current Strategy"

            return (
              <div
                key={ranking.name}
                className={`ranking-card ${isJohns ? 'johns-strategy' : ''}`}
                onClick={() => setSelectedStrategy(ranking.name)}
                style={{ cursor: 'pointer' }}
              >
                <div className="ranking-header">
                  <span className="medal">{medal}</span>
                  <span className="rank">#{index + 1}</span>
                  <h3>{ranking.name}</h3>
                </div>
                <div className="ranking-stats">
                  <div className="stat-large">
                    <span className="stat-value">{ranking.winRate.toFixed(1)}%</span>
                    <span className="stat-label">Win Rate</span>
                  </div>
                  <div className="stat-small">
                    <span className="stat-value">{ranking.totalWins}</span>
                    <span className="stat-label">Wins</span>
                  </div>
                  <div className="stat-small">
                    <span className="stat-value">{ranking.totalGames - ranking.totalWins}</span>
                    <span className="stat-label">Losses</span>
                  </div>
                </div>
                {strategy && (
                  <p className="strategy-description">{strategy.description}</p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className="matchup-matrix">
        <h2>⚔️ Head-to-Head Matchup Matrix</h2>
        <p className="subtitle">Win percentage (500 games per matchup)</p>
        <div className="matrix-container">
          <table className="matrix">
            <thead>
              <tr>
                <th className="corner-cell">Strategy ↓ vs →</th>
                {rankings.map(r => (
                  <th key={r.name} className="strategy-header">
                    <div className="vertical-text">{r.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rankings.map(rowStrategy => (
                <tr key={rowStrategy.name}>
                  <td className="row-header">{rowStrategy.name}</td>
                  {rankings.map(colStrategy => {
                    const winRate = getMatchupWinRate(rowStrategy.name, colStrategy.name)
                    if (winRate === null) {
                      return <td key={colStrategy.name} className="matrix-cell self">-</td>
                    }
                    const colorClass = winRate >= 60 ? 'strong-win' :
                                      winRate >= 52 ? 'win' :
                                      winRate >= 48 ? 'even' :
                                      winRate >= 40 ? 'loss' : 'strong-loss'
                    return (
                      <td key={colStrategy.name} className={`matrix-cell ${colorClass}`}>
                        {winRate.toFixed(0)}%
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="legend">
          <span className="legend-item"><span className="legend-box strong-win"></span> 60%+ (Dominant)</span>
          <span className="legend-item"><span className="legend-box win"></span> 52-59% (Advantage)</span>
          <span className="legend-item"><span className="legend-box even"></span> 48-51% (Even)</span>
          <span className="legend-item"><span className="legend-box loss"></span> 40-47% (Disadvantage)</span>
          <span className="legend-item"><span className="legend-box strong-loss"></span> &lt;40% (Dominated)</span>
        </div>
      </section>

      {selectedStrategy && (
        <section className="strategy-details">
          <h2>📊 {selectedStrategy} - Detailed Matchups</h2>
          <button onClick={() => setSelectedStrategy(null)} className="close-btn">✕ Close</button>
          <div className="matchup-details">
            {rankings
              .filter(r => r.name !== selectedStrategy)
              .map(opponent => {
                const winRate = getMatchupWinRate(selectedStrategy, opponent.name)
                const result = matchups[selectedStrategy]?.[opponent.name]
                if (!result) return null

                return (
                  <div key={opponent.name} className="matchup-detail-card">
                    <h4>vs {opponent.name}</h4>
                    <div className="detail-stats">
                      <span className="detail-win-rate">{winRate?.toFixed(1)}%</span>
                      <span className="detail-record">{result.wins}W - {result.games - result.wins}L</span>
                      <span className="detail-games">({result.games} games)</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${winRate}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
          </div>
        </section>
      )}

      <section className="insights">
        <h2>💡 Key Insights</h2>
        <div className="insight-grid">
          <div className="insight-card">
            <h3>🎯 Champion Strategy</h3>
            <p><strong>Expected Value Maximizer</strong> dominates at 58.1%. It calculates whether potential gains outweigh bust risks before every draw.</p>
          </div>
          <div className="insight-card">
            <h3>🎲 Flip 7 Matters</h3>
            <p><strong>Flip 7 Probability Chaser</strong> (2nd, 55.4%) proves that going for Flip 7 when odds are favorable (&gt;40%) is a winning strategy.</p>
          </div>
          <div className="insight-card">
            <h3>📊 High-Value Works</h3>
            <p><strong>High-Value Hunter</strong> (5th, 53.5%) shows that targeting one 10-12 card then stopping is effective.</p>
          </div>
          <div className="insight-card">
            <h3>⚖️ Your Strategy</h3>
            <p><strong>John's Current Strategy</strong> (8th, 51.1%) is middle-of-the-pack. Better than conservative approaches but loses to math-based strategies.</p>
          </div>
          <div className="insight-card">
            <h3>🚫 Too Conservative Fails</h3>
            <p><strong>Risk-Averse Conservative</strong> (11th, 36.2%) proves that playing too safe doesn't score enough points to win.</p>
          </div>
        </div>
      </section>

      <footer>
        <p>Simulated using Rust on 16 cores | Completed in &lt;1 second</p>
      </footer>
    </div>
  )
}

export default App
