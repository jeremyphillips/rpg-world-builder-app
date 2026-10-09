import { buildingClassificationSchema } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { makeLocation } from '@/test/fixtures/factories/location'

import {
  buildLocationConnectionPickerEntries,
  sortLocationConnectionPickerRows,
} from './location-connection-picker-items.lib'

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

  it('searches classification and ancestry for place and property rows', () => {
    const city = makeLocation({
      kind: 'settlement',
      id: 'loc-city',
      slug: 'port-city',
      name: 'Port City',
      settlementType: 'city',
    })
    const tavern = makeLocation({
      kind: 'structure',
      id: 'loc-tavern',
      slug: 'yawning-portal',
      name: 'Yawning Portal',
      structureType: 'building',
      classification: buildingClassificationSchema.parse({ facilityType: 'brewery' }),
      parentLocationId: city.id,
    })
    const locationsById = new Map([
      [city.id, city],
      [tavern.id, tavern],
    ])

    const [entry] = buildLocationConnectionPickerEntries([tavern], {
      locationsById,
      campaignId: 'campaign-1',
    })

    expect(entry?.searchText).toContain('Yawning Portal')
    expect(entry?.searchText).toContain('Brewery')
    expect(entry?.searchText).toContain('Port City')
  })
})
