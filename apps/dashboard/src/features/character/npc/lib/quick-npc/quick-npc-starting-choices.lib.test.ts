import { describe, expect, it } from 'vitest'

import {
  formatGrantCardProficiencySourceLabel,
  indexCharacterBuildCatalog,
  buildSelectionSourceLabelCatalogIndex,
  resolveProficiencyChoiceSetPresentation,
  type ChoiceSet,
  type NpcStartingChoices,
  type StartingChoiceContribution,
} from '@rpg/contracts'

import {
  createCampaignNpcBuilderContextFixture,
  populatedBuilderCatalog,
} from '../../../lib/fixtures/character-builder-fixtures'
import {
  formatFixedGrantProvenance,
  formatStartingChoiceCategorySummary,
  formatStartingChoiceProvenance,
  groupStartingChoicesByKind,
  resolveStartingChoiceCategoryAllowanceStatus,
  normalizeStartingChoiceOverride,
  startingChoiceAllowancePresentation,
  startingChoiceFillsMatch,
  startingChoiceHasNamedAttribution,
  startingChoiceResetLabel,
  startingChoiceShowSuggestedReset,
  startingChoiceSuggestionHint,
} from './quick-npc-starting-choices.lib'

function allowance(
  overrides: Partial<Extract<StartingChoiceContribution, { mechanic: 'choice-allowance' }>> = {},
): Extract<StartingChoiceContribution, { mechanic: 'choice-allowance' }> {
  return {
    id: 'npcTemplate:guard:skills',
    category: 'skill',
    mechanic: 'choice-allowance',
    selectedIds: ['athletics', 'perception'],
    allowance: { min: 2, max: 2 },
    owner: { ownerKind: 'npcTemplate', ownerLabel: 'Guard' },
    choiceSetId: 'npcTemplate:guard:skills',
    overridden: false,
    suggestedBy: {
      athletics: ['template'],
      perception: ['template'],
    },
    ...overrides,
  }
}

function fixedGrant(): Extract<StartingChoiceContribution, { mechanic: 'fixed-grant' }> {
  return {
    id: 'fixed:skill:speciesTrait:srd-cc-5.2.1:elf:keen-senses',
    category: 'skill',
    mechanic: 'fixed-grant',
    selectedIds: ['perception'],
    owner: { ownerKind: 'species', ownerLabel: 'Elf', featureLabel: 'Keen Senses' },
    source: {
      kind: 'speciesTrait',
      sourceId: 'srd-cc-5.2.1:elf',
      grantId: 'keen-senses',
    },
  }
}

const buildContext = createCampaignNpcBuilderContextFixture({ catalog: populatedBuilderCatalog })

describe('formatStartingChoiceCategorySummary', () => {
  it('joins up to three unique labels', () => {
    expect(formatStartingChoiceCategorySummary(['Perception', 'Athletics', 'Intimidation'])).toBe(
      'Perception, Athletics, Intimidation',
    )
  })

  it('dedupes labels and truncates with + N more', () => {
    expect(
      formatStartingChoiceCategorySummary([
        'Perception',
        'Perception',
        'Athletics',
        'Intimidation',
        'Stealth',
        'Survival',
      ]),
    ).toBe('Perception, Athletics, Intimidation + 2 more')
  })

  it('returns empty string when no labels', () => {
    expect(formatStartingChoiceCategorySummary([])).toBe('')
  })
})

describe('formatStartingChoiceProvenance', () => {
  it('uses grant-card copy for fixed grants and manual copy for constraints', () => {
    const catalog = buildSelectionSourceLabelCatalogIndex({
      catalogIndex: indexCharacterBuildCatalog(buildContext.catalog),
      characterCreationRules: buildContext.characterCreationRules,
    })
    expect(formatFixedGrantProvenance(fixedGrant(), buildContext)).toBe(
      formatGrantCardProficiencySourceLabel([fixedGrant().source], catalog),
    )
    expect(
      formatStartingChoiceProvenance(
        {
          id: 'constraint:requiredWeaponIds',
          category: 'weapon',
          mechanic: 'explicit-constraint',
          constraint: 'requiredWeaponIds',
          owner: {},
          selectedIds: ['spear'],
        },
        buildContext,
      ),
    ).toBe('Added manually')
  })
})

