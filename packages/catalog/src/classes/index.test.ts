import { describe, expect, it } from 'vitest'

import { expectRichTextHtml } from '../lib/expect-rich-text-html'
import {
  getClassBySlug,
  getSubclassBySlug,
  loadSeedClasses,
  loadSeedSubclasses,
  seedClassSlugs,
} from './index'

const RULESET = 'srd-cc-5.2.1'

describe('SRD 5.2.1 class seed', () => {
  const classes = loadSeedClasses(RULESET)
  const subclasses = loadSeedSubclasses(RULESET)

  it('ships all 12 classes and their subclasses (validated against the schema at load)', () => {
    expect(classes).toHaveLength(12)
    expect(subclasses).toHaveLength(12)
  })

  it('uses deterministic system ids and null campaignId', () => {
    for (const cls of classes) {
      expect(cls.id).toBe(`${RULESET}:${cls.slug}`)
      expect(cls.source).toBe('system')
      expect(cls.campaignId).toBeNull()
      expect(cls.rulesetId).toBe(RULESET)
    }
  })

  it('has unique class slugs', () => {
    const slugs = classes.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(seedClassSlugs(RULESET).size).toBe(12)
  })

  it('references existing parent class ids from every subclass', () => {
    const classIds = new Set(classes.map((c) => c.id))
    for (const sub of subclasses) {
      expect(classIds.has(sub.classId)).toBe(true)
    }
  })

  it('stores non-empty descriptions as rich-text HTML', () => {
    for (const cls of classes) {
      expectRichTextHtml(cls.description)
      for (const feature of cls.features) {
        expectRichTextHtml(feature.description)
      }
    }
    for (const sub of subclasses) {
      expectRichTextHtml(sub.description)
      for (const feature of sub.features) {
        expectRichTextHtml(feature.description)
      }
    }
  })

  it('Bard ships full feature prose, prepared spells, and Bardic Die resource', () => {
    const bard = getClassBySlug(RULESET, 'bard')
    expect(bard.features).toHaveLength(11)
    expect(bard.features.every((f) => f.description && f.description.length > 0)).toBe(true)
    expect(bard.asiLevels).toEqual([4, 8, 12, 16])
    expect(bard.spellcasting?.spellsAvailable?.find((e) => e.level === 1)?.count).toBe(4)
    expect(bard.spellcasting?.spellsAvailable?.find((e) => e.level === 20)?.count).toBe(22)
    const bardicDie = bard.resources?.find((r) => r.name === 'Bardic Die')
    expect(bardicDie?.entries).toEqual([
      { level: 1, value: 6 },
      { level: 5, value: 8 },
      { level: 10, value: 10 },
      { level: 15, value: 12 },
    ])
    const words = bard.features.find((f) => f.id === 'words-of-creation')
    expect(words?.grants?.innateSpells?.entries[0]).toEqual({
      level: 20,
      kind: 'always_prepared',
      spellIds: ['power-word-heal', 'power-word-kill'],
    })
  })

  it('College of Lore ships four subclass features with rich-text HTML', () => {
    const lore = getSubclassBySlug(RULESET, 'college-of-lore')
    expect(lore.features).toHaveLength(4)
    expect(lore.features.map((f) => f.id)).toEqual([
      'bonus-proficiencies',
      'cutting-words',
      'magical-discoveries',
      'peerless-skill',
    ])
    expect(lore.description).toContain('libraries and universities')
  })
})
