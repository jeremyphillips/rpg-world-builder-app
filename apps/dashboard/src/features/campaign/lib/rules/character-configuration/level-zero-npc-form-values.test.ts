import { describe, expect, it } from 'vitest'

import { DEFAULT_LEVEL_ZERO_NPC_WEALTH_TIERS } from '@rpg/contracts'

import {
  buildLevelZeroNpcsPatchInput,
  levelZeroNpcsDefaultFormValues,
} from './level-zero-npc-form-values'

describe('buildLevelZeroNpcsPatchInput wealth tiers', () => {
  it('omits wealthTiers from sparse patch when every tier matches defaults', () => {
    expect(buildLevelZeroNpcsPatchInput(levelZeroNpcsDefaultFormValues()) ?? {}).not.toHaveProperty(
      'wealthTiers',
    )
  })

  it('stores only non-default tier overrides in sparse patch', () => {
    const values = levelZeroNpcsDefaultFormValues()
    values.levelZeroWealthTierComfortable = { amount: 40, currency: 'gp' }

    expect(buildLevelZeroNpcsPatchInput(values)).toEqual({
      wealthTiers: {
        comfortable: { gp: 40 },
      },
    })
  })

  it('round-trips an explicit zero wealth tier through sparse patch input', () => {
    const values = levelZeroNpcsDefaultFormValues()
    values.levelZeroWealthTierModest = { amount: 0, currency: 'gp' }

    expect(buildLevelZeroNpcsPatchInput(values)).toEqual({
      wealthTiers: { modest: { gp: 0 } },
    })
  })

  it('includes all tiers in full patch input', () => {
    const patch = buildLevelZeroNpcsPatchInput(levelZeroNpcsDefaultFormValues(), {
      includeDefaultLevelZeroNpcs: true,
    })

    expect(patch?.wealthTiers).toEqual(DEFAULT_LEVEL_ZERO_NPC_WEALTH_TIERS)
  })
})

describe('buildLevelZeroNpcsPatchInput weapon proficiencies (sparse)', () => {
  it('clears a stored martial override when author chooses None', () => {
    const values = levelZeroNpcsDefaultFormValues()
    values.levelZeroWeaponGrantMode = 'none'
    values.levelZeroWeaponProficiencies = { categories: [], items: [] }

    expect(
      buildLevelZeroNpcsPatchInput(values, {
        storedSparse: { weaponProficiencies: { categories: ['martial'], items: [] } },
      }),
    ).toEqual({
      weaponProficiencies: { categories: [], items: [] },
    })
  })

  it('omits weapon proficiencies when unchanged from stored sparse override', () => {
    const values = levelZeroNpcsDefaultFormValues()
    values.levelZeroWeaponGrantMode = 'categories'
    values.levelZeroWeaponProficiencies = { categories: ['martial'], items: [] }
    values.levelZeroWealthTierComfortable = { amount: 40, currency: 'gp' }

    expect(
      buildLevelZeroNpcsPatchInput(values, {
        storedSparse: { weaponProficiencies: { categories: ['martial'], items: [] } },
      }),
    ).toEqual({
      wealthTiers: { comfortable: { gp: 40 } },
    })
  })

  it('omits weapon proficiencies on sparse save when defaults match absent stored override', () => {
    const values = levelZeroNpcsDefaultFormValues()
    values.levelZeroWealthTierModest = { amount: 12, currency: 'gp' }

    expect(buildLevelZeroNpcsPatchInput(values)).toEqual({
      wealthTiers: { modest: { gp: 12 } },
    })
  })

  it('includes empty weapon grant in full patch when mode is none', () => {
    const values = levelZeroNpcsDefaultFormValues()
    values.levelZeroWeaponGrantMode = 'none'

    expect(
      buildLevelZeroNpcsPatchInput(values, { includeDefaultLevelZeroNpcs: true })
        ?.weaponProficiencies,
    ).toEqual({ categories: [], items: [] })
  })
})
