import { describe, expect, it } from 'vitest'

import type { BuilderStepReadinessState } from '@rpg/contracts'

import {
  isBuilderStepBlockedNoClass,
  isBuilderStepReadinessMessageOnly,
  showsBuilderStepReviewMessage,
  visibleProficiencySections,
  resolveVisibleProficiencyStepContent,
} from './builder-step-readiness.lib'

describe('builder-step-readiness.lib', () => {
  it('detects blocked builder steps without a class', () => {
    expect(
      isBuilderStepBlockedNoClass(
        { readiness: 'blocked' },
        { class: { classId: undefined, level: 1 } },
      ),
    ).toBe(true)
    expect(
      isBuilderStepBlockedNoClass(
        { readiness: 'blocked' },
        { class: { classId: 'fighter', level: 1 } },
      ),
    ).toBe(false)
  })

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
          {
            id: 'savingThrows',
            kind: 'savingThrows',
            heading: 'Saving Throws',
            subhead: '',
            aggregateCount: null,
            selectedRows: [],
            grantedRows: [],
            choiceBlocks: [],
            emptyMessage: '',
            isOverSelected: false,
          },
          {
            id: 'languages',
            kind: 'languages',
            heading: 'Languages',
            subhead: '',
            aggregateCount: null,
            selectedRows: [],
            grantedRows: [],
            choiceBlocks: [],
            emptyMessage: '',
            isOverSelected: false,
          },
        ],
        true,
      ).map((section) => section.kind),
    ).toEqual(['languages'])
  })

  it('resolves visible summary and section content from the step model', () => {
    const model = {
      fixedGrants: [
        {
          kind: 'savingThrows' as const,
          label: 'Saving Throws',
          sourceGroups: [{ sourceLabel: 'Rogue', valueLabels: ['Dexterity'] }],
        },
        {
          kind: 'languages' as const,
          label: 'Languages',
          sourceGroups: [{ sourceLabel: 'Origin', valueLabels: ['Common'] }],
        },
      ],
      sections: [
        {
          id: 'skills',
          kind: 'skills' as const,
          heading: 'Skills',
          subhead: '',
          aggregateCount: null,
          selectedRows: [],
          grantedRows: [],
          choiceBlocks: [],
          emptyMessage: '',
          isOverSelected: false,
        },
        {
          id: 'languages',
          kind: 'languages' as const,
          heading: 'Languages',
          subhead: '',
          aggregateCount: null,
          selectedRows: [],
          grantedRows: [],
          choiceBlocks: [],
          emptyMessage: '',
          isOverSelected: false,
        },
      ],
    }

    expect(resolveVisibleProficiencyStepContent(model, true)).toEqual({
      fixedGrants: [model.fixedGrants[1]],
      sections: [model.sections[1]],
    })
  })
})
