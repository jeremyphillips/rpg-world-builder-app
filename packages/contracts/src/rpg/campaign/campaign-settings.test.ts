import { describe, expect, it } from 'vitest'

import { campaignSettingsSchema, updateCampaignSettingsInputSchema } from './campaign-settings'

describe('campaignSettingsSchema', () => {
  it('accepts an optional primary world id', () => {
    expect(campaignSettingsSchema.parse({ primaryWorldId: 'world-faerun' })).toEqual({
      primaryWorldId: 'world-faerun',
    })
  })

  it('accepts an empty settings object', () => {
    expect(campaignSettingsSchema.parse({})).toEqual({})
  })
})

describe('updateCampaignSettingsInputSchema', () => {
  it('accepts null to clear the primary world', () => {
    expect(updateCampaignSettingsInputSchema.parse({ primaryWorldId: null })).toEqual({
      primaryWorldId: null,
    })
  })
})
