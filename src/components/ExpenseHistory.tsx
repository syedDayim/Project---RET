import type { Expense, Roommate } from '../types'

interface ExpenseHistoryProps {
  expenses: Expense[]
  roommates: Roommate[]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ExpenseHistory({ expenses, roommates }: ExpenseHistoryProps) {
  const idToName = new Map(roommates.map((r) => [r.id, r.name]))

  return (
    <section className="section">
      <h2 className="section-title">Expense history</h2>
      {expenses.length === 0 ? (
        <p className="empty">No expenses yet. Add one above.</p>
      ) : (
        <ul className="expense-list">
          {expenses.map((e) => (
            <li key={e.id} className="expense-item">
              <span>
                <strong>{idToName.get(e.paidBy) ?? e.paidBy}</strong> paid{' '}
                {e.amount.toFixed(2)} {e.currency}
                {e.involved.length > 0 && (
                  <> · shared with {e.involved.map((id) => idToName.get(id) ?? id).join(', ')}</>
                )}
                {e.note && <> · {e.note}</>}
                <br />
                <small style={{ color: 'var(--muted)' }}>{formatDate(e.createdAt)}</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
