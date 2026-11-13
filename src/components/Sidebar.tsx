import { NavLink } from 'react-router-dom'
import { weirdnesses } from '../weirdness/registry'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link'

interface SidebarProps {
  /** Mobile only: menu slid in */
  open: boolean
  /** Mobile only: menu slid out, so remove it from tab order / screen readers */
  hidden: boolean
  onNavigate: () => void
}

export default function Sidebar({ open, hidden, onNavigate }: SidebarProps) {
  return (
    <nav id="site-nav" className={open ? 'sidebar open' : 'sidebar'} inert={hidden} aria-label="Main">
      <NavLink to="/" end className={linkClass} onClick={onNavigate}>
        Home
      </NavLink>

      <div className="nav-section">Weirdnesses</div>
      {weirdnesses.map((w, i) => (
        <NavLink key={w.slug} to={`/weirdness/${w.slug}`} className={linkClass} onClick={onNavigate}>
          <span className="nav-num">{i + 1}</span>
          {w.title}
        </NavLink>
      ))}
    </nav>
  )
}
