import { describe, expect, it } from 'vitest'
import { EQUIPMENT_KINDS } from '@rpg/contracts'

import {
  EQUIPMENT_KIND_FILES,
  getArmorBySlug,
  getWeaponBySlug,
  loadSeedArmor,
  loadSeedEquipment,
  loadSeedEquipmentByKind,
  loadSeedWeapons,
  seedEquipmentSlugs,
} from './index'

const RULESET = 'srd-cc-5.2.1'

function weapons() {
  return loadSeedWeapons(RULESET)
}

function armor() {
  return loadSeedArmor(RULESET)
}

describe('SRD 5.2.1 equipment seed', () => {
  const equipment = loadSeedEquipment(RULESET)

  it('loads 72 unified equipment records', () => {
    expect(equipment).toHaveLength(72)
  })

  it('uses deterministic system ids and null campaignId', () => {
    for (const item of equipment) {
      expect(item.id).toBe(`${RULESET}:${item.slug}`)
      expect(item.source).toBe('system')
      expect(item.campaignId).toBeNull()
      expect(item.rulesetId).toBe(RULESET)
    }
  })

  it('has unique slugs', () => {
    const slugs = equipment.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
    expect(seedEquipmentSlugs(RULESET).size).toBe(slugs.length)
  })

  it('covers all 8 equipment kinds', () => {
    const presentKinds = new Set(equipment.map((e) => e.kind))
    for (const kind of EQUIPMENT_KINDS) {
      expect(presentKinds.has(kind), `missing kind: ${kind}`).toBe(true)
    }
  })

  it('stores each item in the kind file matching its kind field', () => {
    for (const kind of EQUIPMENT_KIND_FILES) {
      const kindItems = loadSeedEquipmentByKind(RULESET, kind)
      for (const item of kindItems) {
        expect(item.kind).toBe(kind)
      }
    }
  })

  it('orders slugs alphabetically within each kind file', () => {
    for (const kind of EQUIPMENT_KIND_FILES) {
      const slugs = loadSeedEquipmentByKind(RULESET, kind).map((item) => item.slug)
      for (let i = 1; i < slugs.length; i++) {
        expect(slugs[i - 1]!.localeCompare(slugs[i]!)).toBeLessThan(0)
      }
    }
  })

  it('includes Bracers of Defense and Skilled Hireling examples', () => {
    const bracers = getEquipmentBySlugHelper('bracers-of-defense')
    expect(bracers.kind).toBe('magic_item')
    if (bracers.kind === 'magic_item') {
      expect(bracers.rarity).toBe('rare')
      expect(bracers.requiresAttunement).toBe(true)
    }

    const hireling = getEquipmentBySlugHelper('skilled-hireling')
    expect(hireling.kind).toBe('service')
    if (hireling.kind === 'service') {
      expect(hireling.serviceCategory).toBe('hireling')
      expect(hireling.duration).toEqual({ value: 1, unit: 'day' })
    }
  })
})

function getEquipmentBySlugHelper(slug: string) {
  return loadSeedEquipment(RULESET).find((item) => item.slug === slug)!
}

