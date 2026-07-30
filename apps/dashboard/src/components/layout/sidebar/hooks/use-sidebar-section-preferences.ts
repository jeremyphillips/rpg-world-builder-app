import { useCallback, useState } from 'react'

import { sectionHasActiveItem } from '../lib/section-has-active-item'
import {
  resolveSectionExpanded,
  sidebarPreferencesStore,
  type SidebarPreferences,
} from '../lib/sidebar-preferences'
import type { CollapsibleSidebarNavSection } from '../lib/sidebar-nav-model'

export function useSidebarSectionPreferences() {
  const [preferences, setPreferences] = useState<SidebarPreferences>(() =>
    sidebarPreferencesStore.hydrate(),
  )

  const setSectionExpanded = useCallback(
    (sectionId: CollapsibleSidebarNavSection['id'], expanded: boolean) => {
      setPreferences((current) => {
        const next: SidebarPreferences = {
          ...current,
          expandedSections: {
            ...current.expandedSections,
            [sectionId]: expanded,
          },
        }
        sidebarPreferencesStore.persist(next)
        return next
      })
    },
    [],
  )

  const getSectionExpanded = useCallback(
    (section: CollapsibleSidebarNavSection, pathname: string) => {
      const storedCollapsed = preferences.expandedSections[section.id] === false
      const isForcedOpen = sectionHasActiveItem(pathname, section)
      return resolveSectionExpanded({ storedCollapsed, isForcedOpen })
    },
    [preferences.expandedSections],
  )

  return { getSectionExpanded, setSectionExpanded }
}
