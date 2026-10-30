import { describe, expect, it } from 'vitest'
import { deriveMonsterStatBlock, systemDefaultArmorClassRules } from '@rpg/contracts'

import { loadSeedEquipment } from '../equipment'
import { loadSeedMonsters, seedMonsterSlugs } from './index'

const RULESET = 'srd-cc-5.2.1'

describe('SRD 5.2.1 monster seed', () => {
  const monsters = loadSeedMonsters(RULESET)

  it('loads the system monster seeds validated against monsterSchema', () => {
    expect(monsters).toHaveLength(5)
    expect(seedMonsterSlugs(RULESET)).toEqual(
      new Set(['kobold-warrior', 'skeleton', 'knight', 'mage', 'hell-hound']),
    )
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

  it('derives Knight, Mage, and Hell Hound stat lines from authored inputs', () => {
    const equipmentCatalog = new Map(loadSeedEquipment(RULESET).map((row) => [row.id, row]))
    const derive = (slug: string) => {
      const monster = monsters.find((row) => row.slug === slug)
      expect(monster).toBeDefined()
      return deriveMonsterStatBlock({
        monster: monster!,
        equipmentCatalog,
        skillCatalog: new Map(),
        armorClassRules: systemDefaultArmorClassRules(),
        magicPropertyProvider: () => undefined,
      })
    }

    const knight = derive('knight')
    expect(knight.initiativeLabel).toBe('+0 (10)')
    expect(knight.hp).toBe(52)
    expect(knight.ac).toEqual(
      expect.objectContaining({ status: 'resolved', value: expect.objectContaining({ ac: 18 }) }),
    )
    expect(knight.attacks.find((line) => line.id === 'greatsword')).toMatchObject({
      attackBonus: 5,
      damage: '10',
      damageExpression: '2d6+3',
      additionalDamage: [{ average: 4, expression: '1d8', damageTypeLabel: 'Radiant' }],
    })
    expect(knight.attacks.find((line) => line.id === 'heavy-crossbow')).toMatchObject({
      attackBonus: 2,
      damage: '11',
      damageExpression: '2d10',
      additionalDamage: [{ average: 4, expression: '1d8' }],
    })

    const mage = derive('mage')
    expect(mage.initiativeLabel).toBe('+2 (12)')
    expect(mage.hp).toBe(81)
    expect(mage.ac).toEqual(
      expect.objectContaining({ status: 'resolved', value: expect.objectContaining({ ac: 15 }) }),
    )
    expect(mage.attacks.find((line) => line.id === 'arcane-burst')).toMatchObject({
      attackBonus: 6,
      damage: '16',
      damageExpression: '3d8+3',
    })

    const hound = derive('hell-hound')
    expect(hound.initiativeLabel).toBe('+1 (11)')
    expect(hound.hp).toBe(58)
    expect(hound.ac).toEqual(
      expect.objectContaining({ status: 'resolved', value: expect.objectContaining({ ac: 15 }) }),
    )
    expect(hound.attacks.find((line) => line.id === 'bite')).toMatchObject({
      attackBonus: 5,
      damage: '7',
      damageExpression: '1d8+3',
      additionalDamage: [{ average: 3, expression: '1d6' }],
    })
  })
})
