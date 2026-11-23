import { describe, expect, it } from 'vitest'

import { CLASS_SPELLCASTING_CHOICE_SUFFIXES } from '../../../content/classes/spellcasting'
import { spellcastingProgressionTestConfig } from '../../../campaign/rules/spellcasting-progression/fixtures'
import { createEmptyCharacterBuilderDraft } from '../draft/draft'
import type { ChoiceSet } from '../choice-set'
import {
  rangerClass,
  spellcastingTestContext,
  warlockClass,
  wizardCantrips,
  wizardClass,
} from '../spellcasting-test-fixtures'
import { assembleClassSpellcasting } from './assemble-spellcasting'
import {
  resolveClassSpellcasting,
  resolveCompiledChoiceProgressionQuotaAtLevel,
} from '../../creature/resolve-class-spellcasting'

function spellcastingChoiceSet(classId: string, suffix: string, max: number): ChoiceSet {
  return {
    id: `spellcasting:${classId}:${suffix}`,
    sourceType: 'spellcasting',
    sourceId: classId,
    choiceType: 'spell',
    label: suffix,
    min: max,
    max,
    options: [],
    required: true,
  }
}

describe('assembleClassSpellcasting membership', () => {
  it('marks cantrips mutable when cantrip replacement is configured', () => {
    const choiceSets = [
      spellcastingChoiceSet(wizardClass.id, CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips, 3),
    ]
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: wizardClass.id, level: 1 },
      choiceSelections: {
        [choiceSets[0]!.id]: wizardCantrips.slice(0, 3).map((entry) => entry.id),
      },
    }

    const entries = assembleClassSpellcasting(draft, spellcastingTestContext, choiceSets)
    expect(entries[0]?.collections).toEqual([{ kind: 'cantrips', mutable: true }])
  })

  it('marks repertoire and prepared mutable for replace policies', () => {
    const resolved = resolveClassSpellcasting(warlockClass, spellcastingProgressionTestConfig)!
    const repertoire = resolved.choiceProgressions.find(
      (entry) => entry.suffix === CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire,
    )!
    expect(repertoire.mutation.kind).toBe('replace')

    const choiceSets = [
      spellcastingChoiceSet(warlockClass.id, CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire, 2),
    ]
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: warlockClass.id, level: 1 },
      choiceSelections: { [choiceSets[0]!.id]: ['srd-cc-5.2.1:hex'] },
    }

    const entries = assembleClassSpellcasting(draft, spellcastingTestContext, choiceSets)
    expect(entries[0]?.collections).toEqual([{ kind: 'repertoire', mutable: true }])
  })

  it('marks ranger prepared loadout mutable under prepareFromClassList', () => {
    const choiceSets = [
      spellcastingChoiceSet(rangerClass.id, CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared, 2),
    ]
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: rangerClass.id, level: 1 },
      choiceSelections: {
        [choiceSets[0]!.id]: ['srd-cc-5.2.1:bless', 'srd-cc-5.2.1:cure-wounds'],
      },
    }

    const entries = assembleClassSpellcasting(draft, spellcastingTestContext, choiceSets)
    expect(entries[0]?.collections).toEqual([{ kind: 'prepared', mutable: true }])
  })
})

describe('ranger prepared quota', () => {
  it('keeps prepared quotas at levels 1, 5, and 20', () => {
    const resolved = resolveClassSpellcasting(rangerClass, spellcastingProgressionTestConfig)!
    const prepared = resolved.choiceProgressions.find(
      (entry) => entry.suffix === CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared,
    )!
    expect(resolveCompiledChoiceProgressionQuotaAtLevel(prepared, 1)).toBe(2)
    expect(resolveCompiledChoiceProgressionQuotaAtLevel(prepared, 5)).toBe(6)
    expect(resolveCompiledChoiceProgressionQuotaAtLevel(prepared, 20)).toBe(15)
  })
})
