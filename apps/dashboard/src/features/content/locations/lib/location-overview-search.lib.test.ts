import { buildingClassificationSchema, type Location } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { getLocationOverviewSearchText } from './location-overview-search.lib'

const baseLocation = {
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'homebrew' as const,
  status: 'published' as const,
  campaignId: 'camp_1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
}

function buildingLocation(
  id: string,
  name: string,
  classification: ReturnType<typeof buildingClassificationSchema.parse>,
): Location {
  return {
    ...baseLocation,
    id,
    slug: id,
    name,
    kind: 'structure',
    structureType: 'building',
    classification,
  }
}

describe('getLocationOverviewSearchText', () => {
  it('returns only the location name for non-building rows', () => {
    const region: Location = {
      ...baseLocation,
      id: 'loc-region',
      slug: 'loc-region',
      name: 'Sword Coast',
      kind: 'region',
      classification: { kind: 'geographic', type: 'coast' },
    }

    expect(getLocationOverviewSearchText(region)).toEqual(['Sword Coast'])
  })

  it('includes archetype discovery metadata for classified buildings', () => {
    const warehouse = buildingLocation(
      'loc-warehouse',
      'North Dock Warehouse',
      buildingClassificationSchema.parse({ archetype: 'warehouse' }),
    )

    expect(getLocationOverviewSearchText(warehouse)).toEqual(
      expect.arrayContaining([
        'North Dock Warehouse',
        'Warehouse',
        'storehouse',
        'storage',
        'Storage',
      ]),
    )
  })

  it('includes specialization and effective override function labels', () => {
    const temple = buildingLocation(
      'loc-temple',
      'Temple of Healing',
      buildingClassificationSchema.parse({
        archetype: 'temple',
        specialization: 'Field hospital',
        functionOverride: 'care',
      }),
    )

    expect(getLocationOverviewSearchText(temple)).toEqual(
      expect.arrayContaining(['Temple of Healing', 'Temple', 'Field hospital', 'Care']),
    )
  })
})
