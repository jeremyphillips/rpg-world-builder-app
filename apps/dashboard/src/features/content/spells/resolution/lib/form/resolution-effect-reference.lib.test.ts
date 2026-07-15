import { describe, expect, it } from 'vitest'

import {
  formatEffectReferenceDescription,
  formatEffectReferenceTitle,
  resolveEffectReference,
  resolveEffectReferenceById,
} from './resolution-effect-reference.lib'

const completeDamageEffect = {
  id: 'fx-damage',
  kind: 'damage' as const,
  roll: { dice: { count: 8, faces: 6 as const } },
  damageType: 'fire',
}

describe('resolveEffectReference', () => {
  it('returns resolved display for complete effects', () => {
    const reference = resolveEffectReference(completeDamageEffect)

    expect(reference.kind).toBe('resolved')
    if (reference.kind !== 'resolved') return

    expect(formatEffectReferenceTitle(reference)).toBe('Damage — 8d6 Fire damage')
  })

  it('returns incomplete reference state without contracts incomplete labels in display', () => {
    const reference = resolveEffectReference({
      id: 'fx-damage',
      kind: 'damage',
      roll: {},
      damageType: 'fire',
    })

    expect(reference.kind).toBe('incomplete')
    expect(formatEffectReferenceTitle(reference)).toBe('Damage — Incomplete effect')
    if (reference.kind === 'incomplete') {
      expect(formatEffectReferenceDescription(reference)).toBe('Complete the damage roll.')
    }
  })
})

describe('resolveEffectReferenceById', () => {
  it('returns missing state when effect id is not found', () => {
    const reference = resolveEffectReferenceById([], 'missing-id')

    expect(reference).toEqual({ kind: 'missing', effectId: 'missing-id' })
    expect(formatEffectReferenceTitle(reference)).toBe('Unknown effect: missing-id')
  })
})
