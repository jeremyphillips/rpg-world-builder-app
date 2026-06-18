import { describe, expect, it } from 'vitest'
import { loadSeedArmor, seedArmorSlugs } from './seed'

const RULESET = 'srd-cc-5.2.1' as const

describe('SRD armor seed', () => {
  it('loads 13 armor records', () => {
    expect(loadSeedArmor(RULESET)).toHaveLength(13)
  })

  it('all ids are deterministic (<rulesetId>:<slug>)', () => {
    for (const a of loadSeedArmor(RULESET)) {
      expect(a.id).toBe(`${RULESET}:${a.slug}`)
    }
  })

  it('slugs are unique', () => {
    const armor = loadSeedArmor(RULESET)
    const slugSet = new Set(armor.map((a) => a.slug))
    expect(slugSet.size).toBe(armor.length)
  })

  it('seedArmorSlugs returns a set matching the loaded slugs', () => {
    const armor = loadSeedArmor(RULESET)
    const slugSet = seedArmorSlugs(RULESET)
    expect(slugSet.size).toBe(armor.length)
    for (const a of armor) {
      expect(slugSet.has(a.slug)).toBe(true)
    }
  })

  it('all records have source "system" and campaignId null', () => {
    for (const a of loadSeedArmor(RULESET)) {
      expect(a.source).toBe('system')
      expect(a.campaignId).toBeNull()
    }
  })

  it('all four categories are represented', () => {
    const armor = loadSeedArmor(RULESET)
    expect(armor.some((a) => a.category === 'light')).toBe(true)
    expect(armor.some((a) => a.category === 'medium')).toBe(true)
    expect(armor.some((a) => a.category === 'heavy')).toBe(true)
    expect(armor.some((a) => a.category === 'shields')).toBe(true)
  })

  it('shields have acBonus and no baseAc', () => {
    const shields = loadSeedArmor(RULESET).filter((a) => a.category === 'shields')
    expect(shields.length).toBeGreaterThan(0)
    for (const s of shields) {
      expect(s.acBonus).toBeDefined()
      expect(s.baseAc).toBeUndefined()
    }
  })

  it('body armor has baseAc and no acBonus', () => {
    const body = loadSeedArmor(RULESET).filter((a) => a.category !== 'shields')
    for (const a of body) {
      expect(a.baseAc).toBeDefined()
      expect(a.acBonus).toBeUndefined()
    }
  })

  it('plate has addDexModifier false and strengthRequirement 15', () => {
    const plate = loadSeedArmor(RULESET).find((a) => a.slug === 'plate')
    expect(plate).toBeDefined()
    expect(plate!.addDexModifier).toBe(false)
    expect(plate!.strengthRequirement).toBe(15)
  })

  it('leather has addDexModifier true and no maxDexBonus', () => {
    const leather = loadSeedArmor(RULESET).find((a) => a.slug === 'leather')
    expect(leather).toBeDefined()
    expect(leather!.addDexModifier).toBe(true)
    expect(leather!.maxDexBonus).toBeUndefined()
  })

  it('chain-shirt has maxDexBonus 2', () => {
    const chainShirt = loadSeedArmor(RULESET).find((a) => a.slug === 'chain-shirt')
    expect(chainShirt).toBeDefined()
    expect(chainShirt!.maxDexBonus).toBe(2)
  })

  it('chain-mail has strengthRequirement 13', () => {
    const chainMail = loadSeedArmor(RULESET).find((a) => a.slug === 'chain-mail')
    expect(chainMail).toBeDefined()
    expect(chainMail!.strengthRequirement).toBe(13)
  })

  it('heavy armor has stealthDisadvantage true', () => {
    const heavy = loadSeedArmor(RULESET).filter((a) => a.category === 'heavy')
    for (const a of heavy) {
      expect(a.stealthDisadvantage).toBe(true)
    }
  })
})
