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

  it('parses campaign_pc_onboarding acquisition', () => {
    const parsed = characterBuildAcquisitionSchema.parse({
      kind: 'campaign_pc_onboarding',
      campaignId: 'camp_1',
    })
    expect(parsed).toEqual({ kind: 'campaign_pc_onboarding', campaignId: 'camp_1' })
  })
})
