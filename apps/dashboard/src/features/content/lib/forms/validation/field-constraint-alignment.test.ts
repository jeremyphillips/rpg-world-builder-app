import { describe, expect, it } from 'vitest'

import { flattenFields, type FieldConfig } from '@rpg/ui/form'

import { coreAttributesFields } from '../../../classes/lib/class-basics-form-fields'
import { createClassFormSchema } from '../../../classes/lib/class-form-fields'
import { proficienciesFields } from '../../../classes/lib/class-proficiencies-form-fields'

function findField(
  fields: ReturnType<typeof flattenFields>,
  name: string,
): FieldConfig | undefined {
  return fields.find((field) => 'name' in field && field.name === name)
}

describe('field constraint alignment', () => {
  it('keeps primaryAbilities config bounds aligned with publish schema', () => {
    const field = findField(flattenFields(coreAttributesFields()), 'primaryAbilities')
    expect(field?.type).toBe('chips')
    if (field?.type !== 'chips') return

    expect(field.min).toBe(1)
    expect(field.max).toBe(2)
    expect(field.noun).toEqual({
      singular: 'primary ability',
      plural: 'primary abilities',
    })

    const schema = createClassFormSchema().shape.primaryAbilities
    expect(schema.safeParse([]).success).toBe(false)
    expect(schema.safeParse(['str']).success).toBe(true)
    expect(schema.safeParse(['str', 'dex']).success).toBe(true)
    expect(schema.safeParse(['str', 'dex', 'con']).success).toBe(false)
  })

  it('keeps savingThrows config bounds aligned with proficiencies schema', () => {
    const field = findField(flattenFields(proficienciesFields({})), 'proficiencies.savingThrows')
    expect(field?.type).toBe('chips')
    if (field?.type !== 'chips') return

    expect(field.min).toBe(1)
    expect(field.max).toBe(2)
    expect(field.noun).toEqual({
      singular: 'saving throw',
      plural: 'saving throws',
    })
  })
})
