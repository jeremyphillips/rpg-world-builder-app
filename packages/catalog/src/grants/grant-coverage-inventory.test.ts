import { describe, expect, it } from 'vitest'

import { buildGrantCoverageInventory } from './grant-coverage-inventory'

const RULESET = 'srd-cc-5.2.1' as const

describe('grant coverage inventory (srd-cc-5.2.1)', () => {
  const inventory = buildGrantCoverageInventory(RULESET)

  it('has canonical grantGroups on all seeded grant-bearing content', () => {
    expect(inventory.normalizeRoundTripFailures).toEqual([])
  })

  it('documents the level-1 choice shape contract for builder resolvers', () => {
    expect(inventory.choiceShapeKeys).toEqual([
      'classSkills:choose:from',
      'damageType:heritage',
      'equipment:filtered:tool',
      'featChoice:fighting-style',
      'featChoice:origin',
      'heritage',
      'starting-equipment',
    ])
  })

  it('documents heritage option counts per species', () => {
    expect(inventory.heritageOptionCounts).toEqual({
      dragonborn: 10,
      elf: 3,
      gnome: 2,
      goliath: 6,
      tiefling: 3,
    })
  })

  it('documents class skill choose counts', () => {
    expect(inventory.classSkillChoose).toEqual({
      barbarian: 2,
      bard: 3,
      cleric: 2,
      druid: 2,
      fighter: 2,
      monk: 2,
      paladin: 2,
      ranger: 3,
      rogue: 4,
      sorcerer: 2,
      warlock: 2,
      wizard: 2,
    })
  })
})
