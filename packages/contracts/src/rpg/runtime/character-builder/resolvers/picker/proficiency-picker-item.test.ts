import { describe, expect, it } from 'vitest'

import { compareProficiencyPickerItemsByRecommendation } from './proficiency-picker-item'
import type { ProficiencyPickerItem } from '../proficiency/resolve-proficiency-picker-items'

function makeProficiencyItem(
  label: string,
  state: Pick<
    ProficiencyPickerItem['state'],
    'isRecommended' | 'canSelect' | 'isAlreadySelected' | 'isAlreadyGranted' | 'isSelectionFull'
  >,
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

  it('ranks selectable options above blocked peers at the same recommendation level', () => {
    const selectable = makeProficiencyItem('Acrobatics', {
      isRecommended: false,
      canSelect: true,
      isAlreadySelected: false,
      isAlreadyGranted: false,
      isSelectionFull: false,
    })
    const blocked = makeProficiencyItem('Arcana', {
      isRecommended: false,
      canSelect: false,
      isAlreadySelected: false,
      isAlreadyGranted: true,
      isSelectionFull: false,
    })

    expect(compareProficiencyPickerItemsByRecommendation(selectable, blocked)).toBeLessThan(0)
  })

  it('falls back to label when recommendation and selectability match', () => {
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
})
