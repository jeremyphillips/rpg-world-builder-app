import { createPersistedPreference } from '@/lib/persisted-preferences/create-persisted-preference'

import {
  COLLAPSIBLE_SIDEBAR_SECTION_IDS,
  type CollapsibleSidebarSectionId,
} from './sidebar-nav-model'

export const SIDEBAR_PREFERENCES_KEY = 'rpg:sidebar-preferences:v1'

export type SidebarPreferences = {
  version: 1
  expandedSections: Partial<Record<CollapsibleSidebarSectionId, boolean>>
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sanitizeExpandedSections(
  raw: unknown,
): Partial<Record<CollapsibleSidebarSectionId, boolean>> {
  if (!isRecord(raw)) return {}

  const expandedSections: Partial<Record<CollapsibleSidebarSectionId, boolean>> = {}

  for (const sectionId of COLLAPSIBLE_SIDEBAR_SECTION_IDS) {
    const value = raw[sectionId]
    if (typeof value === 'boolean') {
      expandedSections[sectionId] = value
    }
  }

  return expandedSections
}

function validateSidebarPreferencesPayload(
  raw: Record<string, unknown>,
): Omit<SidebarPreferences, 'version'> | null {
  if (raw.expandedSections !== undefined && !isRecord(raw.expandedSections)) {
    return null
  }

  return {
    expandedSections: sanitizeExpandedSections(raw.expandedSections),
  }
}

export const sidebarPreferencesStore = createPersistedPreference<
  1,
  SidebarPreferences,
  Omit<SidebarPreferences, 'version'>
>({
  key: SIDEBAR_PREFERENCES_KEY,
  version: 1,
  defaults: { expandedSections: {} },
  validatePayload: validateSidebarPreferencesPayload,
})

/** Combines stored collapse preference with route-driven force-open. */
export function resolveSectionExpanded(input: {
  storedCollapsed: boolean
  isForcedOpen: boolean
}): boolean {
  return input.isForcedOpen || !input.storedCollapsed
}

/** Missing section keys default to expanded when reading raw preference storage. */
export function isSectionStoredExpanded(
  expandedSections: SidebarPreferences['expandedSections'],
  sectionId: CollapsibleSidebarSectionId,
): boolean {
  return expandedSections[sectionId] ?? true
}
