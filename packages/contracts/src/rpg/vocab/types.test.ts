import { describe, expect, it } from 'vitest'

import { ARMOR_CATEGORY_ENTRIES } from './armor/category'
import { PHYSICAL_DAMAGE_TYPE_ENTRIES } from './damage/physical'
import { GEAR_KIND_ENTRIES } from './equipment/gear-kind'
import { SERVICE_CATEGORY_ENTRIES } from './equipment/service-category'
import { TOOL_CATEGORY_ENTRIES } from './equipment/tool-category'
import { VEHICLE_CATEGORY_ENTRIES } from './equipment/vehicle-category'
import { ABILITY_ENTRIES } from './ability'
import { ALIGNMENT_ENTRIES } from './alignment'
import { CREATURE_SIZE_ENTRIES } from './creature-size'
import { FEAT_CATEGORY_ENTRIES } from './feat'
import { LANGUAGE_CATEGORY_ENTRIES } from './language'
import { ATTACK_RESOLUTION_MODE_ENTRIES } from './mechanics/attack-resolution-mode'
import { EDITION_PRESET_ENTRIES } from './mechanics/edition-preset'
import { MAGIC_ITEM_CATEGORY_ENTRIES } from './magic-item/category'
import { CREATURE_TYPE_TERM } from './creature-type'
import { DAMAGE_TYPE_TERM } from './damage/vocabulary'
import { MAGIC_ITEM_RARITY_ENTRIES, MAGIC_ITEM_RARITY_TERM } from './magic-item/rarity'
import { MOVEMENT_MODE_ENTRIES } from './movement-mode'
import {
  getTermSentenceForm,
  getVocabularyTermLabel,
  pluralizeTermLabel,
  vocabularyTermFieldCopy,
  vocabularyTermLabel,
  type GameTermEntry,
} from './types'
import { USAGE_FREQUENCY_ENTRIES } from './usage-frequency'
import { WEAPON_CATEGORY_ENTRIES } from './weapon/category'

const ROLLOUT_ENTRY_TABLES = [
  TOOL_CATEGORY_ENTRIES,
  ARMOR_CATEGORY_ENTRIES,
  GEAR_KIND_ENTRIES,
  WEAPON_CATEGORY_ENTRIES,
  PHYSICAL_DAMAGE_TYPE_ENTRIES,
  LANGUAGE_CATEGORY_ENTRIES,
  MOVEMENT_MODE_ENTRIES,
  FEAT_CATEGORY_ENTRIES,
  MAGIC_ITEM_CATEGORY_ENTRIES,
  MAGIC_ITEM_RARITY_ENTRIES,
  VEHICLE_CATEGORY_ENTRIES,
  SERVICE_CATEGORY_ENTRIES,
  USAGE_FREQUENCY_ENTRIES,
  ALIGNMENT_ENTRIES,
  CREATURE_SIZE_ENTRIES,
  ABILITY_ENTRIES,
  EDITION_PRESET_ENTRIES,
  ATTACK_RESOLUTION_MODE_ENTRIES,
] as const

describe('vocabularyTermLabel', () => {
  it('returns title-case singular from term.label', () => {
    expect(vocabularyTermLabel(CREATURE_TYPE_TERM)).toBe('Creature Type')
    expect(vocabularyTermLabel(MAGIC_ITEM_RARITY_TERM)).toBe('Magic Item Rarity')
  })

  it('returns curated sentence forms for mid-sentence copy', () => {
    expect(
      vocabularyTermLabel(CREATURE_TYPE_TERM, { number: 'singular', casing: 'sentence' }),
    ).toBe('creature type')
    expect(vocabularyTermLabel(CREATURE_TYPE_TERM, { number: 'plural', casing: 'sentence' })).toBe(
      'creature types',
    )
    expect(vocabularyTermLabel(DAMAGE_TYPE_TERM, { number: 'plural', casing: 'sentence' })).toBe(
      'damage types',
    )
  })

  it('uses sentence plural for title plural until explicit title metadata exists', () => {
    expect(vocabularyTermLabel(CREATURE_TYPE_TERM, { number: 'plural', casing: 'title' })).toBe(
      'creature types',
    )
  })
})

describe('vocabularyTermFieldCopy', () => {
  it('builds sentence-case field labels and choose placeholders', () => {
    expect(vocabularyTermFieldCopy(CREATURE_TYPE_TERM)).toEqual({
      label: 'Creature type',
      placeholder: 'Choose a creature type…',
    })
    expect(vocabularyTermFieldCopy(DAMAGE_TYPE_TERM, { multiple: true })).toEqual({
      label: 'Damage types',
      placeholder: 'Choose damage types…',
    })
  })
})

describe('vocabulary term helpers', () => {
  it('returns the title-case label for a vocabulary concept', () => {
    expect(getVocabularyTermLabel(MAGIC_ITEM_RARITY_TERM)).toBe('Magic Item Rarity')
  })
})

describe('term sentence forms', () => {
  it('derives lowercase singular and simple plural forms by default', () => {
    const entry: GameTermEntry = {
      label: 'Simple Weapon',
      description: 'A simple weapon category.',
    }

    expect(getTermSentenceForm(entry, 1)).toBe('simple weapon')
    expect(getTermSentenceForm(entry, 2)).toBe('simple weapons')
  })

  it('uses explicit sentence forms when present', () => {
    const entry: GameTermEntry = {
      label: "Thieves' Tools",
      description: 'Lockpicks and related tools.',
      sentence: {
        singular: "set of thieves' tools",
        plural: "sets of thieves' tools",
      },
    }

    expect(getTermSentenceForm(entry, 1)).toBe("set of thieves' tools")
    expect(getTermSentenceForm(entry, 2)).toBe("sets of thieves' tools")
  })

  it('does not append another s when the singular already ends in s', () => {
    expect(pluralizeTermLabel("Thieves' Tools")).toBe("thieves' tools")
    expect(
      getTermSentenceForm(
        {
          label: "Thieves' Tools",
          description: 'Lockpicks and related tools.',
        },
        2,
      ),
    ).toBe("thieves' tools")
  })

  it('keeps rollout entry sentence forms non-empty and free of ss endings', () => {
    for (const table of ROLLOUT_ENTRY_TABLES) {
      for (const entry of Object.values(table)) {
        expect(getTermSentenceForm(entry, 1)).not.toBe('')
        expect(getTermSentenceForm(entry, 2)).not.toBe('')
        expect(getTermSentenceForm(entry, 2)).not.toMatch(/\b\w*ss\b/)
      }
    }
  })
})
