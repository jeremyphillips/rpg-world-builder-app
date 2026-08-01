import { describe, expect, it } from 'vitest'

import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'

import {
  listRecoverableCampaigns,
  resolveCampaignRecoveryPromotions,
  resolvePromotedRecoveryCampaign,
  toRecoveryPromotion,
} from './campaign-recovery-promotions.lib'

describe('campaign-recovery-promotions', () => {
  it('maps finish joining campaigns to warning promotions', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_incomplete',
      identity: { name: 'Stormwatch' },
      viewerState: VIEWER_STATE.onboardingIncomplete,
    })

    expect(toRecoveryPromotion(campaign)).toMatchObject({
      kind: 'finish_joining',
      campaignId: 'camp_incomplete',
      title: 'Finish joining Stormwatch',
      href: '/campaigns/camp_incomplete/onboarding',
      tone: 'warning',
    })
  })

  it('maps stale control to reconnect promotions', () => {
    expect(
      toRecoveryPromotion(
        makeCampaignListItem({
          id: 'camp_invalid',
          identity: { name: 'Stormwatch' },
          viewerState: VIEWER_STATE.controlStale('char_1'),
        }),
      ),
    ).toMatchObject({
      kind: 'reconnect_character',
      href: '/campaigns/camp_invalid/onboarding?mode=reconnect&characterId=char_1',
      actionLabel: 'Reconnect character',
      tone: 'warning',
    })
  })

  it('lists every self-recoverable campaign regardless of preference', () => {
    const campaigns = [
      makeCampaignListItem({ id: 'camp_a', viewerState: VIEWER_STATE.ready }),
      makeCampaignListItem({ id: 'camp_b', viewerState: VIEWER_STATE.onboardingIncomplete }),
      makeCampaignListItem({ id: 'camp_c', viewerState: VIEWER_STATE.controlStale('char_1') }),
    ]

    expect(listRecoverableCampaigns(campaigns).map((campaign) => campaign.id)).toEqual([
      'camp_b',
      'camp_c',
    ])
  })

  it('promotes preferred recoverable campaign when preference points at it', () => {
    const incompleteB = makeCampaignListItem({
      id: 'camp_b',
      viewerState: VIEWER_STATE.onboardingIncomplete,
    })
    const campaigns = [
      makeCampaignListItem({ id: 'camp_a', viewerState: VIEWER_STATE.ready }),
      incompleteB,
    ]

    expect(
      resolvePromotedRecoveryCampaign(campaigns, {
        storedCampaignId: 'camp_b',
        lastSelectedCampaignId: 'camp_a',
      })?.id,
    ).toBe('camp_b')
  })

  it('falls back to the first recoverable campaign when preference is complete', () => {
    const campaigns = [
      makeCampaignListItem({ id: 'camp_a', viewerState: VIEWER_STATE.ready }),
      makeCampaignListItem({ id: 'camp_b', viewerState: VIEWER_STATE.onboardingIncomplete }),
    ]

    expect(
      resolvePromotedRecoveryCampaign(campaigns, {
        storedCampaignId: 'camp_a',
        lastSelectedCampaignId: 'camp_a',
      })?.id,
    ).toBe('camp_b')
  })

  it('always returns a promotion when any recoverable campaign exists', () => {
    const campaigns = [
      makeCampaignListItem({ id: 'camp_a', viewerState: VIEWER_STATE.ready }),
      makeCampaignListItem({ id: 'camp_b', viewerState: VIEWER_STATE.onboardingIncomplete }),
    ]

    const { promotion, recoverableCount } = resolveCampaignRecoveryPromotions(campaigns, {
      storedCampaignId: 'camp_a',
      lastSelectedCampaignId: 'camp_a',
    })

    expect(promotion?.campaignId).toBe('camp_b')
    expect(recoverableCount).toBe(1)
  })
})
