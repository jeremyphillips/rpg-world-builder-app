import { describe, expect, it } from 'vitest'

import { IMMUTABLE_SPELL_MUTATION } from '../../vocab/spell/spell-mutation-policy'
import { CLASS_SPELLCASTING_CHOICE_SUFFIXES } from '../../content/classes/spellcasting'
import { spellcastingProgressionTestConfig } from '../../campaign/rules/spellcasting-progression/fixtures'
import { resolveSlotProgressionForClass } from '../../campaign/rules/spellcasting-progression/resolve-config'
import { wizardClass } from '../character-builder/spellcasting-test-fixtures'
import { findCompiledChoiceProgressionBySuffix } from './resolve-class-spellcasting'

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

  it('compiles cantrip mutation from cantripSelection.change', () => {
    const resolved = resolveClassSpellcasting(wizardClass, spellcastingProgressionTestConfig)
    const cantrips = findCompiledChoiceProgressionBySuffix(
      resolved!,
      CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips,
    )
    expect(cantrips?.mutation).toEqual({
      kind: 'replace',
      trigger: 'longRest',
      limit: 1,
    })
  })

  it('defaults cantrip mutation to immutable when change is absent', () => {
    const withoutChange = {
      ...wizardClass,
      spellcasting: {
        ...wizardClass.spellcasting!,
        cantripSelection: undefined,
      },
    }
    const resolved = resolveClassSpellcasting(withoutChange, spellcastingProgressionTestConfig)
    const cantrips = findCompiledChoiceProgressionBySuffix(
      resolved!,
      CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips,
    )
    expect(cantrips?.mutation).toEqual(IMMUTABLE_SPELL_MUTATION)
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
