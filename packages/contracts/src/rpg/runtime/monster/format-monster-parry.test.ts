import { describe, expect, it } from 'vitest'

import { formatMonsterParryResponse, formatMonsterParryTrigger } from './format-monster-parry'

describe('formatMonsterParry', () => {
  it('derives the trigger from the current name and omits a response without a bonus', () => {
    expect(formatMonsterParryTrigger('Knight')).toBe(
      'The knight is hit by a melee attack roll while holding a weapon.',
    )
    expect(formatMonsterParryTrigger('')).toBe(
      'The creature is hit by a melee attack roll while holding a weapon.',
    )
    expect(
      formatMonsterParryResponse({ monsterName: 'Knight', acBonus: undefined }),
    ).toBeUndefined()
    expect(formatMonsterParryResponse({ monsterName: 'Gladiator', acBonus: 3 })).toBe(
      'The gladiator adds 3 to its AC against that attack, possibly causing it to miss.',
    )
  })

  it('renames both sentences and appends a resolved on-miss attack', () => {
    expect(formatMonsterParryTrigger('Warrior Veteran')).toBe(
      'The warrior veteran is hit by a melee attack roll while holding a weapon.',
    )
    expect(
      formatMonsterParryResponse({
        monsterName: 'Pirate Captain',
        acBonus: 3,
        followUpAttackName: 'Rapier',
      }),
    ).toBe(
      'The pirate captain adds 3 to its AC against that attack, possibly causing it to miss. On a miss, the pirate captain makes one Rapier attack against the triggering creature if within range.',
    )
  })

  it('rejects bonuses outside the authoring bounds', () => {
    expect(formatMonsterParryResponse({ monsterName: 'Knight', acBonus: 0 })).toBeUndefined()
    expect(formatMonsterParryResponse({ monsterName: 'Knight', acBonus: 11 })).toBeUndefined()
    expect(formatMonsterParryResponse({ monsterName: 'Knight', acBonus: 2.5 })).toBeUndefined()
  })
})
