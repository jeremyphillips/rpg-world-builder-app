import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, indexCharacterBuildCatalog } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from './character-builder-fixtures'
import { resolveStepVisualStatus } from './builder-step-visual-status'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)

describe('resolveStepVisualStatus', () => {
  it('returns notStarted for incomplete steps that were only visited', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      touchedStepIds: ['species' as const],
    }

    expect(
      resolveStepVisualStatus({
        stepId: 'species',
        draft,
        currentStepId: 'identity',
        resolvedChoiceSets: null,
        validationIssues: [],
        attemptedStepIds: [],
        catalogIndex,
      }),
    ).toBe('notStarted')
  })

  it('returns current for the active step only', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStepVisualStatus({
        stepId: 'identity',
        draft,
        currentStepId: 'identity',
        resolvedChoiceSets: null,
        validationIssues: [],
        attemptedStepIds: [],
        catalogIndex,
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
      resolveStepVisualStatus({
        stepId: 'identity',
        draft,
        currentStepId: 'species',
        resolvedChoiceSets: null,
        validationIssues: [],
        attemptedStepIds: [],
        catalogIndex,
      }),
    ).toBe('complete')
  })

  it('returns complete for species after selection when choice sets are unresolved', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
    }

    expect(
      resolveStepVisualStatus({
        stepId: 'species',
        draft,
        currentStepId: 'class',
        resolvedChoiceSets: null,
        validationIssues: [],
        attemptedStepIds: [],
        catalogIndex,
      }),
    ).toBe('complete')
  })

  it('returns warning only after an attempted submit with blocking issues', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStepVisualStatus({
        stepId: 'identity',
        draft,
        currentStepId: 'identity',
        resolvedChoiceSets: null,
        validationIssues: [
          { code: 'identity.name.required', message: 'Name is required.', stepId: 'identity' },
        ],
        attemptedStepIds: ['identity'],
        catalogIndex,
      }),
    ).toBe('warning')
  })

  it('does not return warning without an attempted submit', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStepVisualStatus({
        stepId: 'identity',
        draft,
        currentStepId: 'identity',
        resolvedChoiceSets: null,
        validationIssues: [
          { code: 'identity.name.required', message: 'Name is required.', stepId: 'identity' },
        ],
        attemptedStepIds: [],
        catalogIndex,
      }),
    ).toBe('current')
  })

  it('does not return warning for other steps with unresolved issues', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStepVisualStatus({
        stepId: 'species',
        draft,
        currentStepId: 'identity',
        resolvedChoiceSets: null,
        validationIssues: [
          { code: 'species.required', message: 'Species is required.', stepId: 'species' },
        ],
        attemptedStepIds: ['identity'],
        catalogIndex,
      }),
    ).toBe('notStarted')
  })

  it('returns locked for spells when the class has no level-1 spellcasting', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
    }

    expect(
      resolveStepVisualStatus({
        stepId: 'spells',
        draft,
        currentStepId: 'identity',
        resolvedChoiceSets: null,
        validationIssues: [],
        attemptedStepIds: [],
        catalogIndex,
      }),
    ).toBe('locked')
  })
})
