import { describe, expect, it } from 'vitest'
import { ABILITY_SCORE_MIN, CHARACTER_ABILITY_SCORE_MAX } from '@rpg/contracts'
import { isContainer, type NumberFieldConfig, type RowConfig } from '@rpg/ui/form'

import { standardArrayFormFields } from './standard-array-form-fields'

function expectStandardArrayRow(item: ReturnType<typeof standardArrayFormFields>): RowConfig {
  if (!isContainer(item) || item.kind !== 'row') {
    throw new Error('Expected row container')
  }
  return item
}

function expectNumberField(field: RowConfig['fields'][number]): NumberFieldConfig {
  if (!('type' in field) || field.type !== 'number') {
    throw new Error('Expected number field')
  }
  return field
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
      spacing: 'compact',
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

  it('projects contract ability score bounds onto each score input', () => {
    const item = expectStandardArrayRow(standardArrayFormFields())

    for (const field of item.fields) {
      const numberField = expectNumberField(field)
      expect(numberField.min).toBe(ABILITY_SCORE_MIN)
      expect(numberField.max).toBe(CHARACTER_ABILITY_SCORE_MAX)
    }
  })
})
