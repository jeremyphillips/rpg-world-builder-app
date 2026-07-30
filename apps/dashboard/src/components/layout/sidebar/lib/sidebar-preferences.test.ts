/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'

import {
  isSectionStoredExpanded,
  resolveSectionExpanded,
  SIDEBAR_PREFERENCES_KEY,
  sidebarPreferencesStore,
} from './sidebar-preferences'

describe('sidebarPreferencesStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults missing section keys to expanded in raw storage', () => {
    expect(isSectionStoredExpanded({}, 'campaign')).toBe(true)
    expect(isSectionStoredExpanded({ world: false }, 'world')).toBe(false)
    expect(isSectionStoredExpanded({ world: false }, 'campaign')).toBe(true)
  })

  it('combines stored collapse with route force-open', () => {
    expect(resolveSectionExpanded({ storedCollapsed: true, isForcedOpen: false })).toBe(false)
    expect(resolveSectionExpanded({ storedCollapsed: true, isForcedOpen: true })).toBe(true)
    expect(resolveSectionExpanded({ storedCollapsed: false, isForcedOpen: false })).toBe(true)
  })

  it('persists and hydrates expanded section state', () => {
    sidebarPreferencesStore.persist({
      version: 1,
      expandedSections: { campaign: false, gameLibrary: true },
    })

    expect(sidebarPreferencesStore.hydrate()).toEqual({
      version: 1,
      expandedSections: { campaign: false, gameLibrary: true },
    })
  })

  it('falls back to defaults when stored JSON is malformed', () => {
    localStorage.setItem(SIDEBAR_PREFERENCES_KEY, '{bad-json')

    expect(sidebarPreferencesStore.hydrate()).toEqual({
      version: 1,
      expandedSections: {},
    })
  })

  it('falls back to defaults when expandedSections has invalid shapes', () => {
    localStorage.setItem(
      SIDEBAR_PREFERENCES_KEY,
      JSON.stringify({ version: 1, expandedSections: 'collapsed' }),
    )

    expect(sidebarPreferencesStore.hydrate()).toEqual({
      version: 1,
      expandedSections: {},
    })
  })
})
