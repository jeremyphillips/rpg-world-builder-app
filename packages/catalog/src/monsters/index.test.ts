import { describe, expect, it } from 'vitest'
import {
  CHALLENGE_RATING_MECHANICS,
  deriveMonsterStatBlock,
  formatMonsterAttackAction,
  formatMonsterMultiattack,
  formatMonsterSaveAction,
  formatMonsterSpellEntry,
  resolveCreatureTraitGrants,
  resolveMonsterActionIdentity,
  resolveTraitDisplay,
  systemDefaultArmorClassRules,
} from '@rpg/contracts'

import { loadSeedEquipment } from '../equipment'
import { loadSeedSpells } from '../spells'
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

  it('stores the repeated general traits as templates', () => {
    const kobold = monsters.find((monster) => monster.slug === 'kobold-warrior')
    const hound = monsters.find((monster) => monster.slug === 'hell-hound')
    expect(kobold?.traits).toEqual([
      expect.objectContaining({
        id: 'pack-tactics',
        kind: 'template',
        templateId: 'pack-tactics',
      }),
      expect.objectContaining({
        id: 'sunlight-sensitivity',
        kind: 'template',
        templateId: 'sunlight-sensitivity',
      }),
    ])
    expect(hound?.traits).toEqual([
      expect.objectContaining({ id: 'pack-tactics', kind: 'template', templateId: 'pack-tactics' }),
    ])
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
    expect(formatMonsterAttackAction(block.attacks.find((line) => line.id === 'dagger')!)).toBe(
      'Melee or Ranged Attack Roll: +4, reach 5 ft. or range 20/60 ft. Hit: 4 (1d4 + 2) Piercing damage.',
    )
    const skeleton = monsters.find((monster) => monster.slug === 'skeleton')
    const skeletonBlock = deriveMonsterStatBlock({
      monster: skeleton!,
      equipmentCatalog,
      skillCatalog: new Map(),
      armorClassRules: systemDefaultArmorClassRules(),
      magicPropertyProvider: () => undefined,
    })
    expect(
      formatMonsterAttackAction(skeletonBlock.attacks.find((line) => line.id === 'shortsword')!),
    ).toBe('Melee Attack Roll: +5, reach 5 ft. Hit: 6 (1d6 + 3) Piercing damage.')
    expect(
      formatMonsterAttackAction(skeletonBlock.attacks.find((line) => line.id === 'shortbow')!),
    ).toBe('Ranged Attack Roll: +5, range 80/320 ft. Hit: 6 (1d6 + 3) Piercing damage.')
    expect(kobold!.traits.map((trait) => trait.kind)).toEqual(['template', 'template'])
    expect(kobold!.traits[0]).not.toHaveProperty('descriptionOverride')
    expect(kobold!.traits[1]).not.toHaveProperty('descriptionOverride')
    expect(resolveTraitDisplay(kobold!.traits[0]!).descriptionHtml).toContain(
      'This creature has Advantage',
    )
    expect(resolveTraitDisplay(kobold!.traits[1]!).descriptionHtml).toContain(
      'this creature has Disadvantage',
    )
    const grants = resolveCreatureTraitGrants(
      kobold!.traits.map((trait) => ({ trait, source: trait.id })),
    )
    expect(grants.map((row) => row.templateId)).toEqual(['pack-tactics', 'sunlight-sensitivity'])
    expect(grants[0]?.grant).toMatchObject({
      kind: 'rollAdjustment',
      mode: 'advantage',
      rolls: [{ kind: 'attack' }],
    })
    expect(grants[1]?.grant).toMatchObject({
      kind: 'rollAdjustment',
      mode: 'disadvantage',
      circumstance: { kind: 'in-sunlight' },
    })
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
      additionalDamage: [{ average: 4, expression: '1d8', damageTypeId: 'radiant' }],
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
    expect(
      formatMonsterAttackAction(mage.attacks.find((line) => line.id === 'arcane-burst')!),
    ).toBe(
      'Melee or Ranged Attack Roll: +6, reach 5 ft. or range 120 ft. Hit: 16 (3d8 + 3) Force damage.',
    )
    expect(mage.spellcasting.find((line) => line.id === 'spellcasting')).toMatchObject({
      saveDc: 14,
      attackBonus: 6,
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
    expect(formatMonsterAttackAction(hound.attacks.find((line) => line.id === 'bite')!)).toBe(
      'Melee Attack Roll: +5, reach 5 ft. Hit: 7 (1d8 + 3) Piercing damage plus 3 (1d6) Fire damage.',
    )
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
    const spellcasting = mage?.actions.find((action) => action.id === 'spellcasting')
    expect(spellcasting?.kind).toBe('spell')
    if (spellcasting?.kind === 'spell' && mage) {
      const spellsById = new Map(
        loadSeedSpells(RULESET).map((spell) => [
          spell.id,
          {
            name: spell.name,
            level: spell.level,
            castingTime: spell.castingTime,
            resolution: spell.resolution,
          },
        ]),
      )
      const rendered = formatMonsterSpellEntry({
        entry: spellcasting,
        monsterName: mage.name,
        section: 'actions',
        spellsById,
        catalogStatus: 'ready',
        spellsInBody: new Map([[spellcasting.id, spellcasting]]),
        saveDc: 14,
      })
      expect(rendered.bodyHtml).toContain(
        'The mage casts one of the following spells, using Intelligence as the spellcasting ability (spell save DC 14):',
      )
      expect(rendered.bodyHtml).not.toContain('spell attack')
    }
    expect(formatMultiattack(hound!)).toBe('The hell hound makes two Bite attacks.')

    const breath = hound?.actions.find((action) => action.id === 'fire-breath')
    const bite = hound?.actions.find((action) => action.id === 'bite')
    expect(breath?.kind).toBe('save')
    expect(bite).toMatchObject({ kind: 'natural-weapon', form: 'bite' })
    expect(breath?.provenance?.excerpt?.excerptId).toBe('monsters/hell-hound/fire-breath')
    if (breath?.kind !== 'save' || !hound) return
    const breathName = resolveMonsterActionIdentity({
      action: breath,
      equipmentCatalogStatus: 'ready',
    }).displayName
    const formatted = formatMonsterSaveAction({
      action: breath,
      name: breathName,
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
