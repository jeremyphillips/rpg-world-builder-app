import { useCallback, useState } from 'react'

import { sectionHasActiveItem } from '../lib/section-has-active-item'
import {
  resolveStoredSectionExpanded,
  sidebarPreferencesStore,
  type SidebarPreferences,
} from '../lib/sidebar-preferences'
import type { CollapsibleSidebarSectionId, SidebarNavSection } from '../lib/sidebar-nav-model'

export function useSidebarSectionPreferences() {
  const [preferences, setPreferences] = useState<SidebarPreferences>(() =>
    sidebarPreferencesStore.hydrate(),
  )

  const setSectionExpanded = useCallback(
    (sectionId: CollapsibleSidebarSectionId, expanded: boolean) => {
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

  const getEffectiveExpanded = useCallback(
    (section: SidebarNavSection, pathname: string) => {
      if (!section.collapsible) {
        return true
      }

      const storedExpanded = resolveStoredSectionExpanded(
        preferences.expandedSections,
        section.id as CollapsibleSidebarSectionId,
      )

      return sectionHasActiveItem(pathname, section) || storedExpanded
    },
    [preferences.expandedSections],
  )

  return { getEffectiveExpanded, setSectionExpanded }
}
