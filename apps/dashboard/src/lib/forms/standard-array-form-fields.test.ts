import { describe, expect, it } from 'vitest'
import { isContainer, type RowConfig } from '@rpg/ui/form'

import { standardArrayFormFields } from './standard-array-form-fields'

function expectStandardArrayRow(item: ReturnType<typeof standardArrayFormFields>): RowConfig {
  if (!isContainer(item) || item.kind !== 'row') {
    throw new Error('Expected row container')
  }
  return item
}

describe('standardArrayFormFields', () => {
  it('returns a row with heading and six sr-only score inputs', () => {
    const item = expectStandardArrayRow(
      standardArrayFormFields({
        name: 'standardArray',
        label: 'Standard array',
        hint: 'Sets the six fixed scores.',
      }),
    )

    expect(item).toMatchObject({
      kind: 'row',
      separator: 'subtle',
      heading: {
        label: 'Standard array',
        hint: 'Sets the six fixed scores.',
      },
    })

    expect(item.fields).toHaveLength(6)
    expect(item.fields.map((field) => ('name' in field ? field.name : null))).toEqual([
      'standardArray.0',
      'standardArray.1',
      'standardArray.2',
      'standardArray.3',
      'standardArray.4',
      'standardArray.5',
    ])
    expect(
      item.fields.every(
        (field) => 'labelVisibility' in field && field.labelVisibility === 'srOnly',
      ),
    ).toBe(true)
  })
})
