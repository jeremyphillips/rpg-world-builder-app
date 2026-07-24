import { describe, expect, it } from 'vitest'
import { applyFilterSchema } from '@rpg/ui/filters'

import { buildContentFilters } from './content-table-config'
import { createFilterSchemaFromFilterDefs } from './filter-def-schema.adapter'

type TestRow = {
  name: string
  source: 'system' | 'homebrew'
  status: 'draft' | 'published'
  campaignAccess: { available: boolean }
}

const rows: TestRow[] = [
  {
    name: 'Wizard',
    source: 'system',
    status: 'published',
    campaignAccess: { available: true },
  },
  {
    name: 'Warlock',
    source: 'homebrew',
    status: 'draft',
    campaignAccess: { available: false },
  },
]

describe('createFilterSchemaFromFilterDefs', () => {
  it('adapts shared content filters into a schema that filters rows', () => {
    const schema = createFilterSchemaFromFilterDefs(
      buildContentFilters([
        {
          type: 'select',
          id: 'status',
          label: 'Status',
          options: [{ label: 'Draft', value: 'draft' }],
        },
      ]),
    )

    const filtered = applyFilterSchema(
      schema,
      { status: 'draft', campaignAvailability: 'all' },
      rows as never,
    )
    expect(filtered.map((row) => row.name)).toEqual(['Warlock'])
  })

  it('preserves campaign availability defaults and filtering', () => {
    const schema = createFilterSchemaFromFilterDefs(buildContentFilters([]))

    const availableOnly = applyFilterSchema(schema, {}, rows as never)
    expect(availableOnly.map((row) => row.name)).toEqual(['Wizard'])

    const allRows = applyFilterSchema(schema, { campaignAvailability: 'all' }, rows as never)
    expect(allRows).toHaveLength(2)
  })
})
