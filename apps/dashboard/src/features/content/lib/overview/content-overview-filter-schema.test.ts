import { DEFAULT_CONTENT_CAMPAIGN_ACCESS, type WithCampaignAccess } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'
import { applyFilterSchema, createEqualsFilter } from '@rpg/ui/filters'

import { overlayFailureOverviewRows } from '../list/create-content-list'
import { buildContentFilterSchema } from './content-overview-filter-schema'

type Row = WithCampaignAccess<{
  name: string
  catalogLayer: 'system' | 'homebrew'
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
    const schema = buildContentFilterSchema<Row, TestFilterState>('classes', [
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
      'catalogLayer',
      'status',
      'campaignAvailability',
    ])
  })

  it('filters rows through the composed schema', () => {
    const schema = buildContentFilterSchema<Row, TestFilterState>('classes', [])

    const filtered = applyFilterSchema(schema, { name: 'wiz', campaignAvailability: 'all' }, [
      {
        name: 'Wizard',
        catalogLayer: 'system',
        status: 'published',
        hitDie: 6,
        campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      },
      {
        name: 'Fighter',
        catalogLayer: 'system',
        status: 'published',
        hitDie: 10,
        campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      },
    ] satisfies Row[])

    expect(filtered.map((row) => row.name)).toEqual(['Wizard'])
  })

  it('excludes overlay failure rows from explicit domain filters but keeps them on default management filters', () => {
    const schema = buildContentFilterSchema<Row, TestFilterState>('classes', [
      createEqualsFilter<Row, TestFilterState, 'hitDie', string>({
        id: 'hitDie',
        label: 'Hit Die',
        options: [
          { value: '8', label: 'd8' },
          { value: '10', label: 'd10' },
        ],
        getValue: (row) => String(row.hitDie),
      }),
    ])

    const failure = overlayFailureOverviewRows([
      {
        targetId: 'class-broken',
        slug: 'broken',
        name: 'Broken Class',
        code: 'unsupported_overlay_version',
        message: 'Broken',
      },
    ])[0]!
    const rows = [
      {
        name: 'Fighter',
        catalogLayer: 'system',
        status: 'published',
        hitDie: 10,
        campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      },
      failure as unknown as Row,
    ] satisfies Row[]

    const domainFiltered = applyFilterSchema(
      schema,
      { hitDie: '10', campaignAvailability: 'all' },
      rows,
    )
    expect(domainFiltered.map((row) => row.name)).toEqual(['Fighter'])

    const defaultFiltered = applyFilterSchema(schema, { campaignAvailability: 'all' }, rows)
    expect(defaultFiltered.map((row) => row.name)).toEqual(['Fighter', 'Broken Class'])

    const availableFiltered = applyFilterSchema(schema, { campaignAvailability: 'available' }, rows)
    expect(availableFiltered.map((row) => row.name)).toEqual(['Fighter', 'Broken Class'])

    const unavailableFiltered = applyFilterSchema(
      schema,
      { campaignAvailability: 'unavailable' },
      rows,
    )
    expect(unavailableFiltered.map((row) => row.name)).toEqual([])
  })
})
