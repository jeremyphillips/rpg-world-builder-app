import { describe, expect, it } from 'vitest'

import { spellcastingProgressionTestConfig } from '../../campaign/rules/spellcasting-progression/fixtures'
import { resolveSlotProgressionForClass } from '../../campaign/rules/spellcasting-progression/resolve-profile'
import { wizardClass } from '../character-builder/spellcasting-test-fixtures'

import {
  resolveClassSpellcasting,
  resolveSpellsAvailableFromClass,
} from './resolve-class-spellcasting'

describe('resolveClassSpellcasting', () => {
  it('resolves slot progression independently from class selection', () => {
    const resolved = resolveClassSpellcasting(wizardClass, spellcastingProgressionTestConfig)
    expect(resolved?.slotProgression.id).toBe('full-caster')
    expect(resolved?.choiceProgressions.map((entry) => entry.suffix)).toEqual([
      'cantrips',
      'spellbook',
      'prepared',
    ])
  })

  it('resolves prepared spell quota from class progression', () => {
    const resolved = resolveClassSpellcasting(wizardClass, spellcastingProgressionTestConfig)
    expect(resolved).not.toBeNull()
    expect(resolveSpellsAvailableFromClass(resolved!, 1)).toBe(4)
  })

  it('returns null when slot progression id is unknown', () => {
    expect(
      resolveSlotProgressionForClass(
        {
          spellcasting: {
            ...wizardClass.spellcasting!,
            slotProgressionId: 'missing',
          },
        },
        spellcastingProgressionTestConfig,
      ),
    ).toBeNull()
  })
})
