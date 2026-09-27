/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'

import {
  CONTENT_OVERVIEW_PREFERENCES_DEFAULTS,
  CONTENT_OVERVIEW_PREFERENCES_KEY_PREFIX,
  contentOverviewPreferencesKey,
  createDefaultContentOverviewPreferences,
  hydrateContentOverviewPreferences,
  persistContentOverviewPreferences,
  validateContentOverviewPreferences,
} from './content-overview-preferences'

const columnSchema = {
  ids: ['overview-display-image', 'name', 'status', 'source', 'actions'],
  lockedIds: ['overview-display-image', 'name', 'actions'],
} as const

describe('content-overview-preferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('builds a versioned storage key per content type', () => {
    expect(contentOverviewPreferencesKey('classes')).toBe(
      `${CONTENT_OVERVIEW_PREFERENCES_KEY_PREFIX}classes`,
    )
  })

  it('discards unknown column ids and keeps locked columns visible', () => {
    const validated = validateContentOverviewPreferences(
      {
        version: 2,
        columnVisibility: {
          'overview-display-image': false,
          name: false,
          status: false,
          removed: true,
        },
        columnOrder: ['status', 'removed', 'name'],
      },
      columnSchema,
    )

    expect(validated).toEqual({
      version: 2,
      columnVisibility: {
        actions: true,
        'overview-display-image': true,
        name: true,
        status: false,
      },
      columnOrder: ['overview-display-image', 'status', 'name', 'source', 'actions'],
    })
  })

  it('rejects invalid payloads', () => {
    expect(validateContentOverviewPreferences({ version: 1 }, columnSchema)).toBeNull()
    expect(
      validateContentOverviewPreferences({ version: 2, pageSize: 15 }, columnSchema),
    ).toBeNull()
    expect(
      validateContentOverviewPreferences({ version: 2, columnVisibility: 'bad' }, columnSchema),
    ).toBeNull()
  })

  it('hydrates defaults when storage is missing or invalid', () => {
    expect(hydrateContentOverviewPreferences('classes', columnSchema)).toEqual(
      createDefaultContentOverviewPreferences(),
    )

    localStorage.setItem(
      contentOverviewPreferencesKey('classes'),
      JSON.stringify({ version: 2, pageSize: 99 }),
    )

    expect(hydrateContentOverviewPreferences('classes', columnSchema)).toEqual(
      createDefaultContentOverviewPreferences(),
    )
  })

  it('remaps legacy image column ids and pins the display image column first', () => {
    const validated = validateContentOverviewPreferences(
      {
        version: 2,
        columnOrder: ['name', 'traits', 'image'],
      },
      {
        ids: ['overview-display-image', 'name', 'traits', 'status', 'source', 'actions'],
        lockedIds: ['overview-display-image', 'name', 'actions'],
      },
    )

    expect(validated?.columnOrder?.[0]).toBe('overview-display-image')
    expect(validated?.columnOrder).toContain('traits')
  })

  it('persists validated preferences', () => {
    persistContentOverviewPreferences('classes', {
      version: 2,
      pageSize: 50,
      density: 'compact',
      advancedOpen: true,
    })

    expect(hydrateContentOverviewPreferences('classes', columnSchema)).toEqual({
      version: 2,
      ...CONTENT_OVERVIEW_PREFERENCES_DEFAULTS,
      pageSize: 50,
      density: 'compact',
      advancedOpen: true,
    })
  })
})
