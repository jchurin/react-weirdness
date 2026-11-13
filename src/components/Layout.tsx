import { useLayoutEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)

  // The page scrolls inside <main>, not the window, so the router can't reset
  // it for us. Layout effect = reset before paint, so no flash at the old spot.
  useLayoutEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <div className="layout">
      <TopBar />
      <Sidebar />
      <main className="content" ref={mainRef}>
        <Outlet />
      </main>
    </div>
  )
}
