import { describe, expect, it } from 'vitest'

import {
  buildCharacterPreview,
  createEmptyCharacterBuilderDraft,
  formatProficiencyChoiceEmptyMessage,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from './character-builder-fixtures'
import {
  countProficiencyChoicesRemaining,
  formatPreviewLanguagesSubsection,
  formatPreviewSavingThrowsSubsection,
  formatPreviewSkillsSubsection,
  PREVIEW_PENDING_ABILITY_LABEL,
  PREVIEW_SAVING_THROWS_NO_CLASS_HINT,
} from './format-preview-proficiency-subsection.lib'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)

describe('formatPreviewProficiencySubsection', () => {
  it('shows pending on class saving throws when ability scores are incomplete', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
      { resolvedChoiceSets },
    )

    expect(formatPreviewSavingThrowsSubsection(preview, true)).toEqual({
      resolvedText: `STR ${PREVIEW_PENDING_ABILITY_LABEL}, CON ${PREVIEW_PENDING_ABILITY_LABEL}`,
      emptyHint: null,
      remainingText: null,
    })
  })

  it('keeps Common visible without an empty languages hint', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
      { resolvedChoiceSets },
    )
    const languageChoicesRemaining = countProficiencyChoicesRemaining(
      resolvedChoiceSets,
      draft,
      'language',
    )

    expect(
      formatPreviewLanguagesSubsection(preview, catalogIndex, languageChoicesRemaining),
    ).toEqual({
      resolvedText: 'Common',
      emptyHint: null,
      remainingText: `${languageChoicesRemaining} language choices remaining`,
    })
  })

  it('shows skill labels and remaining counts from choice sets', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
      choiceSelections: {
        'class:srd-cc-5.2.1:fighter:class-skills': ['srd-cc-5.2.1:athletics'],
      },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
      { resolvedChoiceSets },
    )
    const skillChoicesRemaining = countProficiencyChoicesRemaining(
      resolvedChoiceSets,
      draft,
      'skillProficiency',
    )

    expect(formatPreviewSkillsSubsection(preview, skillChoicesRemaining)).toEqual({
      resolvedText: 'Athletics',
      emptyHint: null,
      remainingText: '1 skill choice remaining',
    })
  })

  it('shows the no-class saving throw hint', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
      { resolvedChoiceSets },
    )

    expect(formatPreviewSavingThrowsSubsection(preview, false)).toEqual({
      resolvedText: null,
      emptyHint: PREVIEW_SAVING_THROWS_NO_CLASS_HINT,
      remainingText: null,
    })
  })

  it('shows the skills empty hint when no proficiencies are resolved', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)
    const preview = buildCharacterPreview(
      draft,
      catalogIndex,
      context.characterCreationRules,
      context.rulesetId,
      { resolvedChoiceSets },
    )

    expect(
      formatPreviewSkillsSubsection(
        preview,
        countProficiencyChoicesRemaining(resolvedChoiceSets, draft, 'skillProficiency'),
      ).emptyHint,
    ).toBe(formatProficiencyChoiceEmptyMessage('skillProficiency'))
  })
})
