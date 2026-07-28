import { describe, expect, it } from 'vitest'
import type { ChoiceSet } from '@rpg/contracts'

import {
  CHOICE_SET_COMBOBOX_OPTION_THRESHOLD,
  formatChoiceSetSelectionHint,
  normalizeChoiceSetSelection,
  resolveChoiceSetFieldVariant,
} from './choice-set-field.lib'

function choiceSet(overrides: Partial<ChoiceSet> = {}): ChoiceSet {
  return {
    id: 'class:srd-cc-5.2.1:fighter:skills',
    sourceType: 'class',
    sourceId: 'srd-cc-5.2.1:fighter',
    choiceType: 'skillProficiency',
    label: 'Class Skills',
    min: 1,
    max: 2,
    options: [
      { id: 'athletics', label: 'Athletics' },
      { id: 'insight', label: 'Insight' },
    ],
    required: true,
    ...overrides,
  }
}

describe('resolveChoiceSetFieldVariant', () => {
  it('uses searchable combobox when the option pool exceeds the threshold', () => {
    const options = Array.from(
      { length: CHOICE_SET_COMBOBOX_OPTION_THRESHOLD + 1 },
      (_, index) => ({
        id: `tool-${index}`,
        label: `Tool ${index}`,
      }),
    )

    expect(resolveChoiceSetFieldVariant(choiceSet({ options, max: 1 }))).toBe('searchable-combobox')
    expect(resolveChoiceSetFieldVariant(choiceSet({ options, max: 3 }))).toBe('searchable-combobox')
  })

  it('uses single-card when max is 1 and the pool is small', () => {
    expect(resolveChoiceSetFieldVariant(choiceSet({ max: 1, min: 1 }))).toBe('single-card')
  })

  it('uses multi-chips for small multi-select pools', () => {
    expect(resolveChoiceSetFieldVariant(choiceSet({ max: 2, min: 2 }))).toBe('multi-chips')
  })
})

describe('formatChoiceSetSelectionHint', () => {
  it('describes exact single and multi counts', () => {
    expect(formatChoiceSetSelectionHint(choiceSet({ min: 1, max: 1 }))).toBe('Choose 1 option')
    expect(formatChoiceSetSelectionHint(choiceSet({ min: 2, max: 2 }))).toBe('Choose 2 options')
  })

  it('describes ranged counts', () => {
    expect(formatChoiceSetSelectionHint(choiceSet({ min: 1, max: 3 }))).toBe('Choose 1–3 options')
  })
})

describe('normalizeChoiceSetSelection', () => {
  it('keeps only the latest value for single-select ChoiceSets', () => {
    expect(normalizeChoiceSetSelection(['first', 'second'], 1)).toEqual(['second'])
  })

  it('truncates multi-select values at max', () => {
    expect(normalizeChoiceSetSelection(['a', 'b', 'c'], 2)).toEqual(['a', 'b'])
  })
})
