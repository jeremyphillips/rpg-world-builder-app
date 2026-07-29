import { ROUTES } from '@/app/routes'

import type { SidebarNavItem } from './sidebar-nav-model'

/** Shared admin destinations for global and campaign workspace sidebars. */
export function buildAdminSidebarItems(): SidebarNavItem[] {
  return [
    { id: 'admin-users', label: 'Users', href: ROUTES.admin.users },
    { id: 'admin-settings', label: 'Admin Settings', href: ROUTES.admin.settings },
  ]
}