describe('startingChoiceAllowancePresentation', () => {
  it('delegates to the shared ChoiceSet presentation resolver', () => {
    const choiceSet: ChoiceSet = {
      id: 'species:srd-cc-5.2.1:elf:trait:keen-senses:skillProficiency',
      sourceType: 'species',
      sourceId: 'srd-cc-5.2.1:elf',
      choiceType: 'skillProficiency',
      label: 'Keen Senses',
      min: 1,
      max: 1,
      required: true,
      options: [
        { id: 'insight', label: 'Insight' },
        { id: 'perception', label: 'Perception' },
        { id: 'survival', label: 'Survival' },
      ],
      provenance: {
        ownerKind: 'species',
        ownerLabel: 'Elf',
        featureLabel: 'Keen Senses',
      },
    }
    const contribution = allowance({
      id: choiceSet.id,
      choiceSetId: choiceSet.id,
      selectedIds: ['perception'],
      allowance: { min: 1, max: 1 },
      owner: { ownerKind: 'species', ownerLabel: 'Elf', featureLabel: 'Keen Senses' },
      suggestedBy: { perception: [] },
    })
    const choices = {
      contributions: [contribution],
      removedOverrideIds: [],
      draft: {} as NpcStartingChoices['draft'],
      resolvedChoiceSets: [choiceSet],
    } satisfies Pick<
      NpcStartingChoices,
      'contributions' | 'removedOverrideIds' | 'draft' | 'resolvedChoiceSets'
    > as NpcStartingChoices

    expect(startingChoiceAllowancePresentation(choices, contribution)).toEqual(
      resolveProficiencyChoiceSetPresentation(choiceSet),
    )
  })
})

describe('startingChoiceSuggestionHint', () => {
  it('names a source only when that source covers every value', () => {
    expect(
      startingChoiceSuggestionHint({
        selectedIds: ['athletics', 'perception'],
        suggestedBy: { athletics: ['template'], perception: ['template'] },
        labels: { template: 'Guard' },
      }),
    ).toBe('Suggested by Guard role')
    expect(
      startingChoiceSuggestionHint({
        selectedIds: ['common'],
        suggestedBy: { common: ['species', 'template'] },
        labels: { template: 'Guard', species: 'Elf' },
      }),
    ).toBeUndefined()
    expect(
      startingChoiceSuggestionHint({
        selectedIds: ['insight'],
        suggestedBy: { insight: [] },
      }),
    ).toBeUndefined()
    expect(
      startingChoiceSuggestionHint({
        selectedIds: ['athletics'],
        labels: { template: 'Guard' },
      }),
    ).toBeUndefined()
  })

  it('leaves the Commoner fallback unnamed', () => {
    expect(
      startingChoiceSuggestionHint({
        selectedIds: ['perception'],
        suggestedBy: { perception: ['template'] },
        labels: {},
      }),
    ).toBeUndefined()
  })
})

describe('startingChoiceResetLabel', () => {
  it('uses suggested copy when the canonical fill has a named source', () => {
    expect(startingChoiceResetLabel({ count: 1, namedAttribution: true })).toBe(
      'Use suggested choice',
    )
    expect(startingChoiceResetLabel({ count: 2, namedAttribution: true })).toBe(
      'Use suggested choices',
    )
    expect(startingChoiceResetLabel({ count: 1, namedAttribution: false })).toBe(
      'Reset to default choice',
    )
    expect(startingChoiceResetLabel({ count: 2, namedAttribution: false })).toBe(
      'Reset to default choices',
    )
  })
})

