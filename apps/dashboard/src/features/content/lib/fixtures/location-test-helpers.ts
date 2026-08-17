import type { Location } from '@rpg/contracts'

import { STORY_CAMPAIGN_ID } from '@/test/fixtures/constants'
import { makeLocation } from '@/test/fixtures/factories/location'

type LocationFixtureOverrides = Omit<Partial<Location>, 'kind'>

export function testRegionLocation(overrides: LocationFixtureOverrides = {}): Location {
  return makeLocation({
    kind: 'region',
    id: 'region-1',
    campaignId: STORY_CAMPAIGN_ID,
    name: 'Kingdom of Foo',
    slug: 'kingdom-of-foo',
    classification: { kind: 'geographic', type: 'coast' },
    ...overrides,
  })
}

export function testSettlementLocation(
  overrides: Omit<Partial<Extract<Location, { kind: 'settlement' }>>, 'kind'> = {},
): Location {
  return makeLocation({
    kind: 'settlement',
    id: 'settlement-1',
    campaignId: STORY_CAMPAIGN_ID,
    name: 'Port City',
    slug: 'port-city',
    settlementType: 'city',
    ...overrides,
  })
}

export function testDistrictLocation(overrides: LocationFixtureOverrides = {}): Location {
  return makeLocation({
    kind: 'district',
    id: 'district-1',
    campaignId: STORY_CAMPAIGN_ID,
    name: 'Harbor Ward',
    slug: 'harbor-ward',
    ...overrides,
  })
}

export function testStructureLocation(
  overrides: Omit<Partial<Extract<Location, { kind: 'structure' }>>, 'kind'> = {},
): Location {
  return makeLocation({
    kind: 'structure',
    id: 'structure-1',
    campaignId: STORY_CAMPAIGN_ID,
    name: 'Royal Mint',
    slug: 'royal-mint',
    structureType: 'building',
    ...overrides,
  })
}

/** Alias for structure locations used in connection drawer tests. */
export function testBuildingLocation(
  overrides: Omit<Partial<Extract<Location, { kind: 'structure' }>>, 'kind'> = {},
): Location {
  return testStructureLocation({
    id: 'building-1',
    name: 'Royal Mint',
    slug: 'royal-mint',
    ...overrides,
  })
}
