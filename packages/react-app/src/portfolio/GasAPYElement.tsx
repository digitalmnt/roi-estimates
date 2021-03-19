import React from 'react';
import { med } from './GasAPY';

interface Profit {
  p365: number,
  p90: number,
  p30: number,
  p14: number,
  p0: number,
}
interface ilPercents {
  il14: number,
  il30: number,
  il90: number,
}

type ElemProps = { content: {
  profit: Profit
  ilPercents: ilPercents,
  fees: number
} };

function formatProfit(data: any) {
  const labels: { [key: string]: any } = {
    p14: 'Profit 2 Weeks',
    p30: 'Profit 1 Month',
    p90: 'Profit 3 Months',
  }

  const { profit, ilPercents, fees } = data
  return [14, 30, 90].map((per) => {
    const prof = profit[`p${per}`]
    const il = ilPercents[`il${per}`]

    const profitMinusExpenses = prof + ((prof * il) - fees)
    return {
      label: `${labels[`p${per}`]}`,
      profit: prof,
      profitMinusExpenses,
    }
  })
}

const GasAPYElement = ({content}: ElemProps) => {
  const formattedResults = formatProfit(content)

  return (
    <div>
      {formattedResults.map((result, i) =>
        <div key={i}>
          <div style={med}>{result.label}: ${result.profit}</div>
          <div style={med}>{result.label} - Expenses: ${result.profitMinusExpenses}</div>
        </div>)}
    </div>
  )
} 

export { GasAPYElement };
