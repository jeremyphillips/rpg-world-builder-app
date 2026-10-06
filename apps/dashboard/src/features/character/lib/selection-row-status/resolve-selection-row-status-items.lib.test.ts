import { describe, expect, it } from 'vitest'

import type { OptionPresentationFact } from '@rpg/contracts'

import { resolveSelectionRowStatusItems } from './resolve-selection-row-status-items.lib'
import { selectionPresentationFromFacts } from './selection-presentation-from-facts.lib'
import {
  selectionBlocker,
  selectionNotice,
  selectionRecommendation,
  selectionRequirement,
  selectionSource,
  selectionWarning,
} from './selection-row-entries.lib'
import {
  SELECTION_BLOCKER_REASONS,
  type SelectionGuidanceEntry,
  type SelectionRowPresentation,
  type SelectionStatusEntry,
} from './selection-row-status.types'

function labels(presentation: SelectionRowPresentation): string[] {
  return resolveSelectionRowStatusItems(presentation, { context: 'picker' }).map((item) =>
    'label' in item ? item.label : item.kind,
  )
}

function shuffled<T>(items: readonly T[], seed: number): T[] {
  const copy = [...items]
  let state = seed
  for (let index = copy.length - 1; index > 0; index -= 1) {
    state = (state * 9301 + 49297) % 233280
    const swap = Math.floor((state / 233280) * (index + 1))
    ;[copy[index], copy[swap]] = [copy[swap]!, copy[index]!]
  }
  return copy
}

const status: SelectionStatusEntry[] = [
  selectionBlocker('unaffordable', 'Cannot afford'),
  selectionBlocker('unavailable', 'Unavailable here'),
  selectionWarning('ability_score_requirement', 'Requires DEX 13', { subject: 'dex' }),
  selectionWarning('not_proficient', 'Not proficient'),
  selectionWarning('ability_score_requirement', 'Requires STR 15', { subject: 'str' }),
  selectionNotice('selection_full', 'Selection full'),
]

const guidance: SelectionGuidanceEntry[] = [
  selectionSource('alternative_package', 'Included in package option'),
  selectionRecommendation({ owned: false, sourceKind: 'species', label: 'Recommended by species' }),
  selectionSource('in_package', 'In your package'),
  selectionRecommendation({ owned: false, sourceKind: 'class', label: 'Recommended by class' }),
  selectionRequirement({
    kind: 'requirement_match',
    role: 'candidate',
    sourceKind: 'class',
    label: 'Matches focus requirement',
  }),
  selectionRequirement({
    kind: 'requirement',
    role: 'candidate',
    sourceKind: 'class',
    label: 'Required by class',
  }),
  selectionRecommendation({ owned: false, sourceKind: 'role', label: 'Recommended by role' }),
]

const EXPECTED_ORDER = [
  'Unavailable here',
  'Cannot afford',
  'Not proficient',
  'Requires STR 15',
  'Requires DEX 13',
  'Selection full',
  'Required by class',
  'Matches focus requirement',
  'Recommended by role',
  'Recommended by class',
  'Recommended by species',
  'In your package',
  'Included in package option',
]

describe('resolveSelectionRowStatusItems ordering', () => {
  it.each([1, 7, 42, 99, 1234])('orders shuffled input identically (seed %i)', (seed) => {
    expect(
      labels({ status: shuffled(status, seed), guidance: shuffled(guidance, seed + 1) }),
    ).toEqual(EXPECTED_ORDER)
  })

  it('orders every blocker pairing by the blocker rank table', () => {
    for (const [leftIndex, left] of SELECTION_BLOCKER_REASONS.entries()) {
      for (const right of SELECTION_BLOCKER_REASONS.slice(leftIndex + 1)) {
        expect(
          labels({
            status: [selectionBlocker(right, right), selectionBlocker(left, left)],
            guidance: [],
          }),
        ).toEqual([left, right])
      }
    }
  })

  it('places requirements, recommendations, and sources after every status entry', () => {
    const items = resolveSelectionRowStatusItems(
      {
        status: [selectionWarning('not_proficient', 'Not proficient')],
        guidance: [selectionSource('in_package', 'In your package')],
      },
      { context: 'picker' },
    )
    expect(items.map((item) => item.kind)).toEqual(['badge', 'text'])
  })
})

