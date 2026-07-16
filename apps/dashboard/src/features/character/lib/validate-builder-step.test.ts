import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from '@rpg/contracts'

import { createStandaloneBuilderContextFixture } from './character-builder-fixtures'
import {
  resolveBuilderDraftValidationIssues,
  resolveStepValidationIssuesAfterDraftChange,
  validateBuilderDraft,
  validateBuilderFinalSubmit,
} from './validate-builder-step'

describe('validate-builder-step', () => {
  const context = createStandaloneBuilderContextFixture()

  it('returns advisory draft issues without blocking', () => {
    const result = validateBuilderDraft(createEmptyCharacterBuilderDraft(), context, [])

    expect(result.ok).toBe(true)
    expect(result.issues.length).toBeGreaterThan(0)
    expect(result.issues.some((issue) => issue.stepId === 'identity')).toBe(true)
  })

  it('resolves draft validation issues for rail consumption', () => {
    const issues = resolveBuilderDraftValidationIssues(
      createEmptyCharacterBuilderDraft(),
      context,
      [],
    )

    expect(issues.some((issue) => issue.code === 'name_required')).toBe(true)
  })

  it('blocks final submit until alignment is set', () => {
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      identity: { name: 'Verna' },
      species: { speciesId: 'srd-cc-5.2.1:dwarf' },
      class: { classId: 'srd-cc-5.2.1:fighter', level: 1 as const },
      abilities: {
        method: 'standard-array' as const,
        scores: { str: 15, dex: 14, con: 13, int: 12, wis: 10, cha: 8 },
      },
    }

    const draftIssues = resolveBuilderDraftValidationIssues(draft, context, [])
    const finalSubmit = validateBuilderFinalSubmit(draft, context, [])

    expect(draftIssues.some((issue) => issue.code === 'alignment_required')).toBe(false)
    expect(finalSubmit.ok).toBe(false)
    expect(finalSubmit.issues.some((issue) => issue.code === 'alignment_required')).toBe(true)
  })

  it('replaces visible step issues after the draft is corrected', () => {
    const emptyDraft = createEmptyCharacterBuilderDraft()
    const namedDraft = {
      ...emptyDraft,
      identity: { name: 'Verna' },
    }
    const staleIssues = [
      {
        code: 'name_required',
        message: 'Enter a character name.',
        path: 'identity.name',
        stepId: 'identity' as const,
      },
      {
        code: 'species_required',
        message: 'Choose a species.',
        path: 'species.speciesId',
        stepId: 'species' as const,
      },
    ]

    expect(
      resolveStepValidationIssuesAfterDraftChange(staleIssues, namedDraft, context, 'identity', []),
    ).toEqual([staleIssues[1]])
  })
})
