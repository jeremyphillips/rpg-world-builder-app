import { describe, expect, it } from 'vitest'
import { isContainer, type GroupConfig } from '@rpg/ui/form'

import { standardArrayFormFields } from './standard-array-form-fields'

function expectStandardArrayGroup(item: ReturnType<typeof standardArrayFormFields>): GroupConfig {
  if (!isContainer(item) || item.kind !== 'group') {
    throw new Error('Expected group container')
  }
  return item
}

describe('standardArrayFormFields', () => {
  it('returns a subsection group with legend, description, and six row inputs', () => {
    const item = expectStandardArrayGroup(
      standardArrayFormFields({
        name: 'standardArray',
        label: 'Standard array',
        hint: 'Sets the six fixed scores.',
      }),
    )

    expect(item).toMatchObject({
      kind: 'group',
      legend: 'Standard array',
      description: 'Sets the six fixed scores.',
      legendSize: 'subsection',
    })

    const row = item.fields[0]
    expect(row).toMatchObject({ kind: 'row' })
    if (!row || !isContainer(row) || row.kind !== 'row') {
      throw new Error('Expected row container')
    }

    expect(row.fields).toHaveLength(6)
    expect(row.fields.map((field) => ('name' in field ? field.name : null))).toEqual([
      'standardArray.0',
      'standardArray.1',
      'standardArray.2',
      'standardArray.3',
      'standardArray.4',
      'standardArray.5',
    ])
  })
})
