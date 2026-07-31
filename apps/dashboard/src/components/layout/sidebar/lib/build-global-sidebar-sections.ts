import { ROUTES } from '@/app/routes'

import { buildAdminSidebarItems } from './build-admin-sidebar-items'
import { sidebarNavItem } from './sidebar-nav-icons'
import { compactSidebarSections, type StaticSidebarNavSection } from './sidebar-nav-model'

export type BuildGlobalSidebarSectionsInput = {
  isElevatedPlatformRole: boolean
}

/** Pure global workspace sidebar sections for the AppShell. */
export function buildGlobalSidebarSections(
  input: BuildGlobalSidebarSectionsInput,
): StaticSidebarNavSection[] {
  const sections: StaticSidebarNavSection[] = [
    {
      id: 'main',
      label: 'Main',
      collapsible: false,
      items: [
        sidebarNavItem({ id: 'dashboard', label: 'Dashboard', href: ROUTES.home, end: true }),
        sidebarNavItem({ id: 'campaigns', label: 'Campaigns', href: ROUTES.campaign.list }),
      ],
    },
    {
      id: 'personal',
      label: 'Personal',
      collapsible: false,
      items: [
        sidebarNavItem({ id: 'characters', label: 'Characters', href: ROUTES.characters.list }),
        sidebarNavItem({ id: 'messages', label: 'Messages', href: ROUTES.messages.list }),
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      collapsible: false,
      items: [
        sidebarNavItem({
          id: 'name-generator',
          label: 'Name Generator',
          href: ROUTES.nameGenerator,
        }),
      ],
    },
  ]

  if (input.isElevatedPlatformRole) {
    sections.push({
      id: 'admin',
      label: 'Admin',
      collapsible: false,
      items: buildAdminSidebarItems(),
    })
  }

  return compactSidebarSections(sections)
}
