import { useState } from 'react'
import type { Roommate } from '../types'
import { api } from '../api'
import { Loader } from './Loader'
import { ConfirmModal } from './ConfirmModal'

interface RoommatesProps {
  roommates: Roommate[]
  onChanged: () => void
}

function MemberAvatar({ name }: { name: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div className="member-avatar" aria-hidden>
      {letter}
    </div>
  )
}

export function Roommates({ roommates, onChanged }: RoommatesProps) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null)

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
      setError(err instanceof Error ? err.message : 'Failed to add member.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id: string, memberName: string) => {
    setPendingDelete({ id, name: memberName })
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    setError('')
    setDeletingId(pendingDelete.id)
    try {
      await api.deleteRoommate(pendingDelete.id)
      setPendingDelete(null)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete member.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <>
      <ConfirmModal
        open={pendingDelete !== null}
        onClose={() => !deletingId && setPendingDelete(null)}
        title="Remove member"
        message={
          pendingDelete
            ? `Remove "${pendingDelete.name}" from members? This cannot be undone.`
            : ''
        }
        confirmLabel="Remove"
        onConfirm={handleDeleteConfirm}
        loading={deletingId !== null}
        variant="danger"
      />
      <section className="section members-card">
        <h2 className="members-heading">Members</h2>
        {roommates.length === 0 ? (
          <p className="members-empty">Add your first member below.</p>
        ) : (
          <ul className="members-list">
            {roommates.map((r) => (
              <li key={r.id} className="members-item">
                <MemberAvatar name={r.name} />
                <span className="members-name">{r.name}</span>
                <button
                  type="button"
                  className="members-delete"
                  onClick={() => handleDeleteClick(r.id, r.name)}
                  disabled={deletingId !== null}
                  title="Remove member"
                  aria-label={`Remove ${r.name}`}
                >
                  {deletingId === r.id ? (
                    <Loader variant="inline" />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                      <line x1="10" y1="11" x2="10" y2="17" />
                      <line x1="14" y1="11" x2="14" y2="17" />
                    </svg>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section members-card">
        <h2 className="members-heading">Add member</h2>
        <form onSubmit={handleAdd}>
          <div className="members-field">
            <label className="members-label" htmlFor="member-name">Name</label>
            <input
              id="member-name"
              type="text"
              className="members-input"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          {error && <p className="members-error">{error}</p>}
          <button type="submit" className="members-submit" disabled={loading || !name.trim()}>
            {loading ? (
              <>
                <Loader variant="inline" />
                <span>Adding…</span>
              </>
            ) : (
              'Add member'
            )}
          </button>
        </form>
      </section>
    </>
  )
}
