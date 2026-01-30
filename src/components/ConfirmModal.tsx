import { useEffect } from 'react'
import { Loader } from './Loader'

interface ConfirmModalProps {
  open: boolean
  onClose: () => void
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  loading?: boolean
  /** 'danger' = red confirm button (e.g. delete); default = primary */
  variant?: 'default' | 'danger'
}

export function ConfirmModal({
  open,
  onClose,
  title,
  message,
  confirmLabel,
  onConfirm,
  loading = false,
  variant = 'default',
}: ConfirmModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !loading) onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, loading, onClose])

  if (!open) return null

  return (
    <div
      className="confirm-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
    >
      <div className="confirm-modal-content">
        <h3 id="confirm-modal-title" className="confirm-modal-title">
          {title}
        </h3>
        <p id="confirm-modal-message" className="confirm-modal-message">
          {message}
        </p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-cancel"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`confirm-modal-confirm confirm-modal-confirm--${variant}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader variant="inline" />
                <span>Removing…</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
