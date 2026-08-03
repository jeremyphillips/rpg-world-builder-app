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
    'loc-inn',
    'Travelers Rest',
    buildingClassificationSchema.parse({ archetype: 'inn' }),
  ),
  buildingRow(
    'loc-caravanserai',
    'Desert Waystation',
    buildingClassificationSchema.parse({ archetype: 'caravanserai' }),
  ),
  buildingRow(
    'loc-tavern',
    'Yawning Portal',
    buildingClassificationSchema.parse({ archetype: 'tavern' }),
  ),
  buildingRow(
    'loc-temple',
    'Temple of Healing',
    buildingClassificationSchema.parse({
      archetype: 'temple',
      functionOverride: 'care',
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
    const filtered = applyFilterSchema(schema, { name: 'lodging' }, rows)

    expect(filtered.map((row) => row.id)).toEqual(
      expect.arrayContaining(['loc-inn', 'loc-caravanserai']),
    )
    expect(filtered.map((row) => row.id)).not.toContain('loc-tavern')
  })

  it('filters by exact building archetype identity', () => {
    const filtered = applyFilterSchema(schema, { buildingArchetype: 'tavern' }, rows)

    expect(filtered.map((row) => row.id)).toEqual(['loc-tavern'])
  })

  it('filters by effective function membership across archetypes', () => {
    const filtered = applyFilterSchema(schema, { buildingFunction: 'lodging' }, rows)

    expect(filtered.map((row) => row.id)).toEqual(
      expect.arrayContaining(['loc-inn', 'loc-caravanserai']),
    )
  })

  it('uses function override semantics without changing archetype identity', () => {
    const byFunction = applyFilterSchema(schema, { buildingFunction: 'care' }, rows)
    const byArchetype = applyFilterSchema(schema, { buildingArchetype: 'temple' }, rows)

    expect(byFunction.map((row) => row.id)).toEqual(['loc-temple'])
    expect(byArchetype.map((row) => row.id)).toEqual(['loc-temple'])
  })
})
