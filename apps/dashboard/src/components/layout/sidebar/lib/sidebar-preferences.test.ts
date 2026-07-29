/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'

import {
  resolveStoredSectionExpanded,
  SIDEBAR_PREFERENCES_KEY,
  sidebarPreferencesStore,
} from './sidebar-preferences'

describe('sidebarPreferencesStore', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('defaults missing section keys to expanded', () => {
    expect(resolveStoredSectionExpanded({}, 'campaign')).toBe(true)
    expect(resolveStoredSectionExpanded({ world: false }, 'world')).toBe(false)
    expect(resolveStoredSectionExpanded({ world: false }, 'campaign')).toBe(true)
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
