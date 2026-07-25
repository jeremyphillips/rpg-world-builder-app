/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'

import {
  CATALOG_OVERVIEW_PREFERENCES_DEFAULTS,
  CATALOG_OVERVIEW_PREFERENCES_KEY_PREFIX,
  catalogOverviewPreferencesKey,
  createDefaultCatalogOverviewPreferences,
  hydrateCatalogOverviewPreferences,
  persistCatalogOverviewPreferences,
  validateCatalogOverviewPreferences,
} from './catalog-overview-preferences'

const columnSchema = {
  ids: ['name', 'role', 'actions'],
  lockedIds: ['name', 'actions'],
} as const

describe('catalog-overview-preferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('builds a versioned storage key per table', () => {
    expect(catalogOverviewPreferencesKey('npcs')).toBe(
      `${CATALOG_OVERVIEW_PREFERENCES_KEY_PREFIX}npcs`,
    )
  })

  it('discards unknown column ids and keeps locked columns visible', () => {
    const validated = validateCatalogOverviewPreferences(
      {
        version: 1,
        columnVisibility: {
          name: false,
          role: false,
          removed: true,
        },
        columnOrder: ['role', 'removed', 'name'],
      },
      columnSchema,
    )

    expect(validated).toEqual({
      version: 1,
      columnVisibility: {
        actions: true,
        name: true,
        role: false,
      },
      columnOrder: ['role', 'name', 'actions'],
    })
  })

  it('rejects invalid payloads', () => {
    expect(validateCatalogOverviewPreferences({ version: 2 }, columnSchema)).toBeNull()
    expect(
      validateCatalogOverviewPreferences({ version: 1, pageSize: 15 }, columnSchema),
    ).toBeNull()
    expect(
      validateCatalogOverviewPreferences({ version: 1, columnVisibility: 'bad' }, columnSchema),
    ).toBeNull()
  })

  it('hydrates defaults when storage is missing or invalid', () => {
    expect(hydrateCatalogOverviewPreferences('npcs', columnSchema)).toEqual(
      createDefaultCatalogOverviewPreferences(),
    )

    localStorage.setItem(
      catalogOverviewPreferencesKey('npcs'),
      JSON.stringify({ version: 1, pageSize: 99 }),
    )

    expect(hydrateCatalogOverviewPreferences('npcs', columnSchema)).toEqual(
      createDefaultCatalogOverviewPreferences(),
    )
  })

  it('persists validated preferences', () => {
    persistCatalogOverviewPreferences('npcs', {
      version: 1,
      pageSize: 50,
      advancedOpen: true,
    })

    expect(hydrateCatalogOverviewPreferences('npcs', columnSchema)).toEqual({
      version: 1,
      ...CATALOG_OVERVIEW_PREFERENCES_DEFAULTS,
      pageSize: 50,
      advancedOpen: true,
    })
  })
})
