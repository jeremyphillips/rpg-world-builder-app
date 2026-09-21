import { describe, expect, it } from 'vitest'

import { CLASS_SPELLCASTING_CHOICE_SUFFIXES } from '../../../../content/classes/spellcasting'
import type { ChoiceSet } from '../../choice-set'
import { paladinClass, wizardClass } from '../../spellcasting-test-fixtures'
import { resolveSpellcastingProfile } from './builder-spellcasting'
import { spellcastingChoiceSetId } from './resolve-spellcasting-choice-sets'
import {
  resolveSpellAcquisitionDestination,
  resolveSpellChoiceCounterVerb,
} from './resolve-spell-choice-counter-verb'
import { createEmptyCharacterBuilderDraft } from '../../draft/draft'
import { spellcastingTestContext } from '../../spellcasting-test-fixtures'

function spellChoiceSet(classId: string, suffix: string): ChoiceSet {
  return {
    id: spellcastingChoiceSetId(classId, suffix),
    sourceType: 'spellcasting',
    sourceId: classId,
    choiceType: 'spell',
    label: 'Spells',
    min: 4,
    max: 4,
    required: true,
    options: [],
  }
}

describe('resolveSpellAcquisitionDestination', () => {
  it('treats prepared-from-class-list as classList, not deferred spellbook prep', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: paladinClass.id, level: 1 },
    }
    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)!
    const prepared = spellChoiceSet(paladinClass.id, CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared)

    expect(resolveSpellAcquisitionDestination(prepared, profile)).toBe('classList')
  })

  it('treats wizard prepared loadout as deferredPrepared', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: wizardClass.id, level: 1 },
    }
    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)!
    const prepared = spellChoiceSet(wizardClass.id, CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared)

    expect(resolveSpellAcquisitionDestination(prepared, profile)).toBe('deferredPrepared')
  })

  it('uses learned for spellbook and prepared for repertoire', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: wizardClass.id, level: 1 },
    }
    const profile = resolveSpellcastingProfile(draft, spellcastingTestContext)!

    expect(
      resolveSpellChoiceCounterVerb(
        spellChoiceSet(wizardClass.id, CLASS_SPELLCASTING_CHOICE_SUFFIXES.spellbook),
        profile,
      ),
    ).toBe('learned')
    expect(
      resolveSpellChoiceCounterVerb(
        spellChoiceSet(wizardClass.id, CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared),
        profile,
      ),
    ).toBe('prepared')
  })
})
