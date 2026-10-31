import { describe, expect, it } from 'vitest'
import { systemDefaultArmorClassRules } from '@rpg/contracts'

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
    expect(viewModel.statRows.find((row) => row.id === 'hp')?.value).toContain('7')
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
})
