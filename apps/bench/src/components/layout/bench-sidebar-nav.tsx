import { NavSection } from '@rpg/ui'

import { BenchNavItem } from './bench-nav-item'
import { buildBenchSidebarSections } from './lib/build-bench-sidebar-sections'

export function BenchSidebarNav() {
  const sections = buildBenchSidebarSections()

  return (
    <nav aria-label="Dev Bench" className="flex flex-col overflow-y-auto px-3 pb-6">
      {sections.map((section) => (
        <NavSection key={section.id} label={section.label}>
          {section.items.map((item) => (
            <BenchNavItem key={item.id} item={item} />
          ))}
        </NavSection>
      ))}
    </nav>
  )
}
