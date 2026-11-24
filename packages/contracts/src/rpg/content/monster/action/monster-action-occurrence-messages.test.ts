import { describe, expect, it } from 'vitest'

import { formatFieldMessage } from '../../../../validation/define-message'

import { monsterActionOccurrenceMessages } from './monster-action-occurrence-messages'

describe('monsterActionOccurrenceMessages', () => {
  it('assigns stable unique ids under validation.monsterActionOccurrence.*', () => {
    const ids = Object.values(monsterActionOccurrenceMessages).map((message) => message.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) {
      expect(id).toMatch(/^validation\.monsterActionOccurrence\.[a-zA-Z]+$/)
    }
  })

  it('preserves pilot display wording for representative invocations', () => {
    expect(formatFieldMessage(monsterActionOccurrenceMessages.primarySpellcastingDuplicate())).toBe(
      'Only one Spellcasting profile is allowed.',
    )
    expect(
      formatFieldMessage(monsterActionOccurrenceMessages.singletonKind({ kind: 'multiattack' })),
    ).toBe('Only one Multiattack action is allowed.')
    expect(formatFieldMessage(monsterActionOccurrenceMessages.weaponEquipmentDuplicate())).toBe(
      'Each equipped weapon can have only one weapon action.',
    )
  })
})
