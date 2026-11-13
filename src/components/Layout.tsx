import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import { useMediaQuery } from './useMediaQuery'

/** Keep in sync with the breakpoint in index.css */
export const MOBILE_QUERY = '(max-width: 860px)'

export default function Layout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const isMobile = useMediaQuery(MOBILE_QUERY)
  const [navOpen, setNavOpen] = useState(false)
  const closeNav = useCallback(() => setNavOpen(false), [])

  // The page scrolls inside <main>, not the window, so the router can't reset
  // it for us. Layout effect = reset before paint, so no flash at the old spot.
  useLayoutEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  // Close the mobile menu with Escape
  useEffect(() => {
    if (!navOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeNav()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navOpen, closeNav])

  const menuOpen = isMobile && navOpen

  return (
    <div className="layout">
      <TopBar menuOpen={menuOpen} onMenuToggle={() => setNavOpen(!navOpen)} />
      <div className={menuOpen ? 'nav-backdrop open' : 'nav-backdrop'} onClick={closeNav} />
      <Sidebar
        open={menuOpen}
        // On mobile the menu is off-screen when closed: keep it out of tab order
        hidden={isMobile && !navOpen}
        onNavigate={closeNav}
      />
      <main className="content" ref={mainRef}>
        <Outlet />
      </main>
    </div>
  )
}
