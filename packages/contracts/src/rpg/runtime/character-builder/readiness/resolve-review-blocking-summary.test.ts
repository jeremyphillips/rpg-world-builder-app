import { describe, expect, it } from 'vitest'

import { resolveCharacterCreationPatch } from '../../../campaign/patches/campaign-character-creation-patch'
import { standardStartingWealthTableId } from '../../../campaign/rules/starting-wealth'
import {
  MINIMAL_TIER_B_ID,
  minimalStartingWealthSeedCoveringStandardMax,
} from '../../../../test/fixtures/starting-wealth-minimal'
import { createEmptyCharacterBuilderDraft } from '../draft'
import { buildMagicItemAllowanceId } from '../magic-item-selection'
import { resolveReviewBlockingSummary } from './resolve-review-blocking-summary'
import { builderTestContext } from '../test-fixtures'
import { magicItemGrantIncompleteIssueCode } from '../resolvers/equipment/resolve-equipment-magic-item-grant-step-issues'

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

  it('attaches equipment picker focus for magic-item grant review items', () => {
    const context = {
      ...builderTestContext,
      characterCreationRules: {
        ...builderTestContext.characterCreationRules,
        ...resolveCharacterCreationPatch(undefined, minimalStartingWealthSeedCoveringStandardMax),
      },
    }
    const draft = {
      ...createEmptyCharacterBuilderDraft(),
      class: { classId: 'srd-cc-5.2.1:fighter', level: 2 },
      equipment: {
        mode: 'package' as const,
        purchases: [],
        removedPackageItemKeys: [],
        customized: false,
        magicItemSelections: [],
      },
    }
    const allowanceId = buildMagicItemAllowanceId({
      startingWealthTableId: standardStartingWealthTableId('srd-cc-5.2.1'),
      tierId: MINIMAL_TIER_B_ID,
      rarity: 'common',
    })
    const summary = resolveReviewBlockingSummary(
      draft,
      context,
      [],
      [
        {
          code: magicItemGrantIncompleteIssueCode(allowanceId),
          message: 'Choose 1 Common magic item grant.',
          path: 'equipment.magicItemSelections',
          stepId: 'equipment',
          allowanceId,
        },
      ],
    )

    expect(summary.requiredItems).toEqual([
      expect.objectContaining({
        stepId: 'equipment',
        equipmentPickerFocus: { mode: 'magic_items', allowanceId },
        progress: { current: 0, total: 1 },
      }),
    ])
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
