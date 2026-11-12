import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function TopBar() {
  return (
    <header className="topbar">
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
