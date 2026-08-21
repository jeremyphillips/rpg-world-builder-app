import { buildingClassificationSchema } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { makeLocation } from '@/test/fixtures/factories/location'

import { getLocationOverviewSearchText } from './location-overview-search.lib'

function buildingLocation(
  id: string,
  name: string,
  classification: ReturnType<typeof buildingClassificationSchema.parse>,
) {
  return makeLocation({
    kind: 'structure',
    id,
    slug: id,
    name,
    structureType: 'building',
    classification,
  })
}

describe('getLocationOverviewSearchText', () => {
  it('returns only the location name for non-building rows', () => {
    const region = makeLocation({
      kind: 'region',
      id: 'loc-region',
      slug: 'loc-region',
      name: 'Sword Coast',
      classification: { kind: 'geographic', type: 'coast' },
    })

    expect(getLocationOverviewSearchText(region)).toEqual(['Sword Coast'])
  })

  it('includes Form, Facility, and derived-function labels', () => {
    const brewery = buildingLocation(
      'loc-brewery',
      'North Dock Brewery',
      buildingClassificationSchema.parse({ form: 'house', facilityType: 'brewery' }),
    )

    expect(getLocationOverviewSearchText(brewery)).toEqual(
      expect.arrayContaining(['North Dock Brewery', 'House', 'Brewery', 'Production']),
    )
  })

  it('includes the Facility-derived Worship function label', () => {
    const temple = buildingLocation(
      'loc-temple',
      'Temple of Healing',
      buildingClassificationSchema.parse({
        facilityType: 'temple',
      }),
    )

    expect(getLocationOverviewSearchText(temple)).toEqual(
      expect.arrayContaining(['Temple of Healing', 'Temple', 'Worship']),
    )
  })

  it('includes Phase 20 promoted Facility labels and derived functions in overview search', () => {
    const workshop = buildingLocation(
      'loc-workshop',
      'Copper Lane Workshop',
      buildingClassificationSchema.parse({ facilityType: 'workshop' }),
    )
    const office = buildingLocation(
      'loc-office',
      'Harbourmaster Office',
      buildingClassificationSchema.parse({ facilityType: 'office' }),
    )
    const bakery = buildingLocation(
      'loc-bakery',
      'Mill Street Bakery',
      buildingClassificationSchema.parse({ facilityType: 'bakery' }),
    )
    const auctionHouse = buildingLocation(
      'loc-auction',
      'River Exchange',
      buildingClassificationSchema.parse({ facilityType: 'auction_house' }),
    )

    expect(getLocationOverviewSearchText(workshop)).toEqual(
      expect.arrayContaining(['Copper Lane Workshop', 'Workshop', 'Production']),
    )
    expect(getLocationOverviewSearchText(office)).toEqual(
      expect.arrayContaining(['Harbourmaster Office', 'Office', 'Governance']),
    )
    expect(getLocationOverviewSearchText(bakery)).toEqual(
      expect.arrayContaining(['Mill Street Bakery', 'Bakery', 'Production · Retail']),
    )
    expect(getLocationOverviewSearchText(auctionHouse)).toEqual(
      expect.arrayContaining(['River Exchange', 'Auction house', 'Retail']),
    )
  })
})
