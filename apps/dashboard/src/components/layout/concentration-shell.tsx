import { Outlet } from 'react-router-dom'

/** Full-width concentration mode shell: no sidebar, no topbar. */
export function ConcentrationShell() {
  return (
    <main className="min-h-dvh w-full">
      <Outlet />
    </main>
  )
}
