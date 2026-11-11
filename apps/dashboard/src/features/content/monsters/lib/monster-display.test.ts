import { describe, expect, it } from 'vitest'
import { systemDefaultArmorClassRules, type Equipment, type Monster } from '@rpg/contracts'

import { pickEquipment, pickMonster, pickSkillProficiency } from '@/test/fixtures/pick'

import {
  MONSTER_UNRESOLVED_CATALOG_REFERENCE,
  buildMonsterDetailViewModel,
  tryDeriveMonsterStatBlock,
} from './monster-display'

describe('monster-display', () => {
  it('derives kobold warrior stat rows when catalogs are ready', () => {
    const monster = pickMonster('kobold-warrior')
    const equipment = [pickEquipment('dagger')]
    const skills = [pickSkillProficiency('perception')]
    const derived = tryDeriveMonsterStatBlock(monster, equipment, skills, {
      armorClassRules: systemDefaultArmorClassRules(),
    })
    expect(derived).not.toBeNull()

    const viewModel = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Dragon',
      equipmentById: new Map(equipment.map((item) => [item.id, item])),
      catalogState: 'ready',
      derived,
    })

    expect(viewModel.statRows.find((row) => row.id === 'ac')?.value).toContain('14')
    expect(viewModel.statRows.find((row) => row.id === 'hp')?.value).toBe('7 (3d6 - 3)')
    expect(viewModel.statRows.find((row) => row.id === 'cr')?.value).toBe('1/8 (XP 25; PB +2)')
    expect(viewModel.statRows.find((row) => row.id === 'speed')?.value).toBe('Walk 30 ft.')
    expect(viewModel.detailsLeaves.find((leaf) => leaf.id === 'senses')?.body).toBe(
      'Darkvision 60 ft., Passive Perception 8',
    )
  })

  it('escapes a swarm noun in the stat block', () => {
    const monster = {
      ...pickMonster('hell-hound'),
      traits: [{ id: 'swarm', preset: 'swarm' as const, noun: '<bat>' }],
    }
    const viewModel = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Fiend',
      equipmentById: new Map(),
      catalogState: 'pending',
      derived: null,
    })
    expect(viewModel.traits[0]?.descriptionHtml).toContain('Tiny &lt;bat&gt;')
    expect(viewModel.traits[0]?.descriptionHtml).not.toContain('<bat>')
  })

  it('formats hell hound header rows and hover on the speed phrase', () => {
    const base = pickMonster('hell-hound')
    const monster = {
      ...base,
      hover: true,
      movement: { walk: 20, fly: 40 },
    }
    const derived = tryDeriveMonsterStatBlock(monster, [], [pickSkillProficiency('perception')], {
      armorClassRules: systemDefaultArmorClassRules(),
    })
    const viewModel = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Fiend',
      equipmentById: new Map<string, Equipment>(),
      catalogState: 'ready',
      derived,
    })

    expect(viewModel.statRows.find((row) => row.id === 'cr')?.value).toBe('3 (XP 700; PB +2)')
    expect(viewModel.statRows.find((row) => row.id === 'hp')?.value).toBe('58 (9d8 + 18)')
    expect(viewModel.statRows.find((row) => row.id === 'speed')?.value).toBe(
      'Walk 20 ft., Fly 40 ft. (hover)',
    )
    expect(viewModel.detailsLeaves.find((leaf) => leaf.id === 'senses')?.body).toBe(
      'Darkvision 60 ft., Passive Perception 15',
    )
  })

  it('keeps the detail ready when only armor class is a missing reference', () => {
    const base = pickMonster('kobold-warrior')
    const monster = {
      ...base,
      equipment: [
        ...base.equipment,
        {
          entryId: 'missing-weapon',
          equipmentId: 'missing-weapon',
          quantity: 1,
          equipped: true,
        },
      ],
    }
    const equipment = [pickEquipment('dagger')]
    const derived = tryDeriveMonsterStatBlock(
      monster,
      equipment,
      [pickSkillProficiency('perception')],
      {
        armorClassRules: systemDefaultArmorClassRules(),
      },
    )

    expect(derived?.ac).toEqual({ status: 'unavailable', reason: 'missing-reference' })

    const viewModel = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Dragon',
      equipmentById: new Map(equipment.map((item) => [item.id, item])),
      catalogState: 'ready',
      derived,
    })

    expect(viewModel.catalogState).toBe('ready')
    expect(viewModel.statRows.find((row) => row.id === 'ac')?.value).toBe('Missing armor reference')
    expect(viewModel.statRows.find((row) => row.id === 'hp')?.value).toContain('7')
    expect(viewModel.abilities.length).toBeGreaterThan(0)
  })

  it('shows gear alias with catalog name as secondary text', () => {
    const monster = {
      ...pickMonster('kobold-warrior'),
      equipment: [
        {
          entryId: 'dagger',
          equipmentId: pickEquipment('dagger').id,
          quantity: 1,
          equipped: true,
          customName: 'Rusty Shiv',
        },
      ],
    }
    const equipment = [pickEquipment('dagger')]
    const viewModel = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Dragon',
      equipmentById: new Map(equipment.map((item) => [item.id, item])),
      catalogState: 'ready',
      derived: null,
    })

    const gear = viewModel.detailsLeaves.find((leaf) => leaf.id === 'gear')
    expect(gear?.body).toContain('Rusty Shiv')
    expect(gear?.body).toContain('Dagger')
  })

  it('surfaces unresolved catalog copy on catalog error', () => {
    const monster = pickMonster('kobold-warrior')
    const viewModel = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Dragon',
      equipmentById: new Map(),
      catalogState: 'error',
      derived: null,
    })

    expect(
      viewModel.actions.some(
        (action) => action.attackLine === MONSTER_UNRESOLVED_CATALOG_REFERENCE,
      ),
    ).toBe(true)
    expect(viewModel.traits.length).toBeGreaterThan(0)
    expect(viewModel.traits.map((trait) => trait.name)).toEqual([
      'Pack Tactics',
      'Sunlight Sensitivity',
    ])
    expect(viewModel.traits[0]?.descriptionHtml).toContain('The kobold warrior')
    expect(viewModel.traits[0]?.descriptionHtml).toContain('its allies')
    expect(viewModel.traits[0]?.descriptionHtml).not.toContain('This creature')
  })

  it('labels an authored reaction trigger and its response', () => {
    const monster = {
      ...pickMonster('kobold-warrior'),
      reactions: [
        {
          id: 'parry',
          kind: 'special' as const,
          name: 'Parry',
          description: '<p>Adds 2 to AC.</p>',
          trigger: { text: 'When hit by a melee attack' },
        },
      ],
    }
    const viewModel = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Dragon',
      equipmentById: new Map(),
      catalogState: 'ready',
      derived: null,
    })

    expect(viewModel.reactions).toEqual([
      expect.objectContaining({
        name: 'Parry',
        triggerLine: 'Trigger: When hit by a melee attack',
        responseLabel: 'Response:',
        descriptionHtml: '<p>Adds 2 to AC.</p>',
      }),
    ])
  })

  it('leaves an unspecified reaction trigger unlabeled', () => {
    const monster = {
      ...pickMonster('kobold-warrior'),
      reactions: [
        {
          id: 'parry',
          kind: 'special' as const,
          name: 'Parry',
          description: '<p>Adds 2 to AC.</p>',
        },
      ],
    }
    const viewModel = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Dragon',
      equipmentById: new Map(),
      catalogState: 'ready',
      derived: null,
    })

    expect(viewModel.reactions[0]?.triggerLine).toBeUndefined()
    expect(viewModel.reactions[0]?.responseLabel).toBeUndefined()
  })

  it('renders structured save and multiattack bodies for hell hound', () => {
    const monster = pickMonster('hell-hound')
    const skills = [pickSkillProficiency('perception')]
    const equipmentById = new Map<string, Equipment>()
    const derived = tryDeriveMonsterStatBlock(monster, [], skills, {
      armorClassRules: systemDefaultArmorClassRules(),
    })
    expect(derived).not.toBeNull()

    const viewModel = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Fiend',
      equipmentById,
      catalogState: 'ready',
      derived,
    })

    const multiattack = viewModel.actions.find((action) => action.id === 'multiattack')
    expect(multiattack?.descriptionHtml).toContain('hell hound makes two Bite attacks')

    const breath = viewModel.actions.find((action) => action.id === 'fire-breath')
    expect(breath?.descriptionHtml).toContain('Dexterity Saving Throw: DC 12')
    expect(breath?.descriptionHtml).toContain('15-foot Cone')
    expect(breath?.descriptionHtml).toContain('Success: Half damage')
  })

  it('omits unavailable traits and actions from the read-only projection', () => {
    const monster = pickMonster('kobold-warrior')
    const hiddenTrait = monster.traits[0]
    const hiddenAction = monster.actions[0]
    expect(hiddenTrait).toBeDefined()
    expect(hiddenAction).toBeDefined()

    const viewModel = buildMonsterDetailViewModel({
      monster: {
        ...monster,
        traits: monster.traits.map((trait) =>
          trait.id === hiddenTrait!.id ? { ...trait, available: false } : trait,
        ),
        actions: monster.actions.map((action) =>
          action.id === hiddenAction!.id ? { ...action, available: false } : action,
        ),
      },
      creatureTypeLabel: 'Dragon',
      equipmentById: new Map(),
      catalogState: 'pending',
      derived: null,
    })

    expect(viewModel.traits.map((trait) => trait.id)).not.toContain(hiddenTrait!.id)
    expect(viewModel.actions.map((action) => action.id)).not.toContain(hiddenAction!.id)
    expect(viewModel.traits.length).toBe(monster.traits.length - 1)
  })

  it('prints kobold template traits with the creature name', () => {
    const monster = pickMonster('kobold-warrior')
    const viewModel = buildMonsterDetailViewModel({
      monster,
      creatureTypeLabel: 'Dragon',
      equipmentById: new Map(),
      catalogState: 'pending',
      derived: null,
    })

    expect(viewModel.traits).toEqual([
      expect.objectContaining({
        id: 'pack-tactics',
        name: 'Pack Tactics',
        descriptionHtml: expect.stringContaining('The kobold warrior has Advantage'),
      }),
      expect.objectContaining({
        id: 'sunlight-sensitivity',
        name: 'Sunlight Sensitivity',
        descriptionHtml: expect.stringContaining('ability checks and attack rolls'),
      }),
    ])
  })

  it('prints the legendary intro and a reference row', () => {
    const monster = {
      ...pickMonster('hell-hound'),
      name: 'Ancient Red Dragon',
      legendaryActionUses: 3,
      actions: [
        {
          id: 'rend',
          kind: 'natural-weapon' as const,
          name: 'Rend',
          mode: 'melee' as const,
          properties: [] as const,
          damage: { dice: { count: 2, faces: 6 } },
          damageType: 'slashing',
        },
      ],
      legendaryActions: [
        {
          id: 'swipe',
          kind: 'action-reference' as const,
          name: 'Tail Swipe',
          actionIds: ['rend'],
        },
      ],
    }
    const viewModel = buildMonsterDetailViewModel({
      monster: monster as unknown as Monster,
      creatureTypeLabel: 'Dragon',
      equipmentById: new Map(),
      catalogState: 'pending',
      derived: null,
    })
    expect(viewModel.legendaryActionsIntro).toContain('Legendary Action Uses: 3')
    expect(viewModel.legendaryActions[0]?.descriptionHtml).toContain('makes one Rend attack')
  })
})
