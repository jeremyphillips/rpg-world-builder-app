import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useSyncActiveCampaign } from '@/features/campaign'
import { Sidebar } from './sidebar/index'
import { Topbar } from './topbar'
import { AppBreadcrumb } from './app-breadcrumb'
import { BreadcrumbLabelProvider } from './breadcrumb-context'

/** Authenticated workspace chrome: sidebar + topbar around the routed page. */
export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useSyncActiveCampaign()

  return (
    <BreadcrumbLabelProvider>
      <div className="flex min-h-dvh">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
          <div className="border-b border-border px-6 py-3">
            <AppBreadcrumb />
          </div>
          <main className="flex-1 px-6 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </BreadcrumbLabelProvider>
  )
}
