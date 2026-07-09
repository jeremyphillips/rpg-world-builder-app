import { describe, expect, it } from 'vitest'

import {
  createEmptyCharacterBuilderDraft,
  indexCharacterBuildCatalog,
  resolveAvailableChoices,
} from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from './character-builder-fixtures'
import { createSpellsStepContextFixture } from './spells-step.fixtures'
import {
  resolveStepVisualStatus,
  stepStatusAriaLabel,
  type ResolveStepVisualStatusInput,
} from './builder-step-visual-status'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)
const standardArray = context.characterCreationRules.abilityGeneration.standardArray

function resolveStatus(
  input: Pick<ResolveStepVisualStatusInput, 'stepId' | 'draft' | 'currentStepId'> &
    Partial<ResolveStepVisualStatusInput>,
): ReturnType<typeof resolveStepVisualStatus> {
  return resolveStepVisualStatus({
    context,
    resolvedChoiceSets: null,
    validationIssues: [],
    draftValidationIssues: [],
    attemptedStepIds: [],
    catalogIndex,
    standardArray,
    ...input,
  })
}

describe('resolveStepVisualStatus', () => {
  it('returns idle for incomplete steps without field edits', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStatus({
        stepId: 'species',
        draft,
        currentStepId: 'identity',
      }),
    ).toBe('idle')
  })

  it('returns active for the current step only', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStatus({
        stepId: 'identity',
        draft,
        currentStepId: 'identity',
      }),
    ).toBe('active')
  })

  it('returns complete when the builder step is complete', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Tarin', alignment: 'lg' as const },
      touchedStepIds: ['identity' as const],
    }

    expect(
      resolveStatus({
        stepId: 'identity',
        draft,
        currentStepId: 'species',
      }),
    ).toBe('complete')
  })

  it('returns complete when revisiting an active step that is already complete', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Tarin', alignment: 'lg' as const },
      currentStepId: 'identity' as const,
      touchedStepIds: ['identity' as const],
    }

    expect(
      resolveStatus({
        stepId: 'identity',
        draft,
        currentStepId: 'identity',
      }),
    ).toBe('complete')
  })

  it('returns complete for species after selection when choice sets are unresolved', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    }

    expect(
      resolveStatus({
        stepId: 'species',
        draft,
        currentStepId: 'class',
      }),
    ).toBe('complete')
  })

  it('returns error only after an attempted submit with blocking issues', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStatus({
        stepId: 'identity',
        draft,
        currentStepId: 'identity',
        validationIssues: [
          { code: 'identity.name.required', message: 'Name is required.', stepId: 'identity' },
        ],
        attemptedStepIds: ['identity'],
      }),
    ).toBe('error')
  })

  it('does not return error without an attempted submit', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStatus({
        stepId: 'identity',
        draft,
        currentStepId: 'identity',
        validationIssues: [
          { code: 'identity.name.required', message: 'Name is required.', stepId: 'identity' },
        ],
      }),
    ).toBe('active')
  })

  it('returns attention when a field-touched step has draft validation issues', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      touchedStepIds: ['identity' as const],
    }

    expect(
      resolveStatus({
        stepId: 'identity',
        draft,
        currentStepId: 'species',
        draftValidationIssues: [
          { code: 'name_required', message: 'Enter a character name.', stepId: 'identity' },
        ],
      }),
    ).toBe('attention')
  })

  it('does not return attention for untouched steps with draft validation issues', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStatus({
        stepId: 'species',
        draft,
        currentStepId: 'identity',
        draftValidationIssues: [
          { code: 'species_required', message: 'Choose a species.', stepId: 'species' },
        ],
      }),
    ).toBe('idle')
  })

  it('does not mark a step complete when draft validation still has issues', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    }

    expect(
      resolveStatus({
        stepId: 'species',
        draft,
        currentStepId: 'class',
        resolvedChoiceSets: [],
        draftValidationIssues: [
          {
            code: 'choice_set_unsatisfied',
            message: 'Choose an option for Heritage.',
            stepId: 'species',
          },
        ],
      }),
    ).toBe('idle')
  })

  it('keeps non-caster spells locked even when draft validation has spell issues', () => {
    const spellsContext = createSpellsStepContextFixture()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
      touchedStepIds: ['spells' as const],
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, spellsContext)

    expect(
      resolveStatus({
        stepId: 'spells',
        draft,
        currentStepId: 'identity',
        context: spellsContext,
        resolvedChoiceSets,
        draftValidationIssues: [
          {
            code: 'choice_set_unsatisfied',
            message: 'Choose 1 more cantrip.',
            stepId: 'spells',
          },
        ],
      }),
    ).toBe('locked')
  })

  it('returns locked for spells when the class has no level-1 spellcasting', () => {
    const context = createSpellsStepContextFixture()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)

    expect(
      resolveStatus({
        stepId: 'spells',
        draft,
        currentStepId: 'identity',
        context,
        resolvedChoiceSets,
      }),
    ).toBe('locked')
    expect(stepStatusAriaLabel('Spells', 'locked')).toBe('Spells, not applicable')
  })

  it('does not return error for other steps with unresolved submit issues', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStatus({
        stepId: 'species',
        draft,
        currentStepId: 'identity',
        validationIssues: [
          { code: 'species.required', message: 'Species is required.', stepId: 'species' },
        ],
        attemptedStepIds: ['identity'],
      }),
    ).toBe('idle')
  })

  it('returns idle for spells before a class is selected', () => {
    const context = createSpellsStepContextFixture()
    const draft = createEmptyCharacterBuilderDraft()
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)

    expect(
      resolveStatus({
        stepId: 'spells',
        draft,
        currentStepId: 'identity',
        context,
        resolvedChoiceSets,
      }),
    ).toBe('idle')
  })

  it('returns active for a blocked proficiencies step while origin languages are editable', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)

    expect(
      resolveStatus({
        stepId: 'proficiencies',
        draft,
        currentStepId: 'proficiencies',
        resolvedChoiceSets,
      }),
    ).toBe('active')
  })

  it('returns complete for equipment when the class has no starting equipment choices', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    }
    const resolvedChoiceSets = resolveAvailableChoices(draft, context)

    expect(
      resolveStatus({
        stepId: 'equipment',
        draft,
        currentStepId: 'identity',
        resolvedChoiceSets,
      }),
    ).toBe('complete')
  })

  it('does not mark abilities complete when standard-array scores duplicate a value', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 15, dex: 15, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }

    expect(
      resolveStatus({
        stepId: 'abilities',
        draft,
        currentStepId: 'identity',
      }),
    ).toBe('idle')
  })
})