describe('startingChoiceHasNamedAttribution', () => {
  it('is true when any selected value has a labelable source', () => {
    expect(
      startingChoiceHasNamedAttribution({
        selectedIds: ['athletics', 'insight'],
        suggestedBy: { athletics: ['template'], insight: [] },
        labels: { template: 'Guard' },
      }),
    ).toBe(true)
    expect(
      startingChoiceHasNamedAttribution({
        selectedIds: ['insight'],
        suggestedBy: { insight: [] },
      }),
    ).toBe(false)
  })
})

describe('startingChoiceFillsMatch', () => {
  it('compares ordered ids', () => {
    expect(startingChoiceFillsMatch(['a', 'b'], ['a', 'b'])).toBe(true)
    expect(startingChoiceFillsMatch(['a', 'b'], ['b', 'a'])).toBe(false)
    expect(startingChoiceFillsMatch(['a'], ['a', 'b'])).toBe(false)
  })
})

describe('normalizeStartingChoiceOverride', () => {
  it('deletes a fill that matches the canonical order', () => {
    expect(
      normalizeStartingChoiceOverride({
        currentIds: ['a', 'b'],
        canonicalIds: ['a', 'b'],
      }),
    ).toBeUndefined()
    expect(
      normalizeStartingChoiceOverride({
        currentIds: ['b'],
        canonicalIds: ['a'],
      }),
    ).toEqual(['b'])
  })
})

describe('startingChoiceShowSuggestedReset', () => {
  it('shows when the current fill differs from canonical, even without a traced source', () => {
    expect(
      startingChoiceShowSuggestedReset({
        currentIds: ['athletics', 'perception'],
        canonical: { selectedIds: ['athletics', 'perception'] },
        overridden: true,
      }),
    ).toBe(false)
    expect(
      startingChoiceShowSuggestedReset({
        currentIds: ['athletics'],
        canonical: { selectedIds: ['athletics', 'perception'] },
        overridden: true,
      }),
    ).toBe(true)
    expect(
      startingChoiceShowSuggestedReset({
        currentIds: ['a'],
        canonical: { selectedIds: ['b'] },
        overridden: true,
      }),
    ).toBe(true)
    expect(
      startingChoiceShowSuggestedReset({
        currentIds: ['a'],
        canonical: { selectedIds: ['b'] },
        overridden: false,
      }),
    ).toBe(false)
  })
})

describe('resolveStartingChoiceCategoryAllowanceStatus', () => {
  it('returns none when the category has no choice allowances', () => {
    expect(
      resolveStartingChoiceCategoryAllowanceStatus({
        entries: [fixedGrant()],
        overrides: {},
      }),
    ).toBe('none')
  })

  it('returns incomplete when any allowance is underfilled', () => {
    expect(
      resolveStartingChoiceCategoryAllowanceStatus({
        entries: [
          allowance({
            selectedIds: ['perception'],
            allowance: { min: 2, max: 2 },
          }),
        ],
        overrides: {},
      }),
    ).toBe('incomplete')
  })

  it('returns complete when every allowance meets its minimum', () => {
    expect(
      resolveStartingChoiceCategoryAllowanceStatus({
        entries: [
          allowance({
            selectedIds: ['athletics', 'perception'],
            allowance: { min: 2, max: 2 },
          }),
        ],
        overrides: {},
      }),
    ).toBe('complete')
  })
})

describe('groupStartingChoicesByKind', () => {
  it('orders fixed grants before allowances and constraints', () => {
    const categories = groupStartingChoicesByKind({
      contributions: [
        {
          id: 'constraint:requiredWeaponIds',
          category: 'weapon',
          mechanic: 'explicit-constraint',
          constraint: 'requiredWeaponIds',
          owner: {},
          selectedIds: ['spear'],
        },
        allowance(),
        fixedGrant(),
      ],
      removedOverrideIds: [],
      draft: {} as never,
      resolvedChoiceSets: [],
    })

    const skills = categories.find((category) => category.kind === 'skill')
    expect(skills?.entries.map((row) => row.mechanic)).toEqual(['fixed-grant', 'choice-allowance'])
    expect(categories.map((category) => category.kind)).toEqual(['skill', 'weapon'])
  })
})