describe('weapon records in unified seed', () => {
  it('loads 37 weapons', () => {
    expect(weapons()).toHaveLength(37)
  })

  it('simple and martial categories are represented', () => {
    expect(weapons().some((w) => w.category === 'simple')).toBe(true)
    expect(weapons().some((w) => w.category === 'martial')).toBe(true)
  })

  it('melee and ranged modes are represented', () => {
    expect(weapons().some((w) => w.mode === 'melee')).toBe(true)
    expect(weapons().some((w) => w.mode === 'ranged')).toBe(true)
  })

  it('net has no damage or damageType', () => {
    const net = getWeaponBySlug(RULESET, 'net')
    expect(net.damage).toBeUndefined()
    expect(net.damageType).toBeUndefined()
    expect(net.specialRules).toBeTruthy()
  })

  it('blowgun has flat damage of 1', () => {
    expect(getWeaponBySlug(RULESET, 'blowgun').damage).toEqual({ kind: 'flat', amount: 1 })
  })

  it('quarterstaff has versatileDamage 1d8', () => {
    expect(getWeaponBySlug(RULESET, 'quarterstaff').versatileDamage).toEqual({
      kind: 'dice',
      count: 1,
      faces: 8,
    })
  })

  it('greatsword has 2d6 dice damage', () => {
    expect(getWeaponBySlug(RULESET, 'greatsword').damage).toEqual({
      kind: 'dice',
      count: 2,
      faces: 6,
    })
  })

  it('lance has specialRules', () => {
    expect(getWeaponBySlug(RULESET, 'lance').specialRules).toBeTruthy()
  })

  it('ranged weapons have a range field', () => {
    for (const w of weapons().filter((item) => item.mode === 'ranged')) {
      expect(w.range).toBeDefined()
    }
  })
})

describe('armor records in unified seed', () => {
  it('loads 13 armor records', () => {
    expect(armor()).toHaveLength(13)
  })

  it('all four categories are represented', () => {
    expect(armor().some((a) => a.category === 'light')).toBe(true)
    expect(armor().some((a) => a.category === 'medium')).toBe(true)
    expect(armor().some((a) => a.category === 'heavy')).toBe(true)
    expect(armor().some((a) => a.category === 'shields')).toBe(true)
  })

  it('shields have acBonus and no baseAc', () => {
    for (const s of armor().filter((a) => a.category === 'shields')) {
      expect(s.acBonus).toBeDefined()
      expect(s.baseAc).toBeUndefined()
    }
  })

  it('body armor has baseAc and no acBonus', () => {
    for (const a of armor().filter((item) => item.category !== 'shields')) {
      expect(a.baseAc).toBeDefined()
      expect(a.acBonus).toBeUndefined()
    }
  })

  it('plate has addDexModifier false and strengthRequirement 15', () => {
    const plate = getArmorBySlug(RULESET, 'plate')
    expect(plate.addDexModifier).toBe(false)
    expect(plate.strengthRequirement).toBe(15)
  })

  it('leather has addDexModifier true and no maxDexBonus', () => {
    const leather = getArmorBySlug(RULESET, 'leather')
    expect(leather.addDexModifier).toBe(true)
    expect(leather.maxDexBonus).toBeUndefined()
  })

  it('chain-shirt has maxDexBonus 2', () => {
    expect(getArmorBySlug(RULESET, 'chain-shirt').maxDexBonus).toBe(2)
  })

  it('chain-mail has strengthRequirement 13', () => {
    expect(getArmorBySlug(RULESET, 'chain-mail').strengthRequirement).toBe(13)
  })

  it('heavy armor has stealthDisadvantage true', () => {
    for (const a of armor().filter((item) => item.category === 'heavy')) {
      expect(a.stealthDisadvantage).toBe(true)
    }
  })
})

describe('legacy equipment remaps', () => {
  it('maps stabling to a stable service', () => {
    const stabling = getEquipmentBySlugHelper('stabling')
    expect(stabling.kind).toBe('service')
    if (stabling.kind === 'service') {
      expect(stabling.serviceCategory).toBe('stable')
    }
  })

  it('maps galley to a water vehicle', () => {
    const galley = getEquipmentBySlugHelper('galley')
    expect(galley.kind).toBe('vehicle')
    if (galley.kind === 'vehicle') {
      expect(galley.vehicleCategory).toBe('water')
      expect(galley.damageThreshold).toBe(20)
    }
  })

  it('maps thieves-tools to the thieves tool category', () => {
    const tools = getEquipmentBySlugHelper('thieves-tools')
    expect(tools.kind).toBe('tool')
    if (tools.kind === 'tool') {
      expect(tools.toolCategory).toBe('thieves')
    }
  })
})
