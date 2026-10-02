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
