import { describe, expect, it } from 'vitest'
import type { ArrayConfig, FormItem } from '@rpg/ui/form'

import { resolutionFields } from './resolution-form-fields'

function findResolutionEffectsArray(fields: FormItem[]): ArrayConfig | undefined {
  const resolutionGroup = fields.find(
    (field): field is Extract<FormItem, { kind: 'group' }> =>
      'kind' in field && field.kind === 'group' && field.legend === 'Resolution',
  )
  if (!resolutionGroup) return undefined

  const effectsGroup = resolutionGroup.fields.find(
    (field): field is Extract<FormItem, { kind: 'group' }> =>
      'kind' in field && field.kind === 'group' && field.legend === 'Effects',
  )
  if (!effectsGroup) return undefined

  return effectsGroup.fields.find(
    (field): field is ArrayConfig =>
      'kind' in field && field.kind === 'array' && field.name === 'resolution.effects',
  )
}

describe('resolutionFields effects array', () => {
  it('registers a searchable add menu with three resolution templates', () => {
    const arrayField = findResolutionEffectsArray(resolutionFields({}))
    expect(arrayField?.addMenu?.items).toHaveLength(3)
    expect(arrayField?.addMenu?.items.map((item) => item.id)).toEqual([
      'damage',
      'healing',
      'temporary-hit-points',
    ])
  })

  it('does not expose a kind selector; kind is fixed at add time via templates', () => {
    const itemFields = findResolutionEffectsArray(resolutionFields({}))?.fields ?? []
    expect(itemFields.find((field) => !('kind' in field) && field.name === 'kind')).toBeUndefined()
  })
})
