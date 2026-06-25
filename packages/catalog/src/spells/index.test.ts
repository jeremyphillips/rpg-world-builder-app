import { CLASS_NAMES } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { expectRichTextHtml } from '../lib/expect-rich-text-html'
import { loadSeedSpells, loadSeedSpellsByLevel, seedSpellSlugs, SPELL_LEVEL_FILES } from './index'

const RULESET = 'srd-cc-5.2.1' as const
const SRD_CLASS_SLUGS = new Set(Object.keys(CLASS_NAMES))

describe('SRD 5.2.1 spell seed', () => {
  const spells = loadSeedSpells(RULESET)

  it('ships 32 curated spells (validated against the schema at load)', () => {
    expect(spells).toHaveLength(32)
  })

  it('uses deterministic system ids and null campaignId', () => {
    for (const spell of spells) {
      expect(spell.id).toBe(`${RULESET}:${spell.slug}`)
      expect(spell.source).toBe('system')
      expect(spell.campaignId).toBeNull()
      expect(spell.rulesetId).toBe(RULESET)
    }
  })

  it('has globally unique slugs', () => {
    const slugs = spells.map((s) => s.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(seedSpellSlugs(RULESET).size).toBe(32)
  })

  it('stores each spell in the level file matching its level field', () => {
    for (const level of SPELL_LEVEL_FILES) {
      const levelSpells = loadSeedSpellsByLevel(RULESET, level)
      for (const spell of levelSpells) {
        expect(spell.level).toBe(level)
      }
    }
  })

  it('orders slugs alphabetically within each level file', () => {
    for (const level of SPELL_LEVEL_FILES) {
      const slugs = loadSeedSpellsByLevel(RULESET, level).map((s) => s.slug)
      for (let i = 1; i < slugs.length; i++) {
        expect(slugs[i - 1]!.localeCompare(slugs[i]!)).toBeLessThan(0)
      }
    }
  })

  it('references only known SRD class slugs in classIds', () => {
    for (const spell of spells) {
      for (const classId of spell.classIds) {
        expect(SRD_CLASS_SLUGS.has(classId)).toBe(true)
      }
    }
  })

  it('stores non-empty descriptions as rich-text HTML', () => {
    for (const spell of spells) {
      expectRichTextHtml(spell.description)
    }
  })

  it('spot-checks deliveryMethod and ritual casting', () => {
    const poisonSpray = spells.find((s) => s.slug === 'poison-spray')
    expect(poisonSpray?.deliveryMethod).toBe('ranged-spell-attack')

    const detectMagic = spells.find((s) => s.slug === 'detect-magic')
    expect(detectMagic?.castingTime.canBeCastAsRitual).toBe(true)
  })
})
