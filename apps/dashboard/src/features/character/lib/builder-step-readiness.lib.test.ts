import { describe, expect, it } from 'vitest'

import type { BuilderStepReadinessState } from '@rpg/contracts'

import {
  isBuilderStepReadinessMessageOnly,
  showsBuilderStepReviewMessage,
  visibleProficiencySections,
} from './builder-step-readiness.lib'

describe('builder-step-readiness.lib', () => {
  it('treats partial proficiencies blocks as interactive', () => {
    const state: BuilderStepReadinessState = {
      readiness: 'blocked',
      classDependentBlocked: true,
      message: 'Choose a class',
      helperText: 'Class selection determines saving throws.',
    }

    expect(isBuilderStepReadinessMessageOnly(state)).toBe(false)
  })

  it('treats skipped equipment as message-only complete', () => {
    const state: BuilderStepReadinessState = {
      readiness: 'complete',
      message: 'Continuing without starting equipment.',
    }

    expect(isBuilderStepReadinessMessageOnly(state, { equipmentSkipped: true })).toBe(true)
    expect(showsBuilderStepReviewMessage(state)).toBe(true)
  })

  it('filters class-dependent proficiency sections while keeping languages', () => {
    expect(
      visibleProficiencySections(
        [
          { kind: 'savingThrows', heading: 'Saving Throws', grantedRows: [], choices: [] },
          { kind: 'languages', heading: 'Languages', grantedRows: [], choices: [] },
        ],
        true,
      ).map((section) => section.kind),
    ).toEqual(['languages'])
  })
})
