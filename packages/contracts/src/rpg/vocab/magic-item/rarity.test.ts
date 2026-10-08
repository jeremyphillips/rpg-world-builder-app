import { describe, expect, it } from 'vitest'

import {
  getMagicItemRarityEntry,
  getMagicItemRarityLabel,
  getMagicItemRarityProseLabel,
  getMagicItemRaritySentenceForm,
  isLowestMagicItemRarity,
  MAGIC_ITEM_RARITIES,
  MAGIC_ITEM_RARITY_ENTRIES,
  MAGIC_ITEM_RARITY_TERM,
  magicItemRaritySchema,
} from './rarity'
import { getTermCompactLabel, getTermSentenceForm } from '../types'

describe('magicItemRaritySchema', () => {
  it('matches MAGIC_ITEM_RARITIES', () => {
    expect(magicItemRaritySchema.options).toEqual([...MAGIC_ITEM_RARITIES])
  })

  it('has a non-empty label for every rarity', () => {
    for (const rarity of MAGIC_ITEM_RARITIES) {
      expect(MAGIC_ITEM_RARITY_ENTRIES[rarity].label.length).toBeGreaterThan(0)
    }
  })

  it('rejects unknown rarities', () => {
    expect(magicItemRaritySchema.safeParse('mythic').success).toBe(false)
  })
})

describe('magic item rarity vocabulary', () => {
  it('defines the magic item rarity vocabulary term', () => {
    expect(MAGIC_ITEM_RARITY_TERM.label).toBe('Magic Item Rarity')
    expect(getTermCompactLabel(MAGIC_ITEM_RARITY_TERM)).toBe('Rarity')
    expect(getTermSentenceForm(MAGIC_ITEM_RARITY_TERM, 1)).toBe('magic item rarity')
    expect(getTermSentenceForm(MAGIC_ITEM_RARITY_TERM, 2)).toBe('magic item rarities')
  })

  it('has a label and description for every rarity', () => {
    for (const rarity of MAGIC_ITEM_RARITIES) {
      const entry = getMagicItemRarityEntry(rarity)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('treats the first declared rarity as the floor', () => {
    expect(isLowestMagicItemRarity('common')).toBe(true)
    expect(isLowestMagicItemRarity('uncommon')).toBe(false)
    expect(isLowestMagicItemRarity('artifact')).toBe(false)
  })

  it('derives labels from the entry map', () => {
    for (const rarity of MAGIC_ITEM_RARITIES) {
      expect(getMagicItemRarityLabel(rarity)).toBe(MAGIC_ITEM_RARITY_ENTRIES[rarity].label)
    }
  })

  it('returns curated sentence-case rarity names', () => {
    expect(getMagicItemRarityProseLabel('common')).toBe('common')
    expect(getMagicItemRarityProseLabel('very_rare')).toBe('very rare')
    expect(getMagicItemRarityProseLabel('legendary')).toBe('legendary')
    expect(getMagicItemRarityLabel('very_rare')).toBe('Very Rare')
  })

  it('returns counted magic item rarity sentence forms', () => {
    expect(getMagicItemRaritySentenceForm('rare', 1)).toBe('rare magic item')
    expect(getMagicItemRaritySentenceForm('rare', 2)).toBe('rare magic items')
    expect(getMagicItemRaritySentenceForm('very_rare', 2)).toBe('very rare magic items')
    expect(getMagicItemRaritySentenceForm('artifact', 2)).toBe('artifacts')
  })
})
