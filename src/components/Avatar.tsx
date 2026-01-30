const REMOVED_LABEL = 'Removed member'

interface AvatarProps {
  /** Display name (use "Removed member" for deleted users) */
  name: string
  size?: 'sm' | 'md'
  className?: string
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const isRemoved = name === REMOVED_LABEL
  const letter = isRemoved ? '?' : name.trim().charAt(0).toUpperCase() || '?'
  return (
    <div
      className={`avatar avatar--${size} ${isRemoved ? 'avatar--removed' : ''} ${className}`.trim()}
      aria-hidden
      title={name}
    >
      {letter}
    </div>
  )
}

export { REMOVED_LABEL }
