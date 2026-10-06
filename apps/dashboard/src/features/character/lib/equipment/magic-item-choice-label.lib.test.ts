import { describe, expect, it } from 'vitest'

import {
  formatMagicItemChoiceBucketLabel,
  formatMagicItemChoiceLabel,
  formatMagicItemChoiceLabelFromSourceLabel,
  formatMagicItemChoiceRarityPhrase,
} from './magic-item-choice-label.lib'

describe('magic item choice labels', () => {
  it('prefixes up-to allowances and leaves exact ones bare', () => {
    expect(formatMagicItemChoiceRarityPhrase('uncommon')).toBe('Uncommon')
    expect(formatMagicItemChoiceRarityPhrase('uncommon', 'up_to')).toBe('Up to Uncommon')
  })

  it('pluralizes past one copy', () => {
    expect(formatMagicItemChoiceLabel(1, 'common')).toBe('Common choice')
    expect(formatMagicItemChoiceLabel(2, 'uncommon')).toBe('2 Uncommon choices')
    expect(formatMagicItemChoiceLabel(1, 'rare', 'up_to')).toBe('Up to Rare choice')
  })

  it('turns a singular source label into its bucket name', () => {
    expect(formatMagicItemChoiceBucketLabel('Common choice')).toBe('Common choices')
    expect(formatMagicItemChoiceBucketLabel('Up to Rare choice')).toBe('Up to Rare choices')
  })

  it('rebuilds a quantified label from an existing source label', () => {
    expect(formatMagicItemChoiceLabelFromSourceLabel('Common choice', 1)).toBe('Common choice')
    expect(formatMagicItemChoiceLabelFromSourceLabel('Common choice', 3)).toBe('3 Common choices')
  })
})
