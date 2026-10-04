import { describe, expect, it } from 'vitest'

import {
  allowsLevelZeroForKind,
  locksCampaignStartingLevel,
  resolveCharacterKindPolicy,
  resolveMagicItemGrantRequirement,
} from './character-kind-policy'

describe('character kind policy', () => {
  it('requires exact magic-item grants and a locked campaign level for player characters', () => {
    expect(resolveMagicItemGrantRequirement('pc')).toBe('exact')
    expect(resolveCharacterKindPolicy('pc')).toEqual({
      equipment: { magicItems: { requirement: 'exact' } },
      level: { lockCampaignStartingLevel: true, allowsLevelZero: false },
    })
  })

  it('treats magic-item grants as optional and allows level zero for NPCs', () => {
    expect(resolveMagicItemGrantRequirement('npc')).toBe('up_to')
    expect(resolveCharacterKindPolicy('npc')).toEqual({
      equipment: { magicItems: { requirement: 'up_to' } },
      level: { lockCampaignStartingLevel: false, allowsLevelZero: true },
    })
  })

  it('allows level zero only for NPCs when the campaign feature is on', () => {
    expect(allowsLevelZeroForKind('npc', true)).toBe(true)
    expect(allowsLevelZeroForKind('npc', false)).toBe(false)
    expect(allowsLevelZeroForKind('pc', true)).toBe(false)
  })

  it('locks campaign starting level for player characters only', () => {
    expect(locksCampaignStartingLevel('pc', 'campaign')).toBe(true)
    expect(locksCampaignStartingLevel('pc', 'ruleset')).toBe(false)
    expect(locksCampaignStartingLevel('npc', 'campaign')).toBe(false)
  })
})
