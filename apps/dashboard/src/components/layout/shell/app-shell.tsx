import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useSyncActiveCampaign } from '@/features/campaign'
import { GlobalSearchProvider } from '@/features/global-search'
import { AppBreadcrumb } from '@/components/layout/breadcrumb/app-breadcrumb'
import { BreadcrumbLabelProvider } from '@/components/layout/breadcrumb/breadcrumb-context'
import { useResolvedBreadcrumbs } from '@/components/layout/breadcrumb/use-resolved-breadcrumbs'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar/topbar'

import { appShellBreadcrumbRailClasses, appShellMainClasses } from './app-shell.variants'

function AppShellBreadcrumbRail() {
  const crumbs = useResolvedBreadcrumbs()

  if (crumbs.length === 0) {
    return null
  }

  return (
    <div className={appShellBreadcrumbRailClasses}>
      <AppBreadcrumb crumbs={crumbs} />
    </div>
  )
}

/** Authenticated workspace chrome: sidebar + topbar around the routed page. */
export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useSyncActiveCampaign()

  return (
    <BreadcrumbLabelProvider>
      <GlobalSearchProvider>
        <div className="flex min-h-dvh bg-background">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
            <Topbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((o) => !o)} />
            <AppShellBreadcrumbRail />
            <main className={appShellMainClasses}>
              <Outlet />
            </main>
          </div>
        </div>
      </GlobalSearchProvider>
    </BreadcrumbLabelProvider>
  )
}
