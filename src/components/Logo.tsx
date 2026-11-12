export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="3">
        <ellipse cx="32" cy="32" rx="28" ry="10.5" />
        <ellipse cx="32" cy="32" rx="28" ry="10.5" transform="rotate(60 32 32)" />
        {/* the "weird" orbit: deliberately knocked off-centre */}
        <ellipse
          cx="32"
          cy="32"
          rx="28"
          ry="10.5"
          transform="rotate(-60 32 32) translate(0 6)"
        />
      </g>
      <circle cx="35" cy="29" r="5" fill="var(--accent-2)" />
    </svg>
  )
}
