import { describe, expect, it } from 'vitest'

import { createEmptyCharacterBuilderDraft } from './draft'
import { resolveReviewBlockingSummary } from './resolve-review-blocking-summary'
import { builderTestContext } from './test-fixtures'

describe('resolveReviewBlockingSummary', () => {
  it('maps submit-blocking field issues and unresolved choice sets to required items', () => {
    const draft = createEmptyCharacterBuilderDraft()
    const resolvedChoiceSets = [
      {
        id: 'class:srd-cc-5.2.1:fighter:class-skills',
        sourceType: 'class' as const,
        sourceId: 'srd-cc-5.2.1:fighter',
        choiceType: 'skillProficiency' as const,
        label: 'Choose Skills',
        min: 2,
        max: 2,
        options: [{ id: 'srd-cc-5.2.1:athletics', label: 'Athletics' }],
        required: true,
      },
    ]

    const summary = resolveReviewBlockingSummary(draft, builderTestContext, resolvedChoiceSets, [
      {
        code: 'name_required',
        message: 'Enter a character name.',
        path: 'identity.name',
        stepId: 'identity',
      },
      {
        code: 'abilities_incomplete',
        message: 'Assign a score to every ability.',
        path: 'abilities.scores',
        stepId: 'abilities',
      },
    ])

    expect(summary.alertIssues).toHaveLength(2)
    expect(summary.requiredItems).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'stepField',
          label: 'Identity',
          stepId: 'identity',
        }),
        expect.objectContaining({
          kind: 'stepField',
          label: 'Ability Scores',
          stepId: 'abilities',
          progress: { current: 0, total: 6 },
        }),
        expect.objectContaining({
          kind: 'choiceSet',
          label: 'Choose Skills',
          stepId: 'proficiencies',
        }),
      ]),
    )
    expect(summary.nonActionable).toEqual([])
  })

  it('derives alert issues from final submit validation when none are provided', () => {
    const summary = resolveReviewBlockingSummary(
      createEmptyCharacterBuilderDraft(),
      builderTestContext,
      [],
    )

    expect(summary.alertIssues.length).toBeGreaterThan(0)
    expect(summary.requiredItems.length).toBeGreaterThan(0)
  })
})
