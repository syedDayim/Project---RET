interface Room105LogoProps {
  /** Size of the logo (width/height of the icon) */
  size?: number
  /** Show "Room 105" text next to icon */
  showText?: boolean
  /** Optional className for the wrapper */
  className?: string
}

export function Room105Logo({ size = 44, showText = true, className = '' }: Room105LogoProps) {
  return (
    <div className={`room105-logo ${className}`.trim()}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        {/* Door / room outline */}
        <rect
          x="3"
          y="3"
          width="42"
          height="42"
          rx="10"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        {/* Door handle accent */}
        <circle cx="36" cy="24" r="2.5" fill="currentColor" opacity="0.9" />
        {/* Room number */}
        <text
          x="24"
          y="26"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="currentColor"
          style={{
            fontSize: 16,
            fontWeight: 700,
            fontFamily: 'system-ui, -apple-system, sans-serif',
            letterSpacing: '-0.02em',
          }}
        >
          105
        </text>
      </svg>
      {showText && (
        <span className="room105-logo-text">
          Room <strong>105</strong>
        </span>
      )}
    </div>
  )
}
