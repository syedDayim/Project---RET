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
      <h2 className="expense-history-heading">History</h2>
      {expenses.length === 0 ? (
        <div className="expense-history-empty">No expenses yet. Add one above.</div>
      ) : (
        <div className="expense-history-scroll">
          <ul className="expense-history-list">
            {expenses.map((e) => (
            <li key={e.id} className="expense-history-item">
              <div className="expense-history-main">
                <div className="expense-history-who">
                  {idToName.get(e.paidBy) ?? e.paidBy} paid{e.note ? ` · ${e.note}` : ''}
                </div>
                <div className="expense-history-meta">
                  {e.involved.length > 0 && (
                    <>Shared with {e.involved.map((id) => idToName.get(id) ?? id).join(', ')}</>
                  )}
                  {e.involved.length > 0 ? ' · ' : ''}
                  {formatDate(e.createdAt)}
                </div>
              </div>
              <div className="expense-history-amount">
                {e.amount.toFixed(2)} {e.currency}
              </div>
            </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
