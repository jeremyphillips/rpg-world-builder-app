import { useState } from 'react'
import { Outlet } from 'react-router-dom'

import { useSyncActiveCampaign } from '@/features/campaign'
import { GlobalSearchProvider } from '@/features/global-search'
import { BreadcrumbLabelProvider } from '@/components/layout/breadcrumb/breadcrumb-context'
import { DetailPageHeaderRail } from '@/components/layout/detail-page-header/detail-page-header-rail'
import { PageChromeActionsProvider } from '@/components/layout/page-chrome/page-chrome-actions-provider'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar/topbar'

import { usePathnameScrollReset } from './use-pathname-scroll-reset'

function AppShellBreadcrumbRail() {
  return <DetailPageHeaderRail />
}

/** Authenticated workspace chrome: sidebar + topbar around the routed page. */
export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useSyncActiveCampaign()
  usePathnameScrollReset()

  return (
    <BreadcrumbLabelProvider>
      <PageChromeActionsProvider>
        <GlobalSearchProvider>
          <div className="dash-app-shell">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="dash-app-shell__column">
              <div className="dash-app-shell__chrome" data-app-sticky-chrome>
                <Topbar
                  sidebarOpen={sidebarOpen}
                  onToggleSidebar={() => setSidebarOpen((o) => !o)}
                />
                <AppShellBreadcrumbRail />
              </div>
              <main className="dash-app-shell__main">
                <Outlet />
              </main>
            </div>
          </div>
        </GlobalSearchProvider>
      </PageChromeActionsProvider>
    </BreadcrumbLabelProvider>
  )
}
