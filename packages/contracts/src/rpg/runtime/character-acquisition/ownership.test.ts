import { describe, expect, it } from 'vitest'

import { resolveCharacterOwnershipTarget } from './ownership'

describe('resolveCharacterOwnershipTarget', () => {
  it('derives user ownership for PCs regardless of rules scope', () => {
    expect(
      resolveCharacterOwnershipTarget('pc', {
        type: 'ruleset',
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).toEqual({ type: 'user' })

    expect(
      resolveCharacterOwnershipTarget('pc', {
        type: 'campaign',
        campaignId: 'camp_1',
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).toEqual({ type: 'user' })
  })

  it('derives campaign ownership for NPCs in campaign scope', () => {
    expect(
      resolveCharacterOwnershipTarget('npc', {
        type: 'campaign',
        campaignId: 'camp_1',
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).toEqual({ type: 'campaign', campaignId: 'camp_1' })
  })

  it('rejects NPC authoring outside campaign scope', () => {
    expect(() =>
      resolveCharacterOwnershipTarget('npc', {
        type: 'ruleset',
        rulesetId: 'srd-cc-5.2.1',
      }),
    ).toThrow(/campaign rules scope/)
  })
})
