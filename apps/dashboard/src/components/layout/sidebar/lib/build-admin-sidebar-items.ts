import { ROUTES } from '@/app/routes'

import { sidebarNavItem } from './sidebar-nav-icons'
import type { SidebarNavItem } from './sidebar-nav-model'

/** Shared admin destinations for global and campaign workspace sidebars. */
export function buildAdminSidebarItems(): SidebarNavItem[] {
  return [
    sidebarNavItem({ id: 'admin-users', label: 'Users', href: ROUTES.admin.users }),
    sidebarNavItem({ id: 'admin-settings', label: 'Admin Settings', href: ROUTES.admin.settings }),
  ]
}
