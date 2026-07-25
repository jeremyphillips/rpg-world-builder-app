/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'

import { createOverviewPreferences } from './create-overview-preferences'

const columnSchema = {
  ids: ['name', 'role'],
  lockedIds: ['name'],
} as const

describe('createOverviewPreferences', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists and hydrates per-consumer schemas with stable keys', () => {
    const store = createOverviewPreferences({
      keyPrefix: 'rpg:test-overview:v1:',
      version: 1,
      defaults: { pageSize: 20, advancedOpen: false },
      pageSizes: [10, 20, 50] as const,
    })

    expect(store.preferencesKey('npcs')).toBe('rpg:test-overview:v1:npcs')

    store.persist('npcs', {
      version: 1,
      pageSize: 50,
      columnVisibility: { role: false },
    })

    expect(store.hydrate('npcs', columnSchema)).toEqual({
      version: 1,
      pageSize: 50,
      advancedOpen: false,
      columnVisibility: {
        name: true,
        role: false,
      },
    })
  })

  it('does not persist current page index', () => {
    const store = createOverviewPreferences({
      keyPrefix: 'rpg:test-overview:v1:',
      version: 1,
      defaults: { pageSize: 20 },
      pageSizes: [10, 20, 50] as const,
    })

    const validated = store.validate(
      {
        version: 1,
        pageIndex: 3,
        currentPage: 2,
      },
      columnSchema,
    )

    expect(validated).toEqual({
      version: 1,
    })
    expect(validated).not.toHaveProperty('pageIndex')
    expect(validated).not.toHaveProperty('currentPage')
  })
})
