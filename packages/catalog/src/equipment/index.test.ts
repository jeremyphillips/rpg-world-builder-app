import { describe, expect, it } from 'vitest'
import { EQUIPMENT_KINDS } from '@rpg/contracts'

import { loadSeedEquipment, seedEquipmentSlugs } from './index'

const RULESET = 'srd-cc-5.2.1'

describe('SRD 5.2.1 equipment seed', () => {
  const equipment = loadSeedEquipment(RULESET)

  it('ships a representative subset validated against the schema at load', () => {
    expect(equipment.length).toBeGreaterThan(0)
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
})
