import { afterEach, describe, expect, it, vi } from 'vitest'

import { createEqualsFilter } from './filter-engine.helpers'
import { createFilterSchema } from './filter-schema.types'
import {
  prepareDatatableFilterSchemaForRender,
  validateDatatableFilterSchema,
} from './validate-datatable-filter-schema'

type Row = { id: string }
type State = { role?: string }

describe('validateDatatableFilterSchema', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('allows omitted select layout', () => {
    const schema = createFilterSchema<Row, State>([
      createEqualsFilter<Row, State, 'role', string>({
        id: 'role',
        label: 'Role',
        options: [{ value: 'a', label: 'A' }],
        getValue: (row) => row.id,
      }),
    ])

    expect(() => validateDatatableFilterSchema(schema)).not.toThrow()
  })

  it('throws in development when select layout is stacked', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const schema = createFilterSchema<Row, State>([
      createEqualsFilter<Row, State, 'role', string>({
        id: 'role',
        label: 'Role',
        layout: 'stacked',
        options: [{ value: 'a', label: 'A' }],
        getValue: (row) => row.id,
      }),
    ])

    expect(() => validateDatatableFilterSchema(schema)).toThrow(/layout "stacked"/)
    expect(errorSpy).toHaveBeenCalled()
  })

  it('prepareDatatableFilterSchemaForRender strips select layout for floating policy', () => {
    const schema = createFilterSchema<Row, State>([
      createEqualsFilter<Row, State, 'role', string>({
        id: 'role',
        label: 'Role',
        layout: 'stacked',
        options: [{ value: 'a', label: 'A' }],
        getValue: (row) => row.id,
      }),
    ])

    vi.stubEnv('NODE_ENV', 'production')

    const prepared = prepareDatatableFilterSchemaForRender(schema)
    expect(prepared.fields[0]?.type === 'select' && prepared.fields[0].layout).toBeUndefined()
  })
})
