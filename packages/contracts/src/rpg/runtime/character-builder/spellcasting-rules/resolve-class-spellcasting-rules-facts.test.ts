import { describe, expect, it } from 'vitest'

import { spellcastingProgressionTestConfig } from '../../../campaign/rules/spellcasting-progression/fixtures'
import { formatRestRecoveryClause } from '../../../primitives/rest-recovery'
import type { CharacterClass } from '../../../content/classes/class'
import { CLASS_SPELLCASTING_CHOICE_SUFFIXES } from '../../../content/classes/spellcasting'
import {
  findCompiledChoiceProgressionBySuffix,
  resolveCompiledChoiceProgressionQuotaAtLevel,
} from '../../creature/resolve-class-spellcasting'
import { rangerClass, warlockClass, wizardClass } from '../spellcasting-test-fixtures'
import { resolveClassSpellcastingRulesFacts } from './resolve-class-spellcasting-rules-facts'

const spellcastingGrantFeature = (level: number) => ({
  kind: 'spellcasting' as const,
  id: 'spellcasting',
  name: 'Spellcasting',
  level,
})

describe('resolveClassSpellcastingRulesFacts', () => {
  it('reads pact recovery and prepared example levels from compiled progressions', () => {
    const facts = resolveClassSpellcastingRulesFacts({
      characterClass: warlockClass,
      config: spellcastingProgressionTestConfig,
    })

    expect(facts?.isPactMagic).toBe(true)
    expect(formatRestRecoveryClause(facts!.slotRecovery)).toBe(
      'when you finish a Short or Long Rest',
    )
    expect(facts?.pactSlotExample).toBeUndefined()
    expect(facts?.preparedExample).toBeUndefined()
    expect(facts?.leveledSelection?.mutation).toEqual({
      kind: 'replace',
      trigger: 'longRest',
      limit: 1,
    })
  })

  it('exposes half-caster prepared facts and activation eligibility', () => {
    const facts = resolveClassSpellcastingRulesFacts({
      characterClass: rangerClass,
      config: spellcastingProgressionTestConfig,
    })

    expect(facts?.activationLevel).toBe(1)
    expect(facts?.eligibleSpellLevelRangeAtActivation).toBe('level 1')
    expect(facts?.leveledSelection?.quotaAtActivation).toBe(2)
    expect(facts?.focusKinds).toEqual(['druidic_focus'])
    expect(facts?.preparedExample).toEqual({
      classLevel: 5,
      quota: 6,
      eligibleSpellLevels: [1, 2],
      fromSpellbook: false,
    })
  })

  it('rebases facts to a delayed activation level', () => {
    const delayedRanger: CharacterClass = {
      ...rangerClass,
      features: [spellcastingGrantFeature(3)],
    }

    const facts = resolveClassSpellcastingRulesFacts({
      characterClass: delayedRanger,
      config: spellcastingProgressionTestConfig,
    })

    expect(facts?.activationLevel).toBe(3)
    expect(facts?.leveledSelection?.quotaAtActivation).toBe(2)
    expect(facts?.preparedExample).toEqual({
      classLevel: 5,
      quota: 6,
      eligibleSpellLevels: [1, 2],
      fromSpellbook: false,
    })
  })

  it('uses cumulative spellbook gain at a delayed wizard activation', () => {
    const delayedWizard: CharacterClass = {
      ...wizardClass,
      features: [spellcastingGrantFeature(3)],
    }

    const facts = resolveClassSpellcastingRulesFacts({
      characterClass: delayedWizard,
      config: spellcastingProgressionTestConfig,
    })

    expect(facts?.activationLevel).toBe(3)
    expect(facts?.spellbook?.initialCountAtActivation).toBe(6)
    const prepared = findCompiledChoiceProgressionBySuffix(
      facts!.resolved,
      CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared,
      'capacity',
    )
    expect(prepared).toBeDefined()
    expect(resolveCompiledChoiceProgressionQuotaAtLevel(prepared!, 3)).toBe(4)
    expect(facts?.cantrips?.mutation).toEqual({
      kind: 'replace',
      trigger: 'longRest',
      limit: 1,
    })
  })
})
