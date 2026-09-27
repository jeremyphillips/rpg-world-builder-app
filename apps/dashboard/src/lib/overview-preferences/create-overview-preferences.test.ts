/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest'

import {
  createOverviewPreferences,
  reconcileOverviewColumnOrder,
  sanitizeOverviewColumnOrder,
} from './create-overview-preferences'

const columnSchema = {
  ids: ['name', 'role'],
  lockedIds: ['name'],
} as const

describe('reconcileOverviewColumnOrder', () => {
  const schema = [
    'overview-display-image',
    'name',
    'hitDie',
    'status',
    'source',
    'actions',
  ] as const

  it('keeps schema order when persisted order is empty', () => {
    expect(reconcileOverviewColumnOrder(schema, [])).toEqual([...schema])
  })

  it('keeps omitted columns at their schema index while honoring persisted relative order', () => {
    expect(reconcileOverviewColumnOrder(schema, ['hitDie', 'name'])).toEqual([
      'overview-display-image',
      'hitDie',
      'name',
      'status',
      'source',
      'actions',
    ])
  })
})

describe('sanitizeOverviewColumnOrder', () => {
  const columnSchema = {
    ids: ['overview-display-image', 'name', 'traits', 'status', 'source', 'actions'],
    lockedIds: ['overview-display-image', 'name', 'actions'],
  } as const

  it('pins the locked leading image column when it was persisted last', () => {
    expect(
      sanitizeOverviewColumnOrder(
        ['name', 'traits', 'status', 'source', 'overview-display-image'],
        columnSchema,
      ),
    ).toEqual(['overview-display-image', 'name', 'traits', 'status', 'source', 'actions'])
  })
})

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
