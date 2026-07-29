import type { NavItemProps } from '../nav-item'

export type SidebarSectionId =
  | 'main'
  | 'tools'
  | 'admin'
  | 'campaign'
  | 'world'
  | 'gameLibrary'
  | 'manage'

export const COLLAPSIBLE_SIDEBAR_SECTION_IDS = [
  'campaign',
  'world',
  'gameLibrary',
  'manage',
  'admin',
] as const satisfies readonly SidebarSectionId[]

export type CollapsibleSidebarSectionId = (typeof COLLAPSIBLE_SIDEBAR_SECTION_IDS)[number]

export type SidebarNavItem = {
  id: string
  label: string
  href: string
  end?: boolean
  isActive?: NavItemProps['isActive']
}

export type SidebarNavSection = {
  id: SidebarSectionId
  label: string
  collapsible: boolean
  items: SidebarNavItem[]
}

export function compactSidebarSections(sections: SidebarNavSection[]): SidebarNavSection[] {
  return sections.filter((section) => section.items.length > 0)
}
