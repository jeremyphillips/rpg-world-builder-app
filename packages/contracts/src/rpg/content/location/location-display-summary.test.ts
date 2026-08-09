import { describe, expect, it } from 'vitest'

import { buildingClassificationSchema } from './building-classification'
import {
  compareLocationClassificationParts,
  resolveLocationClassificationDisplay,
  resolveLocationDetailClassificationFieldLabel,
  resolveLocationDisplaySummary,
  resolveLocationReferenceNoun,
  resolveLocationStructureHeadingNoun,
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

  it('resolves structure heading nouns from the display projection', () => {
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
    const site: Location = {
      ...baseLocation,
      id: 'loc_site',
      kind: 'site',
      siteType: 'landmark',
      parentLocationId: 'loc_parent',
    }

    expect(resolveLocationStructureHeadingNoun(settlement)).toBe('City')
    expect(resolveLocationStructureHeadingNoun(region)).toBe('Region')
    expect(resolveLocationStructureHeadingNoun(site)).toBe('Landmark')
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

  it('resolves interior type and subtype classification separately', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'interior',
      interiorType: 'space',
      classification: { type: 'chamber' },
    }

    expect(resolveLocationDisplaySummary(location)).toEqual({
      typeLabel: 'Space',
      classificationLabel: 'Chamber',
    })
  })

  it('resolves interior type without subtype', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'interior',
      interiorType: 'passage',
    }

    expect(resolveLocationDisplaySummary(location)).toEqual({
      typeLabel: 'Passage',
    })
  })

  it('resolves untyped interior as the generic Interior kind label', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'interior',
    }

    expect(resolveLocationDisplaySummary(location)).toEqual({
      typeLabel: 'Interior',
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

describe('resolveLocationReferenceNoun', () => {
  it('returns lowercase prose nouns from the same type tier as classification', () => {
    expect(
      resolveLocationReferenceNoun({
        ...baseLocation,
        kind: 'structure',
        structureType: 'building',
        classification: buildingClassificationSchema.parse({ archetype: 'tavern' }),
      }),
    ).toBe('building')

    expect(
      resolveLocationReferenceNoun({
        ...baseLocation,
        kind: 'interior',
        interiorType: 'space',
        classification: { type: 'chamber' },
      }),
    ).toBe('space')

    expect(
      resolveLocationReferenceNoun({
        ...baseLocation,
        kind: 'settlement',
        settlementType: 'city',
        parentLocationId: 'loc_parent',
      }),
    ).toBe('settlement')

    expect(
      resolveLocationReferenceNoun({
        ...baseLocation,
        kind: 'structure',
      }),
    ).toBe('structure')
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

  it('returns settlement, region, site, fortification, and interior compact lines', () => {
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

    expect(
      resolveLocationClassificationDisplay({
        ...baseLocation,
        kind: 'interior',
        interiorType: 'space',
        classification: { type: 'chamber' },
      }),
    ).toEqual({
      parts: ['Space', 'Chamber'],
      text: 'Space · Chamber',
    })

    expect(
      resolveLocationClassificationDisplay({
        ...baseLocation,
        kind: 'interior',
      }),
    ).toEqual({
      parts: ['Interior'],
      text: 'Interior',
    })

    expect(
      resolveLocationClassificationDisplay({
        ...baseLocation,
        kind: 'interior',
        interiorType: 'passage',
        classification: { type: 'corridor' },
      }),
    ).toEqual({
      parts: ['Passage', 'Corridor'],
      text: 'Passage · Corridor',
    })

    expect(
      resolveLocationClassificationDisplay({
        ...baseLocation,
        kind: 'interior',
        interiorType: 'level',
        classification: { type: 'floor' },
      }),
    ).toEqual({
      parts: ['Level', 'Floor'],
      text: 'Level · Floor',
    })
  })
})

describe('compareLocationClassificationParts', () => {
  it('returns zero when parts are equal', () => {
    expect(
      compareLocationClassificationParts(['Building', 'Guildhall'], ['Building', 'Guildhall']),
    ).toBe(0)
  })

  it('compares different second segments', () => {
    expect(
      compareLocationClassificationParts(['Building', 'Guildhall'], ['Building', 'Tavern']),
    ).toBeLessThan(0)
  })

  it('sorts shorter equal-prefix classifications first', () => {
    expect(
      compareLocationClassificationParts(['Building'], ['Building', 'Guildhall']),
    ).toBeLessThan(0)
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

  it('returns interior classification label', () => {
    const location: Location = {
      ...baseLocation,
      kind: 'interior',
      interiorType: 'space',
      classification: { type: 'chamber' },
    }

    expect(resolveLocationDetailClassificationFieldLabel(location)).toBe('Space type')
  })
})
