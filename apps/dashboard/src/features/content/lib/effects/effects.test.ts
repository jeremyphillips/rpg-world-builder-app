import { describe, expect, it } from 'vitest'

import { buildSeedDamageTypeVocabulary } from '@/features/vocabulary'

import { applicationAmountOptions } from './application-amount-options'
import { orderedEffectRowFields } from './ordered-effect-row-fields'
import { resolveEffectDefinitionPath } from './resolve-effect-definition-path'

describe('resolveEffectDefinitionPath', () => {
  it('resolves the library index for an effect id', () => {
    expect(resolveEffectDefinitionPath('resolution.effects', [{ id: 'a' }, { id: 'b' }], 'b')).toBe(
      'resolution.effects.1',
    )
  })

  it('returns undefined when the id is missing', () => {
    expect(
      resolveEffectDefinitionPath('resolution.effects', [{ id: 'a' }], 'missing'),
    ).toBeUndefined()
  })
})

describe('applicationAmountOptions', () => {
  it('uses damage presentation labels and can omit none', () => {
    expect(applicationAmountOptions(['half', 'full']).map((option) => option.label)).toEqual([
      'Half damage',
      'Full damage',
    ])
    expect(
      applicationAmountOptions(['none', 'half', 'full']).map((option) => option.value),
    ).toEqual(['none', 'half', 'full'])
  })
})

describe('orderedEffectRowFields', () => {
  const ctx = { damageTypeVocabulary: buildSeedDamageTypeVocabulary() }

  it('includes a replace-condition field only for condition rows with a preceding path', () => {
    const condition = orderedEffectRowFields({
      ctx,
      kinds: ['condition'],
      precedingEffectsPath: 'failed.effects',
    })
    const note = orderedEffectRowFields({ ctx, kinds: ['note'] })
    expect(condition.some((field) => 'name' in field && field.name === 'replacesConditionId')).toBe(
      true,
    )
    expect(note.some((field) => 'name' in field && field.name === 'damageType')).toBe(false)
    expect(note.some((field) => 'name' in field && field.name === 'description')).toBe(true)
  })
})
