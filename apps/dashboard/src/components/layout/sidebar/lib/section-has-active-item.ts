import type { SidebarNavItem, SidebarNavSection } from './sidebar-nav-model'

/** Mirrors NavLink matching: custom override, exact match when `end`, otherwise prefix. */
export function isSidebarNavItemActive(pathname: string, item: SidebarNavItem): boolean {
  if (item.isActive) {
    return item.isActive(pathname)
  }

  if (item.end) {
    return pathname === item.href
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`)
}

export function sectionHasActiveItem(pathname: string, section: SidebarNavSection): boolean {
  return section.items.some((item) => isSidebarNavItemActive(pathname, item))
}
