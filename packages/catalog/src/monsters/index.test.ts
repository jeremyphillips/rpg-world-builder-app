import { describe, expect, it } from 'vitest'
import { deriveMonsterStatBlock, systemDefaultArmorClassRules } from '@rpg/contracts'

import { loadSeedEquipment } from '../equipment'
import { loadSeedMonsters, seedMonsterSlugs } from './index'

const RULESET = 'srd-cc-5.2.1'

describe('SRD 5.2.1 monster seed', () => {
  const monsters = loadSeedMonsters(RULESET)

  it('loads kobold warrior and skeleton validated against monsterSchema', () => {
    expect(monsters).toHaveLength(2)
    expect(seedMonsterSlugs(RULESET)).toEqual(new Set(['kobold-warrior', 'skeleton']))
  })

  it('derives kobold warrior AC and dagger attack from catalog equipment', () => {
    const kobold = monsters.find((monster) => monster.slug === 'kobold-warrior')
    expect(kobold).toBeDefined()
    const equipmentCatalog = new Map(loadSeedEquipment(RULESET).map((row) => [row.id, row]))
    const block = deriveMonsterStatBlock({
      monster: kobold!,
      equipmentCatalog,
      skillCatalog: new Map(),
      armorClassRules: systemDefaultArmorClassRules(),
      magicPropertyProvider: () => undefined,
    })
    expect(block.ac).toEqual(
      expect.objectContaining({ status: 'resolved', value: expect.objectContaining({ ac: 14 }) }),
    )
    expect(block.attacks.find((line) => line.id === 'dagger')?.attackBonus).toBe(4)
  })
})
