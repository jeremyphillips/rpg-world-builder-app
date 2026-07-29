export type BenchSidebarSectionId = 'work' | 'settings'

export type BenchSidebarNavItem = {
  id: string
  label: string
  href: string
  end?: boolean
}

export type BenchSidebarNavSection = {
  id: BenchSidebarSectionId
  label: string
  items: BenchSidebarNavItem[]
}
