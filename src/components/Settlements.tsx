import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import type { Expense, Roommate } from '../types'
import { computeDebts } from '../utils/settlements'
import { REMOVED_LABEL } from './Avatar'

interface SettlementsProps {
  expenses: Expense[]
  roommates: Roommate[]
}

const PIE_COLORS = [
  '#06b6d4', // expense-glow
  '#22d3ee',
  '#0891b2',
  '#0e7490',
  '#155e75',
  '#67e8f9',
]

export function Settlements({ expenses, roommates }: SettlementsProps) {
  const debts = computeDebts(expenses, roommates)
  const idToName = new Map(roommates.map((r) => [r.id, r.name]))
  const getDisplayName = (id: string) => idToName.get(id) ?? REMOVED_LABEL

  // Who spent how much: total paid per person (paidBy)
  const spentByPerson = new Map<string, number>()
  for (const e of expenses) {
    const current = spentByPerson.get(e.paidBy) ?? 0
    spentByPerson.set(e.paidBy, current + e.amount)
  }
  const pieData = Array.from(spentByPerson.entries())
    .filter(([, value]) => value > 0)
    .map(([id, value]) => ({
      name: getDisplayName(id),
      value: Math.round(value * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value)

  const totalSpent = pieData.reduce((sum, d) => sum + d.value, 0)
  const hasSpending = totalSpent > 0

  return (
    <section className="section settlements-section">
      <h2 className="settlements-heading">Who owes whom</h2>
      {hasSpending && (
        <div className="settlements-chart-wrap">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart margin={{ top: 16, right: 16, bottom: 16, left: 16 }}>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
              >
                {pieData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                    stroke="var(--surface)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <ul className="spent-list" aria-label="Who spent how much">
            {pieData.map((d, index) => (
              <li key={d.name} className="spent-item">
                <span
                  className="spent-dot"
                  style={{ background: PIE_COLORS[index % PIE_COLORS.length] }}
                  aria-hidden
                />
                <span className="spent-name">{d.name}</span>
                <span className="spent-amount">{d.value.toFixed(2)} AED</span>
              </li>
            ))}
          </ul>
          <div className="settlements-total">
            Total spent <span className="settlements-total-amount">{totalSpent.toFixed(2)} AED</span>
          </div>
        </div>
      )}
      {debts.length > 0 ? (
        <ul className="debt-list">
          {debts.map((d, i) => (
            <li key={`${d.from}-${d.to}-${i}`} className="debt-item">
              <span>
                {getDisplayName(d.from)} owes {getDisplayName(d.to)}
              </span>
              <span className="debt-amount">{d.amount.toFixed(2)} AED</span>
            </li>
          ))}
        </ul>
      ) : hasSpending ? (
        <p className="empty">No debts. Everyone is settled.</p>
      ) : (
        <p className="empty">Add expenses to see who spent how much and who owes whom.</p>
      )}
    </section>
  )
}
