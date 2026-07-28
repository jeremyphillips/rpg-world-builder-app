import { describe, expect, it } from 'vitest'

import { characterBuildAcquisitionSchema } from './acquisition'

describe('characterBuildAcquisitionSchema', () => {
  it('parses standalone acquisition', () => {
    expect(characterBuildAcquisitionSchema.parse({ kind: 'standalone' }).kind).toBe('standalone')
  })

  it('parses campaign npc acquisition', () => {
    const parsed = characterBuildAcquisitionSchema.parse({
      kind: 'campaign_npc',
      campaignId: 'campaign-1',
    })

    expect(parsed).toEqual({ kind: 'campaign_npc', campaignId: 'campaign-1' })
  })

  it('parses campaign pc onboarding acquisition', () => {
    const parsed = characterBuildAcquisitionSchema.parse({
      kind: 'campaign_pc_onboarding',
      campaignId: 'campaign-1',
    })

    expect(parsed).toEqual({ kind: 'campaign_pc_onboarding', campaignId: 'campaign-1' })
  })
})
