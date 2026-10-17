import { describe, expect, it } from 'vitest'

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
    const derived = tryDeriveMonsterStatBlock(monster, equipment, skills)
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
})
