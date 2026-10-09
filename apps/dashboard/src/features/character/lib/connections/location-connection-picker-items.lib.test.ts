import { describe, expect, it } from 'vitest'

import { makeLocation } from '@/test/fixtures/factories/location'

import { sortLocationConnectionPickerRows } from './location-connection-picker-items.lib'

describe('sortLocationConnectionPickerRows', () => {
  it('sorts location relationship add rows and modal place and property rows by name, then id', () => {
    const zeta = makeLocation({
      kind: 'structure',
      id: 'loc-zeta',
      slug: 'zeta-hall',
      name: 'Zeta Hall',
      structureType: 'building',
    })
    const amberB = makeLocation({
      kind: 'structure',
      id: 'loc-amber-b',
      slug: 'amber-hall-b',
      name: 'Amber Hall',
      structureType: 'building',
    })
    const amberA = makeLocation({
      kind: 'structure',
      id: 'loc-amber-a',
      slug: 'amber-hall-a',
      name: 'Amber Hall',
      structureType: 'building',
    })
    const input = [zeta, amberB, amberA]

    expect(sortLocationConnectionPickerRows(input).map((location) => location.id)).toEqual([
      'loc-amber-a',
      'loc-amber-b',
      'loc-zeta',
    ])
    expect(input.map((location) => location.id)).toEqual(['loc-zeta', 'loc-amber-b', 'loc-amber-a'])
  })
})
