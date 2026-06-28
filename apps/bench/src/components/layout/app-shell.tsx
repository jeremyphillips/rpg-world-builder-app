import { Outlet } from 'react-router-dom'

import { Sidebar } from './sidebar'

/** Dev Bench workspace chrome: sidebar around routed pages. */
export function AppShell() {
  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
