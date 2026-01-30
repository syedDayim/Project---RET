interface LoaderProps {
  /** 'page' = centered full-page; 'inline' = small for buttons */
  variant?: 'page' | 'inline'
  /** Optional label below spinner (page only) */
  label?: string
}

export function Loader({ variant = 'page', label }: LoaderProps) {
  return (
    <div className={`loader loader--${variant}`} role="status" aria-label={label ?? 'Loading'}>
      <div className="loader-spinner" />
      {variant === 'page' && (
        <span className="loader-label">{label ?? 'Loading…'}</span>
      )}
    </div>
  )
}
