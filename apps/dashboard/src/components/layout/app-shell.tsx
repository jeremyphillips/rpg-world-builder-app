import { Outlet } from 'react-router-dom'

import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

/** Authenticated workspace chrome: sidebar + topbar around the routed page. */
export function AppShell() {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
