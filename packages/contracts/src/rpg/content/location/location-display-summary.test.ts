import { describe, expect, it } from 'vitest'

import { buildingClassificationSchema } from './building-classification'
import {
  locationDisplaySummarySortKey,
  resolveLocationClassificationDisplay,
  resolveLocationDetailClassificationFieldLabel,
  resolveLocationDisplaySummary,
} from './location-display-summary'
import type { Location } from './location'

const baseLocation = {
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'homebrew' as const,
  status: 'published' as const,
  campaignId: 'camp_1',
  id: 'loc_test',
  slug: 'test',
  name: 'Test',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

describe('resolveLocationDisplaySummary', () => {
  it('resolves world type without classification', () => {
    const location: Location = { ...baseLocation, kind: 'world' }
    expect(resolveLocationDisplaySummary(location)).toEqual({
      typeLabel: 'World',
    })
  })

  it('resolves settlement and region classification labels', () => {
    const settlement: Location = {
      ...baseLocation,
      kind: 'settlement',
      settlementType: 'city',
      parentLocationId: 'loc_parent',
    }
    const region: Location = {
      ...baseLocation,
      id: 'loc_region',
      kind: 'region',
      classification: { kind: 'political', type: 'kingdom' },
    }

    expect(resolveLocationDisplaySummary(settlement)).toEqual({
      typeLabel: 'Settlement',
      classificationLabel: 'City',
    })
    expect(resolveLocationDisplaySummary(region)).toEqual({
      typeLabel: 'Region',
      classificationLabel: 'Kingdom',
    })
  })

  it('resolves building archetype and specialization separately', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'structure',
      structureType: 'building',
      classification: buildingClassificationSchema.parse({
        archetype: 'guildhall',
        specialization: 'Thieves',
      }),
    }

    expect(resolveLocationDisplaySummary(location)).toEqual({
      typeLabel: 'Building',
      classificationLabel: 'Guildhall',
      specializationLabel: 'Thieves',
    })
  })

  it('resolves interior subtype classification', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'interior',
      interiorType: 'space',
      classification: { type: 'chamber' },
    }

    expect(resolveLocationDisplaySummary(location)).toEqual({
      typeLabel: 'Interior',
      classificationLabel: 'Chamber',
    })
  })

  it('resolves fortification without classification', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'structure',
      structureType: 'fortification',
    }

    expect(resolveLocationDisplaySummary(location)).toEqual({
      typeLabel: 'Fortification',
    })
  })

  it('resolves untyped structure as the generic Structure kind label', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'structure',
    }

    expect(resolveLocationDisplaySummary(location)).toEqual({
      typeLabel: 'Structure',
    })
  })
})

describe('resolveLocationClassificationDisplay', () => {
  it('omits specialization from compact classification text', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'structure',
      structureType: 'building',
      classification: buildingClassificationSchema.parse({
        archetype: 'guildhall',
        specialization: 'Thieves',
      }),
    }

    expect(resolveLocationClassificationDisplay(location)).toEqual({
      parts: ['Building', 'Guildhall'],
      text: 'Building · Guildhall',
    })
  })

  it('returns Structure for untyped structures', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'structure',
    }

    expect(resolveLocationClassificationDisplay(location)).toEqual({
      parts: ['Structure'],
      text: 'Structure',
    })
  })

  it('returns settlement, region, site, and fortification compact lines', () => {
    expect(
      resolveLocationClassificationDisplay({
        ...baseLocation,
        kind: 'settlement',
        settlementType: 'city',
        parentLocationId: 'loc_parent',
      }),
    ).toEqual({
      parts: ['Settlement', 'City'],
      text: 'Settlement · City',
    })

    expect(
      resolveLocationClassificationDisplay({
        ...baseLocation,
        kind: 'region',
        classification: { kind: 'political', type: 'kingdom' },
      }),
    ).toEqual({
      parts: ['Region', 'Kingdom'],
      text: 'Region · Kingdom',
    })

    expect(
      resolveLocationClassificationDisplay({
        ...baseLocation,
        kind: 'site',
        siteType: 'dungeon',
      }),
    ).toEqual({
      parts: ['Site', 'Dungeon'],
      text: 'Site · Dungeon',
    })

    expect(
      resolveLocationClassificationDisplay({
        ...baseLocation,
        kind: 'structure',
        structureType: 'fortification',
      }),
    ).toEqual({
      parts: ['Fortification'],
      text: 'Fortification',
    })
  })
})

describe('locationDisplaySummarySortKey', () => {
  it('returns tuple with empty strings for missing segments', () => {
    expect(
      locationDisplaySummarySortKey({
        typeLabel: 'Building',
        classificationLabel: 'Guildhall',
      }),
    ).toEqual(['Building', 'Guildhall', ''])
  })
})

describe('resolveLocationDetailClassificationFieldLabel', () => {
  it('returns archetype label for building structures', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'structure',
      structureType: 'building',
      classification: buildingClassificationSchema.parse({ archetype: 'tavern' }),
    }

    expect(resolveLocationDetailClassificationFieldLabel(location)).toBe('Archetype')
  })

  it('returns settlement classification label', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'settlement',
      settlementType: 'city',
      parentLocationId: 'loc_parent',
    }

    expect(resolveLocationDetailClassificationFieldLabel(location)).toBe('Classification')
  })
})
