import { describe, expect, it } from 'vitest'

import { characterBuildAcquisitionSchema } from './acquisition'

describe('characterBuildAcquisitionSchema', () => {
  it('parses standalone acquisition', () => {
    expect(characterBuildAcquisitionSchema.parse({ kind: 'standalone' }).kind).toBe('standalone')
  })

  it('parses campaign_npc acquisition', () => {
    const parsed = characterBuildAcquisitionSchema.parse({
      kind: 'campaign_npc',
      campaignId: 'camp_1',
    })
    expect(parsed).toEqual({ kind: 'campaign_npc', campaignId: 'camp_1' })
  })

  it('parses campaign_invite acquisition', () => {
    const parsed = characterBuildAcquisitionSchema.parse({
      kind: 'campaign_invite',
      campaignId: 'camp_1',
      inviteId: 'invite_1',
    })
    expect(parsed.kind).toBe('campaign_invite')
    if (parsed.kind === 'campaign_invite') {
      expect(parsed.inviteId).toBe('invite_1')
    }
  })
})
