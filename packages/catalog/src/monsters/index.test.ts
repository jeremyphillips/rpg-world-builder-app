import { describe, expect, it } from 'vitest'
import {
  CHALLENGE_RATING_MECHANICS,
  deriveMonsterStatBlock,
  formatMonsterMultiattack,
  formatMonsterSaveAction,
  systemDefaultArmorClassRules,
} from '@rpg/contracts'

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

  it('keeps migrated action ids and generates the agreed stat-block text', () => {
    const equipmentCatalog = new Map(loadSeedEquipment(RULESET).map((row) => [row.id, row]))
    const knight = monsters.find((monster) => monster.slug === 'knight')
    const mage = monsters.find((monster) => monster.slug === 'mage')
    const hound = monsters.find((monster) => monster.slug === 'hell-hound')
    expect(
      knight?.actions.find((action) => action.id === 'parry' || action.kind === 'special'),
    ).toBeUndefined()
    expect(knight?.reactions.find((action) => action.id === 'parry')?.kind).toBe('special')

    const formatMultiattack = (monster: NonNullable<typeof knight>) => {
      const action = monster.actions.find((entry) => entry.kind === 'multiattack')
      expect(action?.kind).toBe('multiattack')
      if (action?.kind !== 'multiattack') return ''
      return formatMonsterMultiattack({
        monsterName: monster.name,
        action,
        actions: monster.actions,
        equipment: monster.equipment,
        equipmentCatalog,
      })
    }

    expect(formatMultiattack(knight!)).toBe(
      'The knight makes two attacks, using Greatsword or Heavy Crossbow in any combination.',
    )
    expect(formatMultiattack(mage!)).toBe('The mage makes three Arcane Burst attacks.')
    expect(formatMultiattack(hound!)).toBe('The hell hound makes two Bite attacks.')

    const breath = hound?.actions.find((action) => action.id === 'fire-breath')
    const bite = hound?.actions.find((action) => action.id === 'bite')
    expect(breath?.kind).toBe('save')
    expect(bite).toMatchObject({ kind: 'natural-weapon', form: 'bite' })
    expect(breath?.provenance?.excerpt?.excerptId).toBe('monsters/hell-hound/fire-breath')
    if (breath?.kind !== 'save' || !hound) return
    const formatted = formatMonsterSaveAction({
      action: breath,
      abilityScores: hound.abilityScores,
      proficiencyBonus: CHALLENGE_RATING_MECHANICS[hound.challengeRating].proficiencyBonus,
    })
    expect(formatted.heading).toBe('Fire Breath (Recharge 5–6)')
    expect(formatted.body).toBe(
      'Dexterity Saving Throw: DC 12, each creature in a 15-foot Cone. Failure: 17 (5d6) Fire damage. Success: Half damage.',
    )

    for (const monster of [knight, mage, hound]) {
      if (!monster) continue
      for (const action of monster.actions) {
        if (action.kind !== 'multiattack') continue
        for (const step of action.steps) {
          for (const id of step.actionIds) {
            const target = monster.actions.find((entry) => entry.id === id)
            expect(['weapon', 'natural-weapon', 'attack']).toContain(target?.kind)
          }
        }
      }
    }
  })
})
