import type { SidebarNavItem, SidebarNavSection } from './sidebar-nav-model'
import { matchSidebarNavHref } from './match-sidebar-nav-href'

export { matchSidebarNavHref }

export function sectionHasActiveItem(pathname: string, section: SidebarNavSection): boolean {
  return section.items.some((item) => matchSidebarNavHref(pathname, item))
}

export type { SidebarNavItem }
