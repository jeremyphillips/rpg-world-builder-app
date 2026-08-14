import {
  buildingClassificationSchema,
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type Location,
  type WithCampaignAccess,
} from '@rpg/contracts'
import { applyFilterSchema } from '@rpg/ui/filters'
import { describe, expect, it } from 'vitest'

import { buildLocationsFilterSchema } from './locations-overview-filter-schema'

const baseLocation = {
  rulesetId: 'srd-cc-5.2.1' as const,
  source: 'homebrew' as const,
  status: 'published' as const,
  campaignId: 'camp_1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
} satisfies Partial<WithCampaignAccess<Location>>

function buildingRow(
  id: string,
  name: string,
  classification: ReturnType<typeof buildingClassificationSchema.parse>,
): WithCampaignAccess<Location> {
  return {
    ...baseLocation,
    id,
    slug: id,
    name,
    kind: 'structure',
    structureType: 'building',
    classification,
  } as WithCampaignAccess<Location>
}

const rows: WithCampaignAccess<Location>[] = [
  buildingRow(
    'loc-residence',
    'Travelers Rest',
    buildingClassificationSchema.parse({ facilityType: 'residence' }),
  ),
  buildingRow('loc-house', 'Old House', buildingClassificationSchema.parse({ form: 'house' })),
  buildingRow(
    'loc-brewery',
    'Yawning Portal Brewery',
    buildingClassificationSchema.parse({ facilityType: 'brewery' }),
  ),
  buildingRow(
    'loc-temple',
    'Temple of Healing',
    buildingClassificationSchema.parse({
      facilityType: 'temple',
    }),
  ),
  {
    ...baseLocation,
    id: 'loc-city',
    slug: 'loc-city',
    name: 'Waterdeep',
    kind: 'settlement',
    settlementType: 'city',
  } as WithCampaignAccess<Location>,
]

const schema = buildLocationsFilterSchema()

describe('locations overview filters', () => {
  it('finds buildings by broad Model E discovery search terms', () => {
    const filtered = applyFilterSchema(schema, { name: 'production' }, rows)

    expect(filtered.map((row) => row.id)).toEqual(['loc-brewery'])
  })

  it('filters by exact Building Facility identity', () => {
    const filtered = applyFilterSchema(schema, { buildingFacilityType: 'brewery' }, rows)

    expect(filtered.map((row) => row.id)).toEqual(['loc-brewery'])
  })

  it('filters by Facility-derived function membership', () => {
    const filtered = applyFilterSchema(schema, { buildingFunction: 'dwelling' }, rows)

    expect(filtered.map((row) => row.id)).toEqual(['loc-residence'])
  })

  it('keeps Facility identity aligned with its derived function', () => {
    const byFunction = applyFilterSchema(schema, { buildingFunction: 'worship' }, rows)
    const byFacility = applyFilterSchema(schema, { buildingFacilityType: 'temple' }, rows)

    expect(byFunction.map((row) => row.id)).toEqual(['loc-temple'])
    expect(byFacility.map((row) => row.id)).toEqual(['loc-temple'])
  })
})
