import { useState } from 'react'
import type { Roommate } from '../types'
import { api } from '../api'

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
      <section className="section">
        <h2 className="section-title">Add expense</h2>
        <p className="empty">Add roommates below first, then you can add expenses.</p>
      </section>
    )
  }

  return (
    <section className="section">
      <h2 className="section-title">Add expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <label>Paid by</label>
          <select
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
        <div className="form-row">
          <label>Amount ({CURRENCY})</label>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label>Who was involved (multi-select)</label>
          <div className="chips">
            {roommates.map((r) => (
              <button
                key={r.id}
                type="button"
                className={`chip ${involved.has(r.id) ? 'selected' : ''}`}
                onClick={() => toggleInvolved(r.id)}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
        <div className="form-row">
          <label>Note (optional)</label>
          <input
            type="text"
            placeholder="e.g. Milk, groceries"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="form-row" style={{ marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding…' : 'Add expense'}
          </button>
        </div>
      </form>
    </section>
  )
}
