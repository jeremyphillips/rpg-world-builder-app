import { describe, expect, it } from 'vitest'
import { ZodError } from 'zod'

import { formatFieldMessage } from '../../../../validation/define-message'
import { standardArrayValidationMessages } from '../../../primitives/standard-array-messages'

import { resolveClassAbilityScoreOrder } from './resolve-class-ability-score-order'

describe('resolveClassAbilityScoreOrder', () => {
  it('returns explicit ability order when present and valid', () => {
    expect(
      resolveClassAbilityScoreOrder({
        abilityScoreOrder: ['str', 'dex', 'con', 'cha', 'wis', 'int'],
        primaryAbilities: ['str', 'dex'],
      }),
    ).toEqual(['str', 'dex', 'con', 'cha', 'wis', 'int'])
  })

  it('falls back to primary-ability priority when abilityScoreOrder is missing', () => {
    expect(
      resolveClassAbilityScoreOrder({
        primaryAbilities: ['str', 'dex'],
      }),
    ).toEqual(['str', 'dex', 'con', 'int', 'wis', 'cha'])
  })

  it('throws when abilityScoreOrder is present but invalid', () => {
    try {
      resolveClassAbilityScoreOrder({
        abilityScoreOrder: ['str', 'str', 'con', 'cha', 'wis', 'int'],
        primaryAbilities: ['str'],
      })
      expect.fail('expected ZodError')
    } catch (error) {
      expect(error).toBeInstanceOf(ZodError)
      const zodError = error as ZodError
      expect(formatFieldMessage(zodError.issues[0]?.message ?? '')).toBe(
        formatFieldMessage(standardArrayValidationMessages.incompleteClassOrder()),
      )
    }
  })

  it('does not fall back when abilityScoreOrder is present but invalid', () => {
    expect(() =>
      resolveClassAbilityScoreOrder({
        abilityScoreOrder: ['str', 'dex', 'con'],
        primaryAbilities: ['str', 'dex'],
      }),
    ).toThrow()
  })
})
