import { useState } from 'react'
import type { Roommate } from '../types'
import { api } from '../api'
import { Loader } from './Loader'

interface AddExpenseProps {
  roommates: Roommate[]
  onAdded: () => void
}

const CURRENCY = 'AED'

export function AddExpense({ roommates, onAdded }: AddExpenseProps) {
  const [paidBy, setPaidBy] = useState('')
  const [amount, setAmount] = useState('')
  const [involved, setInvolved] = useState<Set<string>>(new Set())
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toggleInvolved = (id: string) => {
    setInvolved((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const num = parseFloat(amount)
    if (!paidBy || !Number.isFinite(num) || num <= 0) {
      setError('Select who paid and enter a valid amount.')
      return
    }
    if (involved.size === 0) {
      setError('Select at least one person involved.')
      return
    }
    setLoading(true)
    try {
      await api.addExpense({
        paidBy,
        amount: num,
        involved: [...involved],
        note: note.trim() || undefined,
      })
      setAmount('')
      setNote('')
      setInvolved(new Set())
      onAdded()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add expense.')
    } finally {
      setLoading(false)
    }
  }

  if (roommates.length === 0) {
    return (
      <section className="section expense-card">
        <h2 className="expense-heading">Add expense</h2>
        <p className="empty">Add roommates in the Users tab first, then you can add expenses.</p>
      </section>
    )
  }

  return (
    <section className="section expense-card">
      <h2 className="expense-heading">New expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="expense-field">
          <label className="expense-label">Paid by</label>
          <select
            className="expense-select"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            required
          >
            <option value="">Select who paid</option>
            {roommates.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div className="expense-field">
          <label className="expense-label">Amount</label>
          <div className="expense-amount-wrap">
            <span className="expense-currency">{CURRENCY}</span>
            <input
              className="expense-input"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="expense-field">
          <label className="expense-label">Who was involved</label>
          <div className="expense-chips">
            {roommates.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`expense-chip ${involved.has(r.id) ? 'expense-chip--selected' : ''}`}
                onClick={() => toggleInvolved(r.id)}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
        <div className="expense-field">
          <label className="expense-label">Note (optional)</label>
          <input
            className="expense-input"
            type="text"
            placeholder="e.g. Milk, groceries"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        {error && <p className="expense-error">{error}</p>}
        <button type="submit" className="expense-submit" disabled={loading}>
          {loading ? (
            <>
              <Loader variant="inline" />
              <span>Adding…</span>
            </>
          ) : (
            'Add expense'
          )}
        </button>
      </form>
    </section>
  )
}
