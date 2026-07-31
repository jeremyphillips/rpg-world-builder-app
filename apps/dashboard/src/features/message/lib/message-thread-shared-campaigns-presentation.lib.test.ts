import { describe, expect, it } from 'vitest'

import {
  buildMessageThreadSharedCampaignDisplay,
  formatMessageThreadSharedCampaignOverflowTooltip,
  formatMessageThreadSharedCampaignOverflowTriggerLabel,
  resolveMessageThreadSharedCampaignsPresentation,
} from './message-thread-shared-campaigns-presentation.lib'

describe('buildMessageThreadSharedCampaignDisplay', () => {
  it('maps conversation shared campaigns to the campaign display VM', () => {
    expect(
      buildMessageThreadSharedCampaignDisplay({
        campaignId: 'camp_1',
        campaignName: '  Curse of Strahd  ',
      }),
    ).toEqual({
      id: 'camp_1',
      name: 'Curse of Strahd',
      imageUrl: null,
    })
  })
})

describe('resolveMessageThreadSharedCampaignsPresentation', () => {
  const campaigns = [
    { campaignId: 'camp_1', campaignName: 'Alpha' },
    { campaignId: 'camp_2', campaignName: 'Beta' },
    { campaignId: 'camp_3', campaignName: 'Gamma' },
    { campaignId: 'camp_4', campaignName: 'Delta' },
  ]

  it('shows all campaigns inline when there are two or fewer', () => {
    expect(resolveMessageThreadSharedCampaignsPresentation(campaigns.slice(0, 2))).toEqual({
      visible: campaigns.slice(0, 2),
      overflow: [],
      overflowCount: 0,
    })
  })

  it('shows the first two campaigns inline and the rest in overflow', () => {
    expect(resolveMessageThreadSharedCampaignsPresentation(campaigns)).toEqual({
      visible: campaigns.slice(0, 2),
      overflow: campaigns.slice(2),
      overflowCount: 2,
    })
  })
})

describe('formatMessageThreadSharedCampaignOverflowTriggerLabel', () => {
  it('formats the overflow trigger label', () => {
    expect(formatMessageThreadSharedCampaignOverflowTriggerLabel(2)).toBe('+2 more')
  })
})

describe('formatMessageThreadSharedCampaignOverflowTooltip', () => {
  it('joins overflow campaign names with plain-text newlines', () => {
    expect(
      formatMessageThreadSharedCampaignOverflowTooltip([
        { campaignId: 'camp_3', campaignName: 'Gamma' },
        { campaignId: 'camp_4', campaignName: 'Delta' },
      ]),
    ).toBe('Gamma\nDelta')
  })
})
