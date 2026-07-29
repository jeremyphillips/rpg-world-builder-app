import { useIsElevatedPlatformRole } from '@/features/auth'

import { buildGlobalSidebarSections } from './lib/build-global-sidebar-sections'
import { SidebarNavRenderer } from './sidebar-nav-renderer'

/** Global AppShell navigation — no campaign-scoped destinations. */
export function GlobalSidebarNav() {
  const isElevatedPlatformRole = useIsElevatedPlatformRole()
  const sections = buildGlobalSidebarSections({ isElevatedPlatformRole })

  return <SidebarNavRenderer sections={sections} />
}
