import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, indexCharacterBuildCatalog } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from './character-builder-fixtures'
import { createSpellsStepContextFixture } from './spells-step.fixtures'
import {
  resolveStepVisualStatus,
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
    attemptedStepIds: [],
    catalogIndex,
    standardArray,
    ...input,
  })
}

describe('resolveStepVisualStatus', () => {
  it('returns notStarted for incomplete steps that were only visited', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      touchedStepIds: ['species' as const],
    }

    expect(
      resolveStatus({
        stepId: 'species',
        draft,
        currentStepId: 'identity',
      }),
    ).toBe('notStarted')
  })

  it('returns current for the active step only', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStatus({
        stepId: 'identity',
        draft,
        currentStepId: 'identity',
      }),
    ).toBe('current')
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

  it('returns warning only after an attempted submit with blocking issues', () => {
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
    ).toBe('warning')
  })

  it('does not return warning without an attempted submit', () => {
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
    ).toBe('current')
  })

  it('does not return warning for other steps with unresolved issues', () => {
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
    ).toBe('notStarted')
  })

  it('returns locked for spells when the class has no level-1 spellcasting', () => {
    const context = createSpellsStepContextFixture()
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    }

    expect(
      resolveStatus({
        stepId: 'spells',
        draft,
        currentStepId: 'identity',
        context,
      }),
    ).toBe('locked')
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
    ).toBe('notStarted')
  })
})
