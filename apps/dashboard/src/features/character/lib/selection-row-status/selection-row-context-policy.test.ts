import { describe, expect, expectTypeOf, it } from 'vitest'

import {
  createEmptyCharacterBuilderDraft,
  resolveCharacterBuildAdvisoriesForDraft,
  type CharacterBuilderDraft,
} from '@rpg/contracts'

import { makeCharacterBuildCatalog } from '@/test/fixtures/factories/additional/character-build-catalog'
import { pickArmor, pickClass } from '@/test/fixtures/pick'

import { createStandaloneBuilderContextFixture } from '../fixtures/character-builder-fixtures'
import { resolveSelectionRowStatusItems } from './resolve-selection-row-status-items.lib'
import {
  applySelectionRowPolicy,
  SELECTION_ROW_CONTEXT_POLICIES,
  SELECTION_ROW_CONTEXTS,
  type SelectionRowContext,
} from './selection-row-context-policy'
import {
  SELECTION_REQUIREMENT_ROLE_CATEGORY,
  SELECTION_SOURCE_REASON_CATEGORY,
  SELECTION_STATUS_REASON_CATEGORY,
  selectionBlocker,
  selectionNotice,
  selectionRecommendation,
  selectionRecommendationCategory,
  selectionRequirement,
  selectionSource,
  selectionWarning,
} from './selection-row-entries.lib'
import {
  SELECTION_SIGNAL_CATEGORIES,
  SELECTION_SOURCE_REASONS,
  SELECTION_STATUS_REASONS,
  type SelectionRowPresentation,
  type SelectionSignalCategory,
} from './selection-row-status.types'

const EXPECTED_VISIBILITY: Record<SelectionRowContext, Record<SelectionSignalCategory, boolean>> = {
  picker: {
    availability: true,
    affordability: true,
    compatibility: true,
    capacity: true,
    requirement_open: true,
    requirement_held: false,
    recommendation: true,
    recommendation_held: false,
    source: true,
  },
  owned: {
    availability: false,
    affordability: false,
    compatibility: true,
    capacity: false,
    requirement_open: false,
    requirement_held: false,
    recommendation: false,
    recommendation_held: false,
    source: false,
  },
  review: {
    availability: false,
    affordability: false,
    compatibility: true,
    capacity: false,
    requirement_open: false,
    requirement_held: false,
    recommendation: false,
    recommendation_held: false,
    source: false,
  },
  edit_choice: {
    availability: true,
    affordability: false,
    compatibility: true,
    capacity: false,
    requirement_open: true,
    requirement_held: true,
    recommendation: true,
    recommendation_held: true,
    source: false,
  },
  reconciliation: {
    availability: false,
    affordability: false,
    compatibility: true,
    capacity: false,
    requirement_open: true,
    requirement_held: false,
    recommendation: true,
    recommendation_held: false,
    source: false,
  },
}

const MATRIX = SELECTION_ROW_CONTEXTS.flatMap((context) =>
  SELECTION_SIGNAL_CATEGORIES.map((category) => [context, category] as const),
)

/** One entry per category. */
const everyCategory: SelectionRowPresentation = {
  status: [
    selectionBlocker('not_purchasable', 'Not for sale'),
    selectionBlocker('unaffordable', 'Cannot afford'),
    selectionWarning('not_proficient', 'Not proficient'),
    selectionNotice('selection_full', 'Selection full'),
  ],
  guidance: [
    selectionRequirement({
      kind: 'requirement',
      role: 'candidate',
      sourceKind: 'class',
      label: 'Required by class',
    }),
    selectionRequirement({
      kind: 'requirement_match',
      role: 'satisfier',
      sourceKind: 'class',
      label: 'Satisfies focus requirement',
    }),
    selectionRecommendation({ owned: false, sourceKind: 'class', label: 'Recommended by class' }),
    selectionRecommendation({
      owned: true,
      sourceKind: 'species',
      label: 'Recommended by species',
    }),
    selectionSource('in_package', 'In your package'),
  ],
}

function visibleLabels(context: SelectionRowContext): string[] {
  return resolveSelectionRowStatusItems(everyCategory, { context }).map((item) =>
    'label' in item ? item.label : item.kind,
  )
}

