import { describe, expect, it } from 'vitest'

import { expectRichTextHtml } from '../lib/expect-rich-text-html'
import type { ContentTrait } from '@rpg/contracts'
import { getTraitGrants, resolveTraitDisplay } from '@rpg/contracts'
import { loadSeedSpecies, seedSpeciesSlugs } from './index'

const RULESET = 'srd-cc-5.2.1' as const

type SeedSpecies = ReturnType<typeof loadSeedSpecies>[number]

function traitDescriptionHtml(trait: ContentTrait): string | undefined {
  return resolveTraitDisplay(trait).descriptionHtml
}

function expectSpeciesRichTextDescriptions(entry: SeedSpecies): void {
  expectRichTextHtml(entry.description)
  for (const trait of entry.traits) {
    expectRichTextHtml(traitDescriptionHtml(trait))
  }
  if (entry.heritage) {
    expectRichTextHtml(entry.heritage.description)
    for (const option of entry.heritage.options) {
      expectRichTextHtml(traitDescriptionHtml(option))
    }
  }
}

describe('SRD 5.2.1 species seed', () => {
  const species = loadSeedSpecies(RULESET)

  it('ships all 9 SRD species (validated against the schema at load)', () => {
    expect(species).toHaveLength(9)
  })

  it('uses deterministic system ids and null campaignId', () => {
    for (const s of species) {
      expect(s.id).toBe(`${RULESET}:${s.slug}`)
      expect(s.source).toBe('system')
      expect(s.campaignId).toBeNull()
      expect(s.rulesetId).toBe(RULESET)
    }
  })

  it('has unique slugs', () => {
    const slugs = species.map((s) => s.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(seedSpeciesSlugs(RULESET).size).toBe(9)
  })

  it('seedSpeciesSlugs matches the loaded slugs', () => {
    const slugSet = seedSpeciesSlugs(RULESET)
    for (const s of species) {
      expect(slugSet.has(s.slug)).toBe(true)
    }
  })

  it('all species are Humanoid', () => {
    for (const s of species) {
      expect(s.creatureType).toBe('humanoid')
    }
  })

  it('every species has at least one size and one trait', () => {
    for (const s of species) {
      expect(s.sizes.length).toBeGreaterThanOrEqual(1)
      expect(s.traits.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('Dragonborn has 10 draconic ancestry options with damageType and resistances grants', () => {
    const dragonborn = species.find((s) => s.slug === 'dragonborn')
    expect(dragonborn).toBeDefined()
    expect(dragonborn!.heritage?.id).toBe('draconic-ancestry')
    expect(dragonborn!.heritage!.options).toHaveLength(10)
    for (const option of dragonborn!.heritage!.options) {
      expect(option.grants?.damageType?.length).toBeGreaterThanOrEqual(1)
      expect(option.grants?.resistances?.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('Elf has elven-lineage heritage with 3 options', () => {
    const elf = species.find((s) => s.slug === 'elf')
    expect(elf).toBeDefined()
    expect(elf!.heritage?.id).toBe('elven-lineage')
    expect(elf!.heritage!.options).toHaveLength(3)
  })

  it('Drow lineage grants darkvision 120 and innate spells', () => {
    const elf = species.find((s) => s.slug === 'elf')!
    const drow = elf.heritage!.options.find((o) => o.id === 'drow')!
    expect(getTraitGrants(drow)?.senses?.[0]).toEqual({ type: 'darkvision', range: 120 })
    expect(getTraitGrants(drow)?.innateSpells?.entries.length).toBeGreaterThanOrEqual(3)
  })

  it('grant darkvision traits derive display name and description', () => {
    const elf = species.find((s) => s.slug === 'elf')!
    const darkvision = elf.traits.find((t) => t.id === 'darkvision')!
    expect(darkvision.kind).toBe('grant')
    const display = resolveTraitDisplay(darkvision)
    expect(display.name).toBe('Darkvision')
    expect(display.descriptionHtml).toBe('<p>You have Darkvision with a range of 60 feet.</p>')
  })

  it('Wood Elf grants a speed override of walk 35', () => {
    const elf = species.find((s) => s.slug === 'elf')!
    const woodElf = elf.heritage!.options.find((o) => o.id === 'wood-elf')!
    expect(woodElf.grants?.speedOverride?.walk).toBe(35)
  })

  it('Tiefling has fiendish-legacy heritage with 3 options', () => {
    const tiefling = species.find((s) => s.slug === 'tiefling')
    expect(tiefling).toBeDefined()
    expect(tiefling!.heritage?.id).toBe('fiendish-legacy')
    expect(tiefling!.heritage!.options).toHaveLength(3)
  })

  it('Tiefling fiendish legacy options each grant a resistance and innate spells', () => {
    const tiefling = species.find((s) => s.slug === 'tiefling')!
    const options = tiefling.heritage!.options
    for (const option of options) {
      expect(option.grants?.resistances?.length).toBeGreaterThanOrEqual(1)
      expect(option.grants?.innateSpells?.entries.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('Human and Tiefling support both medium and small sizes', () => {
    const human = species.find((s) => s.slug === 'human')!
    const tiefling = species.find((s) => s.slug === 'tiefling')!
    expect(human.sizes).toContain('medium')
    expect(human.sizes).toContain('small')
    expect(tiefling.sizes).toContain('medium')
    expect(tiefling.sizes).toContain('small')
    const versatile = human.traits.find((t) => t.id === 'versatile')
    expect(versatile?.grants?.featChoice).toEqual({ category: 'origin', choose: 1 })
  })

  it('Goliath has speed 35', () => {
    const goliath = species.find((s) => s.slug === 'goliath')!
    expect(goliath.speed.walk).toBe(35)
  })

  it('Dwarf grants poison resistance', () => {
    const dwarf = species.find((s) => s.slug === 'dwarf')!
    const resilience = dwarf.traits.find((t) => t.id === 'dwarven-resilience')
    expect(getTraitGrants(resilience!)?.resistances).toContain('poison')
  })

  it('stores non-empty descriptions as rich-text HTML', () => {
    for (const s of species) {
      expectSpeciesRichTextDescriptions(s)
    }
  })
})