describe('resolveSelectionRowStatusItems dedupe', () => {
  it('collapses duplicate keys and keeps same-label entries with different keys', () => {
    expect(
      labels({
        status: [
          selectionWarning('not_proficient', 'Not proficient'),
          selectionWarning('not_proficient', 'Not proficient'),
        ],
        guidance: [
          selectionRecommendation({ owned: false, sourceKind: 'class', label: 'Recommended' }),
          selectionRecommendation({ owned: false, sourceKind: 'species', label: 'Recommended' }),
        ],
      }),
    ).toEqual(['Not proficient', 'Recommended', 'Recommended'])
  })
})

describe('resolveSelectionRowStatusItems chrome', () => {
  it('maps tone, appearance, and supplemental titles', () => {
    expect(
      resolveSelectionRowStatusItems(
        {
          status: [
            selectionBlocker('unaffordable', 'Cannot afford'),
            selectionWarning('ability_score_requirement', 'Requires STR 15', {
              subject: 'str',
              detail: 'Requires STR 15; character has STR 8.',
            }),
            selectionNotice('already_granted', 'Already granted by Elf species'),
          ],
          guidance: [
            selectionRequirement({
              kind: 'requirement',
              role: 'candidate',
              sourceKind: 'class',
              label: 'Required by class',
              sourceLabels: ['Wizard class'],
            }),
          ],
        },
        { context: 'picker' },
      ),
    ).toEqual([
      { kind: 'badge', label: 'Cannot afford', tone: 'destructive', appearance: 'soft' },
      {
        kind: 'badge',
        label: 'Requires STR 15',
        tone: 'warning',
        appearance: 'soft',
        title: 'Requires STR 15; character has STR 8.',
      },
      { kind: 'text', variant: 'muted', label: 'Already granted by Elf species' },
      { kind: 'text', variant: 'guidance', label: 'Required by class', title: 'Wizard class' },
    ])
  })

  it('attaches the tooltip hook to matching status entries only', () => {
    const items = resolveSelectionRowStatusItems(
      {
        status: [
          selectionBlocker('unaffordable', 'Cannot afford'),
          selectionWarning('not_proficient', 'Not proficient', { detail: 'Long sentence' }),
        ],
        guidance: [],
      },
      {
        context: 'picker',
        statusTooltip: (entry) => (entry.reason === 'unaffordable' ? 'amounts' : undefined),
      },
    )
    expect(items).toEqual([
      expect.objectContaining({ label: 'Cannot afford', tooltip: 'amounts' }),
      expect.objectContaining({ label: 'Not proficient', title: 'Long sentence' }),
    ])
    expect(items[1]).not.toHaveProperty('tooltip')
  })

  it('requires a known context', () => {
    const presentation = { status: [], guidance: [] }
    const render = () => {
      // @ts-expect-error context is mandatory
      resolveSelectionRowStatusItems(presentation)
      // @ts-expect-error unknown contexts are rejected
      resolveSelectionRowStatusItems(presentation, { context: 'inventory' })
    }
    expect(render).toBeTypeOf('function')
  })
})

describe('selectionPresentationFromFacts', () => {
  const fact = (fields: Partial<OptionPresentationFact>): OptionPresentationFact => ({
    kind: 'state',
    label: 'Label',
    sourceLabels: [],
    ...fields,
  })

  it('maps by discriminator and drops facts without a row entry', () => {
    const presentation = selectionPresentationFromFacts([
      fact({
        kind: 'requirement',
        discriminator: 'required',
        label: 'Required by class',
        sourceKind: 'class',
        requirementRole: 'satisfier',
        sourceLabels: ['Wizard class'],
      }),
      fact({
        kind: 'recommendation',
        discriminator: 'recommended',
        label: 'Recommended by class',
        sourceKind: 'class',
        owned: true,
      }),
      fact({
        kind: 'compatibility',
        discriminator: 'ability-requirement-unmet',
        label: 'Requires STR 15',
        detail: 'Requires STR 15; character has STR 8.',
        ability: 'str',
      }),
      fact({ kind: 'compatibility', discriminator: 'proficient', label: 'Proficient' }),
      fact({ kind: 'compatibility', discriminator: 'spellcasting-focus' }),
      fact({ discriminator: 'open-pool', label: 'Starting option' }),
    ])

    expect(presentation.status).toEqual([
      {
        key: 'warning:ability_score_requirement:str',
        category: 'compatibility',
        kind: 'warning',
        reason: 'ability_score_requirement',
        subject: 'str',
        label: 'Requires STR 15',
        detail: 'Requires STR 15; character has STR 8.',
      },
    ])
    expect(presentation.guidance.map((entry) => [entry.category, entry.label])).toEqual([
      ['requirement_held', 'Required by class'],
      ['recommendation_held', 'Recommended by class'],
      ['source', 'Starting option'],
    ])
  })
})
