import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useSyncActiveCampaign } from '@/features/campaign'
import { Sidebar } from './sidebar/index'
import { Topbar } from './topbar'
import { AppBreadcrumb } from './app-breadcrumb'
import { appShellBreadcrumbRailClasses, appShellMainClasses } from './app-shell.variants'
import { BreadcrumbLabelProvider } from './breadcrumb-context'

/** Authenticated workspace chrome: sidebar + topbar around the routed page. */
export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useSyncActiveCampaign()

  return (
    <BreadcrumbLabelProvider>
      <div className="flex min-h-dvh bg-background">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
          <div className={appShellBreadcrumbRailClasses}>
            <AppBreadcrumb />
          </div>
          <main className={appShellMainClasses}>
            <Outlet />
          </main>
        </div>
      </div>
    </BreadcrumbLabelProvider>
  )
}
