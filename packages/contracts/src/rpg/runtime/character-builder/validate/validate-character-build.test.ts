import { describe, expect, it } from 'vitest'

import { characterBuilderValidationMessages } from '../character-builder-messages'
import { formatFieldMessage } from '../../../../validation/define-message'
import { abilityValidationMessages } from '../../../vocab/ability-messages'
import { createEmptyCharacterBuilderDraft } from '../draft'
import type { CharacterBuilderDraft } from '../draft'
import { builderTestContext } from '../test-fixtures'
import {
  highLevelWizardSpell,
  spellcastingTestContext,
  wizardCantrips,
  wizardClass,
  wizardLevelOneSpells,
} from '../spellcasting-test-fixtures'
import { validateCharacterBuild } from './validate-character-build'

function makeCompleteDraft(overrides: Partial<CharacterBuilderDraft> = {}): CharacterBuilderDraft {
  return {
    ...createEmptyCharacterBuilderDraft(),
    identity: { name: 'Verna', alignment: 'ng' },
    species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    class: { classId: 'srd-cc-5.2.1:fighter', level: 1 },
    abilities: {
      method: 'standard-array',
      scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
    },
    ...overrides,
  }
}

describe('validateCharacterBuild', () => {
  it('draft phase always returns ok with advisory issues', () => {
    const result = validateCharacterBuild(
      createEmptyCharacterBuilderDraft(),
      builderTestContext,
      'draft',
    )
    expect(result.ok).toBe(true)
    expect(result.issues.length).toBeGreaterThan(0)
  })

  it('stepSubmit blocks identity when name is missing', () => {
    const result = validateCharacterBuild(
      createEmptyCharacterBuilderDraft(),
      builderTestContext,
      'stepSubmit',
      { stepId: 'identity' },
    )
    expect(result.ok).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'name_required')).toBe(true)
  })

  it('stepSubmit skips choice steps when resolvedChoiceSets is null', () => {
    const result = validateCharacterBuild(makeCompleteDraft(), builderTestContext, 'stepSubmit', {
      stepId: 'proficiencies',
      resolvedChoiceSets: null,
    })
    expect(result.ok).toBe(true)
  })

  it('enforces standard-array multiset only when method is standard-array', () => {
    const invalidStandard = validateCharacterBuild(
      makeCompleteDraft({
        abilities: {
          method: 'standard-array',
          scores: { str: 16, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
        },
      }),
      builderTestContext,
      'stepSubmit',
      { stepId: 'abilities' },
    )
    expect(invalidStandard.ok).toBe(false)
    expect(
      invalidStandard.issues.some((issue) => issue.code === 'standard_array_exact_assignment'),
    ).toBe(true)
    expect(
      invalidStandard.issues.find((issue) => issue.code === 'standard_array_exact_assignment')
        ?.message,
    ).toBe(formatFieldMessage(characterBuilderValidationMessages.standardArrayExactAssignment()))

    const manualOk = validateCharacterBuild(
      makeCompleteDraft({
        abilities: {
          method: 'manual',
          scores: { str: 16, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
        },
      }),
      builderTestContext,
      'stepSubmit',
      { stepId: 'abilities' },
    )
    expect(manualOk.ok).toBe(true)
  })

  it('reports out-of-range ability scores with the range message', () => {
    const belowMin = validateCharacterBuild(
      makeCompleteDraft({
        abilities: {
          method: 'manual',
          scores: { str: 0, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
        },
      }),
      builderTestContext,
      'stepSubmit',
      { stepId: 'abilities' },
    )

    expect(belowMin.ok).toBe(false)
    expect(belowMin.issues.some((issue) => issue.code === 'ability_score_out_of_range')).toBe(true)
    expect(belowMin.issues[0]?.message).toBe(
      formatFieldMessage(abilityValidationMessages.characterScoreOutOfRange({ min: 1, max: 20 })),
    )
    expect(belowMin.issues[0]?.message).not.toContain('"f":')
  })

  it('finalSubmit requires alignment and all core steps', () => {
    const missingAlignment = validateCharacterBuild(
      makeCompleteDraft({ identity: { name: 'Verna' } }),
      builderTestContext,
      'finalSubmit',
    )
    expect(missingAlignment.ok).toBe(false)
    expect(missingAlignment.issues.some((issue) => issue.code === 'alignment_required')).toBe(true)

    const complete = validateCharacterBuild(makeCompleteDraft(), builderTestContext, 'finalSubmit')
    expect(complete.ok).toBe(true)
  })

  it('validates required ChoiceSet min/max on finalSubmit', () => {
    const result = validateCharacterBuild(makeCompleteDraft(), builderTestContext, 'finalSubmit', {
      resolvedChoiceSets: [
        {
          id: 'class:srd-cc-5.2.1:fighter:skills',
          sourceType: 'class',
          sourceId: 'srd-cc-5.2.1:fighter',
          choiceType: 'skillProficiency',
          label: 'Choose Skills',
          min: 2,
          max: 2,
          options: [{ id: 'srd-cc-5.2.1:athletics', label: 'Athletics' }],
          required: true,
        },
      ],
    })

    expect(result.ok).toBe(false)
    expect(result.issues.some((issue) => issue.code === 'choice_set_unsatisfied')).toBe(true)
  })

  it('reports spell-specific choose, remove, stale, and wrong-level issues', () => {
    const cantripChoiceSet = {
      id: `spellcasting:${wizardClass.id}:cantrips`,
      sourceType: 'spellcasting' as const,
      sourceId: wizardClass.id,
      choiceType: 'cantrip' as const,
      label: 'Cantrips',
      min: 2,
      max: 2,
      options: wizardCantrips.slice(0, 2).map((spell) => ({ id: spell.id, label: spell.name })),
      required: true,
    }
    const spellChoiceSet = {
      id: `spellcasting:${wizardClass.id}:spells`,
      sourceType: 'spellcasting' as const,
      sourceId: wizardClass.id,
      choiceType: 'spell' as const,
      label: 'Prepared Spells',
      min: 1,
      max: 1,
      options: [{ id: wizardLevelOneSpells[0]!.id, label: wizardLevelOneSpells[0]!.name }],
      required: true,
    }
    const wizardDraft = makeCompleteDraft({
      species: { speciesId: 'srd-cc-5.2.1:fixture-dwarf' },
      class: { classId: wizardClass.id, level: 1 },
    })

    const unsatisfied = validateCharacterBuild(
      {
        ...wizardDraft,
        choiceSelections: {
          [cantripChoiceSet.id]: [wizardCantrips[0]!.id],
        },
      },
      spellcastingTestContext,
      'stepSubmit',
      {
        stepId: 'spells',
        resolvedChoiceSets: [cantripChoiceSet, spellChoiceSet],
      },
    )

    expect(unsatisfied.ok).toBe(false)
    expect(
      unsatisfied.issues.some(
        (issue) =>
          issue.code === 'choice_set_unsatisfied' &&
          issue.message ===
            formatFieldMessage(characterBuilderValidationMessages.chooseCantrips({ count: 1 })),
      ),
    ).toBe(true)
    expect(
      unsatisfied.issues.some(
        (issue) =>
          issue.code === 'choice_set_unsatisfied' &&
          issue.message ===
            formatFieldMessage(characterBuilderValidationMessages.chooseSpells({ count: 1 })),
      ),
    ).toBe(true)

    const tooMany = validateCharacterBuild(
      {
        ...wizardDraft,
        choiceSelections: {
          [cantripChoiceSet.id]: wizardCantrips.slice(0, 3).map((spell) => spell.id),
        },
      },
      spellcastingTestContext,
      'stepSubmit',
      {
        stepId: 'spells',
        resolvedChoiceSets: [cantripChoiceSet],
      },
    )

    expect(tooMany.ok).toBe(false)
    expect(tooMany.issues[0]?.message).toBe(
      formatFieldMessage(characterBuilderValidationMessages.removeCantrips({ count: 1 })),
    )

    const stale = validateCharacterBuild(
      {
        ...wizardDraft,
        choiceSelections: {
          [cantripChoiceSet.id]: [wizardCantrips[0]!.id, 'srd-cc-5.2.1:removed-cantrip'],
        },
      },
      spellcastingTestContext,
      'stepSubmit',
      {
        stepId: 'spells',
        resolvedChoiceSets: [cantripChoiceSet],
      },
    )

    expect(stale.ok).toBe(false)
    expect(stale.issues.some((issue) => issue.code === 'spell_no_longer_available')).toBe(true)
    expect(stale.issues.find((issue) => issue.code === 'spell_no_longer_available')?.message).toBe(
      formatFieldMessage(
        characterBuilderValidationMessages.spellNoLongerAvailable({
          spellLabel: 'srd-cc-5.2.1:removed-cantrip',
        }),
      ),
    )

    const wrongLevel = validateCharacterBuild(
      {
        ...wizardDraft,
        choiceSelections: {
          [spellChoiceSet.id]: [highLevelWizardSpell.id],
        },
      },
      spellcastingTestContext,
      'stepSubmit',
      {
        stepId: 'spells',
        resolvedChoiceSets: [spellChoiceSet],
      },
    )

    expect(wrongLevel.ok).toBe(false)
    expect(wrongLevel.issues[0]?.code).toBe('spell_not_selectable_at_level')
    expect(wrongLevel.issues[0]?.message).toBe(
      formatFieldMessage(
        characterBuilderValidationMessages.spellNotSelectableAtLevel({
          spellLabel: 'Fireball',
          maxLevel: 1,
        }),
      ),
    )
  })
})