describe('SELECTION_ROW_CONTEXT_POLICIES', () => {
  it.each(MATRIX)('%s shows %s per the documented matrix', (context, category) => {
    const visible: readonly SelectionSignalCategory[] =
      SELECTION_ROW_CONTEXT_POLICIES[context].visible
    expect(visible.includes(category)).toBe(EXPECTED_VISIBILITY[context][category])
  })

  it('maps every reason, role, and ownership state to exactly one known category', () => {
    const known = new Set<string>(SELECTION_SIGNAL_CATEGORIES)
    for (const reason of SELECTION_STATUS_REASONS) {
      expect(known.has(SELECTION_STATUS_REASON_CATEGORY[reason])).toBe(true)
    }
    for (const reason of SELECTION_SOURCE_REASONS) {
      expect(SELECTION_SOURCE_REASON_CATEGORY[reason]).toBe('source')
    }
    expect(SELECTION_REQUIREMENT_ROLE_CATEGORY).toEqual({
      candidate: 'requirement_open',
      satisfier: 'requirement_held',
    })
    expect(selectionRecommendationCategory(false)).toBe('recommendation')
    expect(selectionRecommendationCategory(true)).toBe('recommendation_held')
  })
})

describe('context behavior', () => {
  it('picker keeps acquisition signals and drops held guidance', () => {
    expect(visibleLabels('picker')).toEqual([
      'Not for sale',
      'Cannot afford',
      'Not proficient',
      'Selection full',
      'Required by class',
      'Recommended by class',
      'In your package',
    ])
  })

  it('owned and review keep only compatibility', () => {
    expect(visibleLabels('owned')).toEqual(['Not proficient'])
    expect(visibleLabels('review')).toEqual(['Not proficient'])
  })

  it('edit_choice keeps availability and held guidance without affordability or source', () => {
    expect(visibleLabels('edit_choice')).toEqual([
      'Not for sale',
      'Not proficient',
      'Required by class',
      'Satisfies focus requirement',
      'Recommended by class',
      'Recommended by species',
    ])
  })

  it('reconciliation shows compatibility and open guidance with no availability', () => {
    expect(visibleLabels('reconciliation')).toEqual([
      'Not proficient',
      'Required by class',
      'Recommended by class',
    ])
  })
})

describe('advisory independence', () => {
  const wizard = pickClass('wizard')
  const plateArmor = pickArmor('plate-armor')
  const context = createStandaloneBuilderContextFixture({
    catalog: makeCharacterBuildCatalog({ classes: [wizard], equipment: [plateArmor] }),
  })
  const empty = createEmptyCharacterBuilderDraft()
  const draft: CharacterBuilderDraft = {
    ...empty,
    class: { classId: wizard.id, level: 1 },
    abilities: {
      ...empty.abilities,
      scores: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    },
    equipment: {
      mode: 'package',
      purchases: [],
      editedSincePackageSelection: false,
      grants: [{ equipmentId: plateArmor.id, quantity: 1 }],
    },
  }
  const rowPresentation: SelectionRowPresentation = {
    status: [
      selectionWarning('not_proficient', 'Not proficient'),
      selectionWarning('ability_score_requirement', 'Requires STR 15', { subject: 'str' }),
    ],
    guidance: [],
  }

  it('derives the same advisories regardless of row context', () => {
    const before = resolveCharacterBuildAdvisoriesForDraft(draft, context)
    expect(before.map((advisory) => advisory.code)).toEqual([
      'equipment_not_proficient',
      'equipment_ability_score_requirement_unmet',
    ])
    for (const rowContext of SELECTION_ROW_CONTEXTS) {
      resolveSelectionRowStatusItems(rowPresentation, { context: rowContext })
      expect(resolveCharacterBuildAdvisoriesForDraft(draft, context)).toEqual(before)
    }
  })

  it('keeps advisories when a policy hides every row entry', () => {
    expect(applySelectionRowPolicy(rowPresentation, { visible: [] })).toEqual({
      status: [],
      guidance: [],
    })
    expect(resolveCharacterBuildAdvisoriesForDraft(draft, context)).toHaveLength(2)
  })

  it('takes no row context input', () => {
    expectTypeOf<
      Extract<
        Parameters<typeof resolveCharacterBuildAdvisoriesForDraft>[number],
        SelectionRowContext
      >
    >().toBeNever()
  })
})
