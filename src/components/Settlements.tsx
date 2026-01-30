import type { Expense, Roommate } from '../types'
import { computeDebts } from '../utils/settlements'

interface SettlementsProps {
  expenses: Expense[]
  roommates: Roommate[]
}

export function Settlements({ expenses, roommates }: SettlementsProps) {
  const debts = computeDebts(expenses, roommates)
  const idToName = new Map(roommates.map((r) => [r.id, r.name]))

  return (
    <section className="section">
      <h2 className="section-title">Who owes whom</h2>
      {debts.length === 0 ? (
        <p className="empty">No debts. Everyone is settled.</p>
      ) : (
        <ul className="debt-list">
          {debts.map((d, i) => (
            <li key={`${d.from}-${d.to}-${i}`} className="debt-item">
              <span>
                {idToName.get(d.from) ?? d.from} owes{' '}
                {idToName.get(d.to) ?? d.to}
              </span>
              <span className="debt-amount">{d.amount.toFixed(2)} AED</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
