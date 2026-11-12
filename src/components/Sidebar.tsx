import { NavLink } from 'react-router-dom'
import { weirdnesses } from '../weirdness/registry'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'nav-link active' : 'nav-link'

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <NavLink to="/" end className={linkClass}>
        Home
      </NavLink>

      <div className="nav-section">Weirdnesses</div>
      {weirdnesses.map((w) => (
        <NavLink key={w.slug} to={`/weirdness/${w.slug}`} className={linkClass}>
          {w.title}
        </NavLink>
      ))}
    </nav>
  )
}
