import type { SidebarNavItem } from './sidebar-nav-model'

/** Mirrors NavLink matching: custom override, exact match when `end`, otherwise prefix. */
export function matchSidebarNavHref(pathname: string, item: SidebarNavItem): boolean {
  if (item.isActive) {
    return item.isActive(pathname)
  }

  if (item.end) {
    return pathname === item.href
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}
