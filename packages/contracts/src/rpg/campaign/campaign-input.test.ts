import { describe, expect, it } from 'vitest'

import { createCampaignInputSchema, updateCampaignInputSchema } from './campaign'

describe('createCampaignInputSchema', () => {
  it('accepts a shipped campaign template selection', () => {
    expect(
      createCampaignInputSchema.parse({
        name: 'The Argent Road',
        campaignTemplateId: 'classic-adventure',
      }),
    ).toEqual({
      name: 'The Argent Road',
      campaignTemplateId: 'classic-adventure',
    })
  })
})

describe('updateCampaignInputSchema', () => {
  it('does not expose creation-only template selection', () => {
    expect(updateCampaignInputSchema.parse({ campaignTemplateId: 'classic-adventure' })).toEqual({})
  })
})
