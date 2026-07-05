import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft, indexCharacterBuildCatalog } from '@rpg/contracts'

import { createPopulatedStandaloneBuilderContextFixture } from './character-builder-fixtures'
import { resolveStepVisualStatus } from './builder-step-visual-status'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = indexCharacterBuildCatalog(context.catalog)

describe('resolveStepVisualStatus', () => {
  it('returns notStarted for untouched incomplete steps', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStepVisualStatus({
        stepId: 'species',
        draft,
        currentStepId: 'identity',
        resolvedChoiceSets: null,
        validationIssues: [],
        catalogIndex,
      }),
    ).toBe('notStarted')
  })

  it('returns inProgress for the active step', () => {
    const draft = createEmptyCharacterBuilderDraft()

    expect(
      resolveStepVisualStatus({
        stepId: 'identity',
        draft: { ...draft, currentStepId: 'identity' },
        currentStepId: 'identity',
        resolvedChoiceSets: null,
        validationIssues: [],
        catalogIndex,
      }),
    ).toBe('inProgress')
  })

  it('returns inProgress for touched incomplete steps', () => {
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
        catalogIndex,
      }),
    ).toBe('inProgress')
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
        catalogIndex,
      }),
    ).toBe('complete')
  })

  it('returns warning only after attempted validation issues exist', () => {
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
        catalogIndex,
      }),
    ).toBe('warning')
  })

  it('does not return warning before a step is touched or active', () => {
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
        catalogIndex,
      }),
    ).toBe('locked')
  })
})
