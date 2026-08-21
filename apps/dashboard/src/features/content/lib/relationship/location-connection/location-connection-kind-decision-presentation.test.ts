import { describe, expect, it } from 'vitest'

import { resolveConnectionKindDecisionPresentation } from './location-connection-kind-decision-presentation'

const headquartersOption = {
  value: 'headquarters',
  label: 'Headquarters',
  description: 'Primary HQ.',
} as const

const ownsOption = {
  value: 'owns',
  label: 'Owner',
  description: 'Owns this location.',
} as const

describe('resolveConnectionKindDecisionPresentation', () => {
  it('hides kind chrome when showKindStep is false', () => {
    expect(
      resolveConnectionKindDecisionPresentation({
        kindOptions: [headquartersOption, ownsOption],
        selectedValue: 'headquarters',
        editingKind: false,
        showKindStep: false,
      }),
    ).toEqual({
      canEditKind: true,
      showKindField: false,
      showKindSummary: false,
    })
  })

  it('shows the kind field while the decision is incomplete', () => {
    expect(
      resolveConnectionKindDecisionPresentation({
        kindOptions: [headquartersOption, ownsOption],
        selectedValue: null,
        editingKind: false,
        showKindStep: true,
      }),
    ).toEqual({
      canEditKind: true,
      showKindField: true,
      showKindSummary: false,
    })
  })

  it('shows the summary when the decision is complete and reopen is allowed', () => {
    expect(
      resolveConnectionKindDecisionPresentation({
        kindOptions: [headquartersOption, ownsOption],
        selectedValue: 'headquarters',
        editingKind: false,
        showKindStep: true,
      }),
    ).toEqual({
      canEditKind: true,
      showKindField: false,
      showKindSummary: true,
    })
  })

  it('returns to the kind field while editing a completed decision', () => {
    expect(
      resolveConnectionKindDecisionPresentation({
        kindOptions: [headquartersOption, ownsOption],
        selectedValue: 'headquarters',
        editingKind: true,
        showKindStep: true,
      }),
    ).toEqual({
      canEditKind: true,
      showKindField: true,
      showKindSummary: false,
    })
  })

  it('keeps the kind field visible when only one option exists', () => {
    expect(
      resolveConnectionKindDecisionPresentation({
        kindOptions: [ownsOption],
        selectedValue: 'owns',
        editingKind: false,
        showKindStep: true,
      }),
    ).toEqual({
      canEditKind: false,
      showKindField: true,
      showKindSummary: false,
    })
  })

  it('matches People sequenced-add gating via showKindStep from option count', () => {
    expect(
      resolveConnectionKindDecisionPresentation({
        kindOptions: [],
        selectedValue: null,
        editingKind: false,
        showKindStep: false,
      }),
    ).toEqual({
      canEditKind: false,
      showKindField: false,
      showKindSummary: false,
    })
  })
})
