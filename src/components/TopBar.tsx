import { Link } from 'react-router-dom'
import Logo from './Logo'

interface TopBarProps {
  menuOpen: boolean
  onMenuToggle: () => void
}

export default function TopBar({ menuOpen, onMenuToggle }: TopBarProps) {
  return (
    <header className="topbar">
      <button
        className="menu-btn"
        onClick={onMenuToggle}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="site-nav"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {menuOpen ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </g>
        </svg>
      </button>
      <Link to="/" className="brand">
        <span className="brand-logo">
          <Logo />
        </span>
        <span className="brand-name">
          React <strong>Weirdness</strong>
        </span>
      </Link>
    </header>
  )
}
