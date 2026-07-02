import { afterEach, describe, expect, it } from 'vitest'

import {
  buildArrayItemCollapseStorageKey,
  readArrayItemCollapseOverrides,
  writeArrayItemCollapseOverrides,
} from './array-item-collapse-storage.lib'

describe('array-item-collapse-storage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('builds a versioned storage key scoped to form and array path', () => {
    expect(buildArrayItemCollapseStorageKey('entity-1', 'traits')).toBe(
      'rpg.form.arrayCollapse.v1:entity-1:traits',
    )
  })

  it('round-trips overrides through localStorage', () => {
    writeArrayItemCollapseOverrides('entity-1', 'traits', { darkvision: 'closed', keen: 'open' })
    expect(readArrayItemCollapseOverrides('entity-1', 'traits')).toEqual({
      darkvision: 'closed',
      keen: 'open',
    })
  })

  it('returns undefined for missing or invalid payloads', () => {
    expect(readArrayItemCollapseOverrides('entity-1', 'traits')).toBeUndefined()
    localStorage.setItem(
      buildArrayItemCollapseStorageKey('entity-1', 'traits'),
      JSON.stringify({ notOverrides: true }),
    )
    expect(readArrayItemCollapseOverrides('entity-1', 'traits')).toBeUndefined()
  })
})
