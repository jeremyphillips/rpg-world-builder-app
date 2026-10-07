import { describe, expect, it } from 'vitest'

import { MAGIC_ITEM_RARITIES } from '@rpg/contracts'

import {
  formatMagicItemChoiceBucketLabel,
  formatMagicItemChoiceLabel,
  formatMagicItemChoiceLabelFromSourceLabel,
  formatMagicItemChoiceRarityPhrase,
  formatMagicItemChoicesAlreadyUsed,
  formatNoMagicItemChoicesLabel,
  listExhaustedMagicItemChoiceRarities,
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

  it('names a missing choice in sentence case', () => {
    expect(formatNoMagicItemChoicesLabel('common')).toBe('No common choices')
    expect(formatNoMagicItemChoicesLabel('uncommon')).toBe('No uncommon choices')
    expect(formatNoMagicItemChoicesLabel('very_rare')).toBe('No very rare choices')
    expect(formatNoMagicItemChoicesLabel('legendary')).toBe('No legendary choices')
  })

  it('lists filled choices from the item rarity upward', () => {
    const filled = (rarities: Array<'common' | 'uncommon' | 'rare' | 'very_rare' | 'legendary'>) =>
      rarities.map((rarity) => ({
        rarity,
        isFilled: true,
        remainingCapacity: 0,
      }))

    expect(
      listExhaustedMagicItemChoiceRarities({
        itemRarity: 'common',
        progress: filled(['common']),
      }),
    ).toEqual(['common'])
    expect(
      formatMagicItemChoicesAlreadyUsed(
        listExhaustedMagicItemChoiceRarities({
          itemRarity: 'common',
          progress: filled(['common']),
        }),
      ),
    ).toBe('Common choices are already used.')

    expect(
      listExhaustedMagicItemChoiceRarities({
        itemRarity: 'common',
        progress: filled(['common', 'uncommon']),
      }),
    ).toEqual(['common', 'uncommon'])
    expect(formatMagicItemChoicesAlreadyUsed(['common', 'uncommon'])).toBe(
      'Common and uncommon choices are already used.',
    )

    expect(
      listExhaustedMagicItemChoiceRarities({
        itemRarity: 'uncommon',
        progress: filled(['common', 'uncommon']),
      }),
    ).toEqual(['uncommon'])

    expect(
      formatMagicItemChoicesAlreadyUsed(['common', 'uncommon', 'rare', 'very_rare', 'legendary']),
    ).toBe('Common, uncommon, rare, very rare, and legendary choices are already used.')

    expect(
      listExhaustedMagicItemChoiceRarities({
        itemRarity: 'common',
        progress: MAGIC_ITEM_RARITIES.map((rarity) => ({
          rarity,
          isFilled: true,
          remainingCapacity: 0,
        })),
      }),
    ).toEqual([...MAGIC_ITEM_RARITIES])
  })

  it('rebuilds a quantified label from an existing source label', () => {
    expect(formatMagicItemChoiceLabelFromSourceLabel('Common choice', 1)).toBe('Common choice')
    expect(formatMagicItemChoiceLabelFromSourceLabel('Common choice', 3)).toBe('3 Common choices')
  })
})
