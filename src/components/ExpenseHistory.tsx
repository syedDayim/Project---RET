import { useState } from 'react'
import type { Expense, Roommate } from '../types'
import { api } from '../api'
import { Avatar, REMOVED_LABEL } from './Avatar'
import { ConfirmModal } from './ConfirmModal'
import { Loader } from './Loader'

interface ExpenseHistoryProps {
  expenses: Expense[]
  roommates: Roommate[]
  onChanged?: () => void
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ExpenseHistory({ expenses, roommates, onChanged }: ExpenseHistoryProps) {
  const idToName = new Map(roommates.map((r) => [r.id, r.name]))
  const getDisplayName = (id: string) => idToName.get(id) ?? REMOVED_LABEL
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingClearAll, setPendingClearAll] = useState(false)
  const [clearingAll, setClearingAll] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const handleDeleteClick = (expense: Expense) => {
    setPendingDelete(expense)
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    setDeletingId(pendingDelete.id)
    try {
      await api.deleteExpense(pendingDelete.id)
      setPendingDelete(null)
      onChanged?.()
    } finally {
      setDeletingId(null)
    }
  }

  const handleClearAllClick = () => {
    setPendingClearAll(true)
  }

  const handleClearAllConfirm = async () => {
    setClearingAll(true)
    try {
      await api.deleteAllExpenses()
      setPendingClearAll(false)
      onChanged?.()
    } finally {
      setClearingAll(false)
    }
  }

  return (
    <section className="section">
      <ConfirmModal
        open={pendingDelete !== null}
        onClose={() => !deletingId && setPendingDelete(null)}
        title="Delete expense"
        message={
          pendingDelete
            ? `Delete this expense? ${pendingDelete.note ? `"${pendingDelete.note}" – ` : ''}${pendingDelete.amount.toFixed(2)} ${pendingDelete.currency}. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        loading={deletingId !== null}
        variant="danger"
      />
      <ConfirmModal
        open={pendingClearAll}
        onClose={() => !clearingAll && setPendingClearAll(false)}
        title="Clear all expenses"
        message="Delete all expenses from history? This cannot be undone."
        confirmLabel="Clear all"
        onConfirm={handleClearAllConfirm}
        loading={clearingAll}
        variant="danger"
      />
      <div className="expense-history-header">
        <h2 className="expense-history-heading">History</h2>
        {expenses.length > 0 && (
          <button
            type="button"
            className="expense-history-clear-all"
            onClick={handleClearAllClick}
            disabled={clearingAll}
            title="Clear all expenses"
          >
            {clearingAll ? (
              <Loader variant="inline" />
            ) : (
              'Clear all'
            )}
          </button>
        )}
      </div>
      {expenses.length === 0 ? (
        <div className="expense-history-empty">No expenses yet. Add one above.</div>
      ) : (
        <div className="expense-history-scroll">
          <ul className="expense-history-list">
            {expenses.map((e) => {
              const payerName = getDisplayName(e.paidBy)
              return (
                <li key={e.id} className={`expense-history-item ${expandedId === e.id ? 'expense-history-item--expanded' : ''}`}>
                  <div className="expense-history-card">
                    <button
                      type="button"
                      className="expense-history-card-row"
                      onClick={() => toggleExpanded(e.id)}
                      aria-expanded={expandedId === e.id}
                      aria-label={expandedId === e.id ? 'Collapse details' : 'Show details'}
                    >
                      <div className="expense-history-card-left">
                        <Avatar name={payerName} size="md" className="expense-history-avatar" />
                        <div className="expense-history-body">
                          <div className="expense-history-title">
                            <span className="expense-history-name">{payerName}</span>
                            <span className="expense-history-paid">paid</span>
                          </div>
                        </div>
                      </div>
                      <div className="expense-history-card-right">
                        <div className="expense-history-amount-wrap">
                          <span className="expense-history-amount">
                            {e.amount.toFixed(2)} <span className="expense-history-currency">{e.currency}</span>
                          </span>
                        </div>
                        <span className="expense-history-chevron" aria-hidden>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            {expandedId === e.id ? (
                              <polyline points="18 15 12 9 6 15" />
                            ) : (
                              <polyline points="6 9 12 15 18 9" />
                            )}
                          </svg>
                        </span>
                      </div>
                    </button>
                    <button
                      type="button"
                      className="expense-history-delete"
                      onClick={(ev) => {
                        ev.stopPropagation()
                        handleDeleteClick(e)
                      }}
                      disabled={deletingId !== null}
                      title="Delete expense"
                      aria-label={`Delete expense ${e.note || e.amount}`}
                    >
                      {deletingId === e.id ? (
                        <Loader variant="inline" />
                      ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {expandedId === e.id && (
                    <div className="expense-history-invoice">
                      {e.note && (
                        <div className="expense-history-invoice-row">
                          <span className="expense-history-invoice-label">Note</span>
                          <span className="expense-history-invoice-value">{e.note}</span>
                        </div>
                      )}
                      {e.involved.length > 0 && (
                        <div className="expense-history-invoice-row">
                          <span className="expense-history-invoice-label">Shared with</span>
                          <div className="expense-history-invoice-involved">
                            {e.involved.map((id) => (
                              <div key={id} className="expense-history-invoice-involved-item">
                                <Avatar name={getDisplayName(id)} size="sm" className="expense-history-involved-avatar" />
                                <span>{getDisplayName(id)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="expense-history-invoice-row">
                        <span className="expense-history-invoice-label">Date</span>
                        <span className="expense-history-invoice-value">{formatDate(e.createdAt)}</span>
                      </div>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
