import { describe, expect, it } from 'vitest'
import type { ArrayConfig, FormItem } from '@rpg/ui/form'

import { effectArrayFields } from './effect-form-fields'

function findEffectsArray(fields: FormItem[]): ArrayConfig | undefined {
  return fields.find(
    (field): field is ArrayConfig =>
      'kind' in field && field.kind === 'array' && field.name === 'effects',
  )
}

describe('effectArrayFields', () => {
  it('registers a searchable add menu with four templates', () => {
    const arrayField = findEffectsArray(effectArrayFields({}))
    expect(arrayField?.addMenu?.items).toHaveLength(4)
    expect(arrayField?.addMenu?.items.map((item) => item.id)).toEqual([
      'damage',
      'healing',
      'temporary-hit-points',
      'projectile-count',
    ])
  })

  it('includes kind-specific subfields with visibility guards', () => {
    const arrayField = findEffectsArray(effectArrayFields({}))
    const itemFields = arrayField?.fields ?? []

    expect(itemFields.find((field) => !('kind' in field) && field.name === 'kind')).toMatchObject({
      label: 'Effect kind',
    })

    const damageRow = itemFields.find(
      (field): field is Extract<(typeof itemFields)[number], { kind: 'row' }> =>
        'kind' in field &&
        field.kind === 'row' &&
        Boolean(field.visibility?.dependsOn?.includes('kind')),
    )
    expect(damageRow).toBeDefined()

    const fieldNames = itemFields.flatMap((field) => {
      if ('kind' in field) return []
      if (!('name' in field) || typeof field.name !== 'string') return []
      return [field.name]
    })
    expect(fieldNames[fieldNames.length - 1]).toBe('description')
  })
})
