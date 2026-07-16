import { describe, expect, it } from 'vitest'

import {
  createDndBeyondCatalogNameIndex,
  dndBeyondCatalogLookupKeys,
  resolveLocalCatalogMatchFromName,
} from './dnd-beyond-catalog-resolution'

describe('dnd-beyond-catalog-resolution', () => {
  const index = createDndBeyondCatalogNameIndex([
    { name: 'Backpack', slug: 'backpack' },
    { name: 'Light', slug: 'light' },
  ])

  it('builds lookup keys with and without parenthetical qualifiers', () => {
    expect(dndBeyondCatalogLookupKeys("Assassin's Blood (Ingested)")).toEqual([
      "assassin's blood (ingested)",
      "assassin's blood",
    ])
  })

  it('resolves catalog entries to local ids', () => {
    expect(resolveLocalCatalogMatchFromName('Light', index)).toEqual({
      localSlug: 'light',
      localValue: 'srd-cc-5.2.1:light',
    })
  })
})
