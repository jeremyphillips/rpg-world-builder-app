import { describe, expect, it } from 'vitest'

import { loadSeedSpecies, seedSpeciesSlugs } from './seed'

const RULESET = 'srd-cc-5.2.1' as const

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
    const ancestry = dragonborn!.choiceGroups?.find((g) => g.id === 'draconic-ancestry')
    expect(ancestry).toBeDefined()
    expect(ancestry!.options).toHaveLength(10)
    for (const option of ancestry!.options) {
      expect(option.grants?.damageType?.length).toBeGreaterThanOrEqual(1)
      expect(option.grants?.resistances?.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('Elf has an elven-lineage choice group with 3 options', () => {
    const elf = species.find((s) => s.slug === 'elf')
    expect(elf).toBeDefined()
    const lineage = elf!.choiceGroups?.find((g) => g.id === 'elven-lineage')
    expect(lineage).toBeDefined()
    expect(lineage!.kind).toBe('lineage')
    expect(lineage!.options).toHaveLength(3)
  })

  it('Drow lineage grants darkvision 120 and innate spells', () => {
    const elf = species.find((s) => s.slug === 'elf')!
    const drow = elf
      .choiceGroups!.find((g) => g.id === 'elven-lineage')!
      .options.find((o) => o.id === 'drow')!
    expect(drow.grants?.senses?.[0]).toEqual({ type: 'darkvision', range: 120 })
    expect(drow.grants?.innateSpells?.entries.length).toBeGreaterThanOrEqual(3)
  })

  it('Wood Elf grants a speed override of walk 35', () => {
    const elf = species.find((s) => s.slug === 'elf')!
    const woodElf = elf
      .choiceGroups!.find((g) => g.id === 'elven-lineage')!
      .options.find((o) => o.id === 'wood-elf')!
    expect(woodElf.grants?.speedOverride?.walk).toBe(35)
  })

  it('Tiefling has a fiendish-legacy lineage choice group with 3 options', () => {
    const tiefling = species.find((s) => s.slug === 'tiefling')
    expect(tiefling).toBeDefined()
    const legacy = tiefling!.choiceGroups?.find((g) => g.id === 'fiendish-legacy')
    expect(legacy).toBeDefined()
    expect(legacy!.kind).toBe('lineage')
    expect(legacy!.options).toHaveLength(3)
  })

  it('Tiefling fiendish legacy options each grant a resistance and innate spells', () => {
    const tiefling = species.find((s) => s.slug === 'tiefling')!
    const options = tiefling.choiceGroups!.find((g) => g.id === 'fiendish-legacy')!.options
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
  })

  it('Goliath has speed 35', () => {
    const goliath = species.find((s) => s.slug === 'goliath')!
    expect(goliath.speed.walk).toBe(35)
  })

  it('Dwarf grants poison resistance', () => {
    const dwarf = species.find((s) => s.slug === 'dwarf')!
    const resilience = dwarf.traits.find((t) => t.id === 'dwarven-resilience')
    expect(resilience?.grants?.resistances).toContain('poison')
  })
})
