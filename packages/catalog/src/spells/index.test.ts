import { loadSeedClasses, seedClassSlugs } from '@rpg/catalog/classes'
import { isSpellcastingActiveAtLevel } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { expectRichTextHtml } from '../lib/expect-rich-text-html'
import { loadSeedSpells, loadSeedSpellsByLevel, seedSpellSlugs, SPELL_LEVEL_FILES } from './index'

const RULESET = 'srd-cc-5.2.1' as const
const SRD_CLASS_SLUGS = seedClassSlugs(RULESET)
const SPELL_OPTION_HEADROOM = 2

describe('SRD 5.2.1 spell seed', () => {
  const spells = loadSeedSpells(RULESET)

  it('ships 92 curated spells (validated against the schema at load)', () => {
    expect(spells).toHaveLength(92)
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
    expect(seedSpellSlugs(RULESET).size).toBe(92)
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

  it('keeps scaling prose out of descriptions', () => {
    for (const spell of spells) {
      expect(spell.description).not.toMatch(/Cantrip Upgrade/i)
      expect(spell.description).not.toMatch(/Using a Higher-Level Spell Slot/i)
    }
  })

  it('stores scaling prose in dedicated fields without headings', () => {
    for (const spell of spells) {
      if (spell.cantripScaling) {
        expect(spell.level).toBe(0)
        expectRichTextHtml(spell.cantripScaling)
        expect(spell.cantripScaling).not.toMatch(/Cantrip Upgrade/i)
      }
      if (spell.higherLevelSlotEffect) {
        expect(spell.level).toBeGreaterThan(0)
        expectRichTextHtml(spell.higherLevelSlotEffect)
        expect(spell.higherLevelSlotEffect).not.toMatch(/Using a Higher-Level Spell Slot/i)
      }
    }
  })

  it('spot-checks fire-bolt cantrip scaling migration', () => {
    const fireBolt = spells.find((s) => s.slug === 'fire-bolt')
    expect(fireBolt?.cantripScaling).toContain('The damage increases by 1d10')
    expect(fireBolt?.description).not.toContain('Cantrip Upgrade')
  })

  it('spot-checks deliveryMethod and ritual casting', () => {
    const poisonSpray = spells.find((s) => s.slug === 'poison-spray')
    expect(poisonSpray?.deliveryMethod).toBe('ranged-spell-attack')

    const detectMagic = spells.find((s) => s.slug === 'detect-magic')
    expect(detectMagic?.castingTime.canBeCastAsRitual).toBe(true)
  })

  it('supplies enough cantrip and level-1 spell options for each level-1 caster', () => {
    const classes = loadSeedClasses(RULESET)

    for (const cls of classes) {
      if (!isSpellcastingActiveAtLevel(cls.spellcasting, 1)) continue

      const cantripsRequired = cls.spellcasting?.cantrips?.find((e) => e.level === 1)?.known ?? 0
      if (cantripsRequired > 0) {
        const cantripOptions = spells.filter(
          (s) => s.level === 0 && s.classIds.includes(cls.slug),
        ).length
        expect(
          cantripOptions,
          `${cls.slug} needs ${cantripsRequired + SPELL_OPTION_HEADROOM} cantrip options`,
        ).toBeGreaterThanOrEqual(cantripsRequired + SPELL_OPTION_HEADROOM)
      }

      const spellsRequired =
        cls.spellcasting?.spellsAvailable?.find((e) => e.level === 1)?.count ?? 0
      if (spellsRequired > 0) {
        const spellOptions = spells.filter(
          (s) => s.level === 1 && s.classIds.includes(cls.slug),
        ).length
        expect(
          spellOptions,
          `${cls.slug} needs ${spellsRequired + SPELL_OPTION_HEADROOM} level-1 spell options`,
        ).toBeGreaterThanOrEqual(spellsRequired + SPELL_OPTION_HEADROOM)
      }
    }
  })
})
