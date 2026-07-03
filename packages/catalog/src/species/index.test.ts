import { describe, expect, it } from 'vitest'

import { expectRichTextHtml } from '../lib/expect-rich-text-html'
import type { ContentTrait } from '@rpg/contracts'
import { normalizeGrantGroups, resolveTraitDisplay } from '@rpg/contracts'
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
      const grants = option.grantGroups?.[0]?.grants ?? []
      expect(grants.some((g) => g.kind === 'damageType')).toBe(true)
      expect(grants.some((g) => g.kind === 'resistances')).toBe(true)
    }
  })

  it('Elf has elven-lineage heritage with 3 options', () => {
    const elf = species.find((s) => s.slug === 'elf')
    expect(elf).toBeDefined()
    expect(elf!.heritage?.id).toBe('elven-lineage')
    expect(elf!.heritage!.options).toHaveLength(3)
  })

  it('Drow lineage grants darkvision 120 and level-gated spells', () => {
    const elf = species.find((s) => s.slug === 'elf')!
    const drow = elf.heritage!.options.find((o) => o.id === 'drow')!
    const defaultGrants = drow.grantGroups?.[0]?.grants ?? []
    expect(
      defaultGrants.some((g) => g.kind === 'sense' && g.type === 'darkvision' && g.range === 120),
    ).toBe(true)
    // level-1 (default) + level-3 + level-5 groups
    expect(drow.grantGroups?.length).toBeGreaterThanOrEqual(3)
  })

  it('grant darkvision traits derive display name and description', () => {
    const elf = species.find((s) => s.slug === 'elf')!
    const darkvision = elf.traits.find((t) => t.id === 'darkvision')!
    expect(darkvision.kind).toBe('grant')
    const display = resolveTraitDisplay(darkvision)
    expect(display.name).toBe('Darkvision')
    expect(display.descriptionHtml).toBe('<p>You have Darkvision with a range of 60 feet.</p>')
  })

  it('Wood Elf grants +5 ft walking speed', () => {
    const elf = species.find((s) => s.slug === 'elf')!
    const woodElf = elf.heritage!.options.find((o) => o.id === 'wood-elf')!
    const defaultGrants = woodElf.grantGroups?.[0]?.grants ?? []
    const speedGrant = defaultGrants.find((g) => g.kind === 'movement')
    expect(speedGrant).toEqual({
      kind: 'movement',
      mode: 'walk',
      operation: 'bonus',
      value: 5,
      unit: 'ft',
    })
  })

  it('Tiefling has fiendish-legacy heritage with 3 options', () => {
    const tiefling = species.find((s) => s.slug === 'tiefling')
    expect(tiefling).toBeDefined()
    expect(tiefling!.heritage?.id).toBe('fiendish-legacy')
    expect(tiefling!.heritage!.options).toHaveLength(3)
  })

  it('Tiefling fiendish legacy options each grant a resistance and level-gated spells', () => {
    const tiefling = species.find((s) => s.slug === 'tiefling')!
    const options = tiefling.heritage!.options
    for (const option of options) {
      const defaultGrants = option.grantGroups?.[0]?.grants ?? []
      expect(defaultGrants.some((g) => g.kind === 'resistances')).toBe(true)
      // default (resistance + level-1 spell) + level-3 group + level-5 group
      expect(option.grantGroups?.length).toBeGreaterThanOrEqual(3)
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
    const defaultGrants = versatile?.grantGroups?.[0]?.grants ?? []
    const featGrant = defaultGrants.find((g) => g.kind === 'featChoice')
    expect(featGrant).toMatchObject({
      kind: 'featChoice',
      category: 'origin',
      choose: 1,
      recommendedFeatIds: ['skilled'],
    })
  })

  it('Goliath has speed 35', () => {
    const goliath = species.find((s) => s.slug === 'goliath')!
    expect(goliath.speed.walk).toBe(35)
  })

  it('Dwarf grants poison resistance', () => {
    const dwarf = species.find((s) => s.slug === 'dwarf')!
    const resilience = dwarf.traits.find((t) => t.id === 'dwarven-resilience')!
    const defaultGrants = resilience.grantGroups?.[0]?.grants ?? []
    const resistGrant = defaultGrants.find((g) => g.kind === 'resistances')
    expect(resistGrant?.kind === 'resistances' && resistGrant.damageTypes).toContain('poison')
  })

  it('stores non-empty descriptions as rich-text HTML', () => {
    for (const s of species) {
      expectSpeciesRichTextDescriptions(s)
    }
  })

  it('all seed grantGroups are already in canonical form (normalizeGrantGroups round-trip is identity)', () => {
    for (const sp of species) {
      for (const trait of sp.traits) {
        if (!trait.grantGroups) continue
        expect(normalizeGrantGroups(trait.grantGroups)).toEqual(trait.grantGroups)
      }
      for (const option of sp.heritage?.options ?? []) {
        if (!option.grantGroups) continue
        expect(normalizeGrantGroups(option.grantGroups)).toEqual(option.grantGroups)
      }
    }
  })
})
