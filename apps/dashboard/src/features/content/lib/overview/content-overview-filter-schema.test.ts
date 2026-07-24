import { DEFAULT_CONTENT_CAMPAIGN_ACCESS, type WithCampaignAccess } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'
import { applyFilterSchema, createEqualsFilter } from '@rpg/ui/filters'

import { buildContentFilterSchema } from './content-overview-filter-schema'

type Row = WithCampaignAccess<{
  name: string
  source: 'system' | 'homebrew'
  status: 'draft' | 'published'
  hitDie: number
}>

type TestFilterState = {
  name?: string
  hitDie?: string
  campaignAvailability?: 'available' | 'unavailable' | 'all'
}

describe('content-overview-filter-schema', () => {
  it('builds shared overview filters in schema order', () => {
    const schema = buildContentFilterSchema<Row, TestFilterState>([
      createEqualsFilter<Row, TestFilterState, 'hitDie', string>({
        id: 'hitDie',
        label: 'Hit Die',
        options: [{ value: '8', label: 'd8' }],
        getValue: (row) => String(row.hitDie),
      }),
    ])

    expect(schema.fields.map((field) => field.id)).toEqual([
      'name',
      'hitDie',
      'source',
      'status',
      'campaignAvailability',
    ])
  })

  it('filters rows through the composed schema', () => {
    const schema = buildContentFilterSchema<Row, TestFilterState>([])

    const filtered = applyFilterSchema(
      schema,
      { name: 'wiz', campaignAvailability: 'all' },
      [
        {
          name: 'Wizard',
          source: 'system',
          status: 'published',
          hitDie: 6,
          campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        },
        {
          name: 'Fighter',
          source: 'system',
          status: 'published',
          hitDie: 10,
          campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        },
      ],
    )

    expect(filtered.map((row) => row.name)).toEqual(['Wizard'])
  })
})
