import { ROUTES } from '@/app/routes'

import { compactSidebarSections, type SidebarNavSection } from './sidebar-nav-model'

export type BuildGlobalSidebarSectionsInput = {
  isElevatedPlatformRole: boolean
}

/** Pure global workspace sidebar sections for the AppShell. */
export function buildGlobalSidebarSections(
  input: BuildGlobalSidebarSectionsInput,
): SidebarNavSection[] {
  const sections: SidebarNavSection[] = [
    {
      id: 'main',
      label: 'Main',
      collapsible: false,
      items: [
        { id: 'dashboard', label: 'Dashboard', href: ROUTES.home, end: true },
        { id: 'campaigns', label: 'Campaigns', href: ROUTES.campaign.list },
        { id: 'characters', label: 'Characters', href: ROUTES.characters.list },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      collapsible: false,
      items: [{ id: 'name-generator', label: 'Name Generator', href: ROUTES.nameGenerator }],
    },
  ]

  if (input.isElevatedPlatformRole) {
    sections.push({
      id: 'admin',
      label: 'Admin',
      collapsible: false,
      items: [
        { id: 'admin-users', label: 'Users', href: ROUTES.admin.users },
        { id: 'admin-settings', label: 'Admin Settings', href: ROUTES.admin.settings },
      ],
    })
  }

  return compactSidebarSections(sections)
}
