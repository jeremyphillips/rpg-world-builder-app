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

export type StaticSidebarSectionId = 'main' | 'tools' | 'admin'

export type SidebarNavItem = {
  id: string
  label: string
  href: string
  end?: boolean
  isActive?: (pathname: string) => boolean
}

export type StaticSidebarNavSection = {
  id: StaticSidebarSectionId
  label: string
  collapsible: false
  items: SidebarNavItem[]
}

export type CollapsibleSidebarNavSection = {
  id: CollapsibleSidebarSectionId
  label: string
  collapsible: true
  items: SidebarNavItem[]
}

export type SidebarNavSection = StaticSidebarNavSection | CollapsibleSidebarNavSection

export function compactSidebarSections<T extends SidebarNavSection>(sections: T[]): T[] {
  return sections.filter((section) => section.items.length > 0)
}
