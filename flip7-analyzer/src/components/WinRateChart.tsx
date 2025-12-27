import type { SimulationResult } from '../simulation/simulator'

interface Props {
  results: SimulationResult
}

export function WinRateChart({ results }: Props) {
  const maxWins = Math.max(...results.wins)

  return (
    <div className="chart-container">
      <h3>Win Rate Comparison</h3>
      <div className="bar-chart">
        {results.config.strategies.map((strategy, index) => {
          const winRate = (results.wins[index] / results.config.numGames) * 100
          const barWidth = (results.wins[index] / maxWins) * 100

          return (
            <div key={index} className="bar-row">
              <div className="bar-label">{strategy.name}</div>
              <div className="bar-container">
                <div
                  className="bar"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: getBarColor(index),
                  }}
                >
                  <span className="bar-value">{winRate.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function getBarColor(index: number): string {
  const colors = [
    '#007bff', // blue
    '#28a745', // green
    '#dc3545', // red
    '#ffc107', // yellow
    '#17a2b8', // cyan
    '#6f42c1', // purple
  ]
  return colors[index % colors.length]
}
