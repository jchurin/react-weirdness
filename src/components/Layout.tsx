import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopBar from './TopBar'

export default function Layout() {
  return (
    <div className="layout">
      <TopBar />
      <Sidebar />
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
