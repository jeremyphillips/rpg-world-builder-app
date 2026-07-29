import { NavSection } from '@rpg/ui'

import { useIsElevatedPlatformRole } from '@/features/auth'

import { buildGlobalSidebarSections } from './lib/build-global-sidebar-sections'
import type { StaticSidebarNavSection } from './lib/sidebar-nav-model'
import { NavItem } from './nav-item'

function StaticSidebarSection({ section }: { section: StaticSidebarNavSection }) {
  return (
    <NavSection label={section.label}>
      {section.items.map((item) => (
        <NavItem
          key={item.id}
          to={item.href}
          label={item.label}
          end={item.end}
          isActive={item.isActive}
        />
      ))}
    </NavSection>
  )
}

/** Global AppShell navigation — no campaign-scoped destinations. */
export function GlobalSidebarNav() {
  const isElevatedPlatformRole = useIsElevatedPlatformRole()
  const sections = buildGlobalSidebarSections({ isElevatedPlatformRole })

  return (
    <>
      {sections.map((section) => (
        <StaticSidebarSection key={section.id} section={section} />
      ))}
    </>
  )
}
