import { describe, expect, it } from 'vitest'

import type { GlobalSearchDocument } from '@rpg/contracts'

import { isGlobalSearchCampaignUnavailable } from './global-search-result-presentation'

describe('isGlobalSearchCampaignUnavailable', () => {
  it('returns true only when campaignAvailable is false', () => {
    const base = {
      id: 'content:feats:feat-1',
      filterGroup: 'content',
      typeLabel: 'Feat',
      title: 'Alert',
      secondary: '',
      target: { kind: 'feat', id: 'feat-1' },
      fields: [{ text: 'Alert', weight: 1, role: 'label' }],
    } satisfies GlobalSearchDocument

    expect(isGlobalSearchCampaignUnavailable(base)).toBe(false)
    expect(isGlobalSearchCampaignUnavailable({ ...base, campaignAvailable: false })).toBe(true)
  })
})
