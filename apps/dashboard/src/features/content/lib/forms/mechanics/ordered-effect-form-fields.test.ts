import type { ArrayConfig } from '@rpg/ui/form'
import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import { buildOrderedEffectAddMenu, orderedEffectFormFields } from './ordered-effect-form-fields'

function asArrayField(field: ReturnType<typeof orderedEffectFormFields>): ArrayConfig {
  expect(field.kind).toBe('array')
  return field as ArrayConfig
}

describe('orderedEffectFormFields', () => {
  it('offers damage, condition, and note from the shared menu', () => {
    expect(buildOrderedEffectAddMenu().map((item) => item.id)).toEqual([
      'damage',
      'condition',
      'note',
    ])
  })

  it('can omit damage from a menu that only adds conditions and notes', () => {
    expect(buildOrderedEffectAddMenu(['condition', 'note']).map((item) => item.id)).toEqual([
      'condition',
      'note',
    ])
  })

  it('exposes replace condition when a preceding stage path is set', () => {
    const field = asArrayField(
      orderedEffectFormFields({
        ctx: { damageTypeVocabulary: buildSeedDamageTypeVocabulary() },
        arrayName: 'actions.0.resolution.outcomes.0.repeatSave.secondFailure.effects',
        precedingEffectsPath: 'actions.0.resolution.outcomes.0.effects',
      }),
    )
    expect(
      field.fields?.some((entry) => 'name' in entry && entry.name === 'replacesConditionId'),
    ).toBe(true)
  })
})
