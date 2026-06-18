import { describe, expect, it } from 'vitest'
import { loadSeedWeapons, seedWeaponSlugs } from './seed'

const RULESET = 'srd-cc-5.2.1' as const

describe('SRD weapons seed', () => {
  it('loads 37 weapons', () => {
    expect(loadSeedWeapons(RULESET)).toHaveLength(37)
  })

  it('all ids are deterministic (<rulesetId>:<slug>)', () => {
    const weapons = loadSeedWeapons(RULESET)
    for (const w of weapons) {
      expect(w.id).toBe(`${RULESET}:${w.slug}`)
    }
  })

  it('slugs are unique', () => {
    const weapons = loadSeedWeapons(RULESET)
    const slugSet = new Set(weapons.map((w) => w.slug))
    expect(slugSet.size).toBe(weapons.length)
  })

  it('seedWeaponSlugs returns a set matching the loaded slugs', () => {
    const weapons = loadSeedWeapons(RULESET)
    const slugSet = seedWeaponSlugs(RULESET)
    expect(slugSet.size).toBe(weapons.length)
    for (const w of weapons) {
      expect(slugSet.has(w.slug)).toBe(true)
    }
  })

  it('all records have source "system" and campaignId null', () => {
    for (const w of loadSeedWeapons(RULESET)) {
      expect(w.source).toBe('system')
      expect(w.campaignId).toBeNull()
    }
  })

  it('simple category is represented', () => {
    const weapons = loadSeedWeapons(RULESET)
    expect(weapons.some((w) => w.category === 'simple')).toBe(true)
  })

  it('martial category is represented', () => {
    const weapons = loadSeedWeapons(RULESET)
    expect(weapons.some((w) => w.category === 'martial')).toBe(true)
  })

  it('melee mode is represented', () => {
    const weapons = loadSeedWeapons(RULESET)
    expect(weapons.some((w) => w.mode === 'melee')).toBe(true)
  })

  it('ranged mode is represented', () => {
    const weapons = loadSeedWeapons(RULESET)
    expect(weapons.some((w) => w.mode === 'ranged')).toBe(true)
  })

  it('net has no damage or damageType', () => {
    const net = loadSeedWeapons(RULESET).find((w) => w.slug === 'net')
    expect(net).toBeDefined()
    expect(net!.damage).toBeUndefined()
    expect(net!.damageType).toBeUndefined()
  })

  it('blowgun has flat damage of 1', () => {
    const blowgun = loadSeedWeapons(RULESET).find((w) => w.slug === 'blowgun')
    expect(blowgun).toBeDefined()
    expect(blowgun!.damage).toEqual({ kind: 'flat', amount: 1 })
  })

  it('quarterstaff has versatileDamage 1d8', () => {
    const qs = loadSeedWeapons(RULESET).find((w) => w.slug === 'quarterstaff')
    expect(qs).toBeDefined()
    expect(qs!.versatileDamage).toEqual({ kind: 'dice', count: 1, faces: 8 })
  })

  it('greatsword has 2d6 dice damage', () => {
    const gs = loadSeedWeapons(RULESET).find((w) => w.slug === 'greatsword')
    expect(gs).toBeDefined()
    expect(gs!.damage).toEqual({ kind: 'dice', count: 2, faces: 6 })
  })

  it('lance has specialRules', () => {
    const lance = loadSeedWeapons(RULESET).find((w) => w.slug === 'lance')
    expect(lance).toBeDefined()
    expect(lance!.specialRules).toBeTruthy()
  })

  it('net has specialRules', () => {
    const net = loadSeedWeapons(RULESET).find((w) => w.slug === 'net')
    expect(net!.specialRules).toBeTruthy()
  })

  it('ranged weapons have a range field', () => {
    const weapons = loadSeedWeapons(RULESET)
    const ranged = weapons.filter((w) => w.mode === 'ranged')
    for (const w of ranged) {
      expect(w.range).toBeDefined()
    }
  })
})
