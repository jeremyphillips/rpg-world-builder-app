import { describe, expect, it } from 'vitest'

import {
  buildCampaignDisplay,
  CAMPAIGN_DISPLAY_FALLBACK_NAME,
  normalizeCampaignDisplayName,
} from './campaign-display'

describe('normalizeCampaignDisplayName', () => {
  it('trims whitespace without substituting the fallback name', () => {
    expect(normalizeCampaignDisplayName('  The Argent Road  ')).toBe('The Argent Road')
    expect(normalizeCampaignDisplayName('')).toBe('')
  })
})

describe('buildCampaignDisplay', () => {
  it('maps identity.name to a display view model', () => {
    expect(
      buildCampaignDisplay({
        id: 'camp_1',
        identity: { name: '  The Argent Road  ' },
      }),
    ).toEqual({
      id: 'camp_1',
      name: 'The Argent Road',
      imageUrl: null,
    })
  })

  it('maps flat name when identity is absent', () => {
    expect(
      buildCampaignDisplay({
        id: 'camp_2',
        name: 'Fallback Shape',
      }),
    ).toEqual({
      id: 'camp_2',
      name: 'Fallback Shape',
      imageUrl: null,
    })
  })

  it('exports the fallback copy constant for missing-state surfaces', () => {
    expect(CAMPAIGN_DISPLAY_FALLBACK_NAME).toBe('Campaign')
  })
})
