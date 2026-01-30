import { useState } from 'react'
import type { Roommate } from '../types'
import { api } from '../api'

interface RoommatesProps {
  roommates: Roommate[]
  onChanged: () => void
}

export function Roommates({ roommates, onChanged }: RoommatesProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const trimmed = name.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      await api.addRoommate(trimmed)
      setName('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add roommate.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="section">
      <h2 className="section-title">Roommates</h2>
      <ul className="roommate-list">
        {roommates.map((r) => (
          <li key={r.id}>{r.name}</li>
        ))}
      </ul>
      {roommates.length === 0 && (
        <p className="empty">Add your first roommate below.</p>
      )}
      <form onSubmit={handleAdd} className="add-roommate-row">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn btn-ghost" disabled={loading || !name.trim()}>
          {loading ? 'Adding…' : 'Add'}
        </button>
      </form>
      {error && <p className="error-msg">{error}</p>}
    </section>
  )
}
