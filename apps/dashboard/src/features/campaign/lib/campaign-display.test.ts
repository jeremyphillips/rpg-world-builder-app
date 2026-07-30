import { describe, expect, it } from 'vitest'

import {
  buildCampaignDisplay,
  CAMPAIGN_UNKNOWN_NAME,
  normalizeCampaignDisplayName,
} from './campaign-display'

describe('normalizeCampaignDisplayName', () => {
  it('trims whitespace without substituting fallback copy', () => {
    expect(normalizeCampaignDisplayName('  The Argent Road  ')).toBe('The Argent Road')
    expect(normalizeCampaignDisplayName('')).toBe('')
  })
})

describe('buildCampaignDisplay', () => {
  it('maps identity.name to the display vm', () => {
    expect(buildCampaignDisplay({ id: 'camp_1', identity: { name: 'The Argent Road' } })).toEqual({
      id: 'camp_1',
      name: 'The Argent Road',
      imageUrl: null,
    })
  })

  it('maps flat name when identity is absent', () => {
    expect(buildCampaignDisplay({ id: 'camp_1', name: 'Flat Name' })).toEqual({
      id: 'camp_1',
      name: 'Flat Name',
      imageUrl: null,
    })
  })
})

describe('campaign display constants', () => {
  it('uses unknown campaign for missing identity', () => {
    expect(CAMPAIGN_UNKNOWN_NAME).toBe('Unknown campaign')
  })
})
