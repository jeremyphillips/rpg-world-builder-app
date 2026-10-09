import { resolveLocationClassificationDisplay } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { makeLocation } from '@/test/fixtures/factories/location'

import { getResidenceLocationSearchText } from '../../../lib/connections/residence-location-connection.lib'

import { filterAndSortResidencePickerItems } from './residence-location-picker-drawer.lib'

const harbor = makeLocation({ kind: 'settlement', slug: 'harborford', name: 'Harborford' })
const brewery = makeLocation({
  kind: 'structure',
  slug: 'yawning-portal',
  name: 'Yawning Portal',
})
const namedBrewery = makeLocation({
  kind: 'structure',
  slug: 'brewery-hall',
  name: 'Brewery Hall',
})

function legacyIncludes(text: string, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return text.trim().toLowerCase().includes(normalized)
}

describe('residence location picker library', () => {
  const items = [
    { location: brewery, selected: false },
    { location: harbor, selected: true },
    { location: namedBrewery, selected: false },
  ]

  it('keeps empty-query order by name', () => {
    expect(
      filterAndSortResidencePickerItems(items, { searchQuery: '  ' }).map(
        (item) => item.location.name,
      ),
    ).toEqual(['Brewery Hall', 'Harborford', 'Yawning Portal'])
  })

  it('keeps every legacy includes match, including the classification separator', () => {
    const classification = resolveLocationClassificationDisplay(brewery)
    expect(classification.text).toContain(' · ')

    const queries = [
      '',
      '  YAWNING  ',
      'portal',
      'brewery',
      `yawning portal ${classification.parts[0] ?? ''}`,
      classification.text,
      'harborford ·',
    ]

    for (const item of items) {
      const text = getResidenceLocationSearchText(item.location)
      for (const query of queries) {
        if (!legacyIncludes(text, query)) continue
        expect(
          filterAndSortResidencePickerItems(items, { searchQuery: query }).some(
            (row) => row.location.id === item.location.id,
          ),
          `${item.location.name} / ${JSON.stringify(query)}`,
        ).toBe(true)
      }
    }
  })

  it('breaks equal names and equal search scores on stable id', () => {
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
    const zeta = makeLocation({
      kind: 'structure',
      id: 'loc-zeta',
      slug: 'zeta-hall',
      name: 'Zeta Hall',
      structureType: 'building',
    })
    const rows = [
      { location: zeta, selected: false },
      { location: amberB, selected: false },
      { location: amberA, selected: false },
    ]

    expect(
      filterAndSortResidencePickerItems(rows, { searchQuery: '' }).map((row) => row.location.id),
    ).toEqual(['loc-amber-a', 'loc-amber-b', 'loc-zeta'])
    expect(
      filterAndSortResidencePickerItems(rows, { searchQuery: 'amber' }).map(
        (row) => row.location.id,
      ),
    ).toEqual(['loc-amber-a', 'loc-amber-b'])
  })

  it('ranks a literal name hit above a classification-part hit', () => {
    expect(
      filterAndSortResidencePickerItems(items, { searchQuery: 'brewery' }).map(
        (item) => item.location.name,
      ),
    ).toEqual(['Brewery Hall', 'Yawning Portal'])
  })
})
