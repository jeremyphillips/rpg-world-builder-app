import { describe, expect, it } from 'vitest'

import { NEUTRAL_OPTION_RECOMMENDATION, type OptionRecommendation } from '../../recommendation'
import { compareProficiencyPickerItemsByRecommendation } from './proficiency-picker-item'
import type { ProficiencyPickerItem } from '../proficiency/resolve-proficiency-picker-items'

function makeProficiencyItem(
  label: string,
  state: Pick<
    ProficiencyPickerItem['state'],
    'isRecommended' | 'canSelect' | 'isAlreadySelected' | 'isAlreadyGranted' | 'isSelectionFull'
  >,
  recommendation?: OptionRecommendation,
): ProficiencyPickerItem {
  return {
    optionId: label.toLowerCase(),
    label,
    state: {
      isAvailable: true,
      disabledReasons: [],
      isAlreadySelected: state.isAlreadySelected,
      isAlreadyGranted: state.isAlreadyGranted,
      isSelectionFull: state.isSelectionFull,
      isRecommended: state.isRecommended,
      recommendation:
        recommendation ??
        (state.isRecommended ? { strength: 'strong', signals: [] } : NEUTRAL_OPTION_RECOMMENDATION),
      canSelect: state.canSelect,
    },
  }
}

describe('compareProficiencyPickerItemsByRecommendation', () => {
  it('ranks recommended language options above peers', () => {
    const recommended = makeProficiencyItem('Elvish', {
      isRecommended: true,
      canSelect: true,
      isAlreadySelected: false,
      isAlreadyGranted: false,
      isSelectionFull: false,
    })
    const peer = makeProficiencyItem('Dwarvish', {
      isRecommended: false,
      canSelect: true,
      isAlreadySelected: false,
      isAlreadyGranted: false,
      isSelectionFull: false,
    })

    expect(compareProficiencyPickerItemsByRecommendation(recommended, peer)).toBeLessThan(0)
  })

  it('does not sink a granted option below a later selectable peer', () => {
    const granted = makeProficiencyItem('Alpha', {
      isRecommended: false,
      canSelect: false,
      isAlreadySelected: false,
      isAlreadyGranted: true,
      isSelectionFull: false,
    })
    const selectable = makeProficiencyItem('Zebra', {
      isRecommended: false,
      canSelect: true,
      isAlreadySelected: false,
      isAlreadyGranted: false,
      isSelectionFull: false,
    })

    expect(compareProficiencyPickerItemsByRecommendation(granted, selectable)).toBeLessThan(0)
  })

  it('falls back to label when recommendation matches', () => {
    const alpha = makeProficiencyItem('Alpha', {
      isRecommended: false,
      canSelect: true,
      isAlreadySelected: false,
      isAlreadyGranted: false,
      isSelectionFull: false,
    })
    const beta = makeProficiencyItem('Beta', {
      isRecommended: false,
      canSelect: true,
      isAlreadySelected: false,
      isAlreadyGranted: false,
      isSelectionFull: false,
    })

    expect(compareProficiencyPickerItemsByRecommendation(alpha, beta)).toBeLessThan(0)
  })

  it('ranks compatible after strong and before neutral', () => {
    const selectable = {
      canSelect: true,
      isAlreadySelected: false,
      isAlreadyGranted: false,
      isSelectionFull: false,
    }
    const strong = makeProficiencyItem('Alpha', { ...selectable, isRecommended: true })
    const compatible = makeProficiencyItem(
      'Mike',
      { ...selectable, isRecommended: false },
      {
        strength: 'compatible',
        signals: [{ strength: 'compatible', basis: 'inferred', specificity: 'exact' }],
      },
    )
    const neutral = makeProficiencyItem('Zulu', { ...selectable, isRecommended: false })

    expect(compareProficiencyPickerItemsByRecommendation(strong, compatible)).toBeLessThan(0)
    expect(compareProficiencyPickerItemsByRecommendation(compatible, neutral)).toBeLessThan(0)
    expect(compatible.state.isRecommended).toBe(false)
  })
})
