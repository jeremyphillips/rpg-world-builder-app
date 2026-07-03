import { describe, expect, it } from 'vitest'

import { ARMOR_CATEGORY_ENTRIES } from './armor/category'
import { PHYSICAL_DAMAGE_TYPE_ENTRIES } from './damage/physical'
import { GEAR_KIND_ENTRIES } from './equipment/gear-kind'
import { TOOL_CATEGORY_ENTRIES } from './equipment/tool-category'
import { FEAT_CATEGORY_ENTRIES } from './feat'
import { LANGUAGE_CATEGORY_ENTRIES } from './language'
import { MOVEMENT_MODE_ENTRIES } from './movement-mode'
import { getTermSentenceForm, pluralizeTermLabel, type GameTermEntry } from './types'
import { WEAPON_CATEGORY_ENTRIES } from './weapon/category'
import { SKILL_ENTRIES } from '../content/skill-proficiency'

const ROLLOUT_ENTRY_TABLES = [
  TOOL_CATEGORY_ENTRIES,
  ARMOR_CATEGORY_ENTRIES,
  GEAR_KIND_ENTRIES,
  WEAPON_CATEGORY_ENTRIES,
  PHYSICAL_DAMAGE_TYPE_ENTRIES,
  LANGUAGE_CATEGORY_ENTRIES,
  MOVEMENT_MODE_ENTRIES,
  FEAT_CATEGORY_ENTRIES,
  SKILL_ENTRIES,
] as const

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
