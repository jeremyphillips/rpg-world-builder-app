import { describe, expect, it } from 'vitest'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

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
      viewerOnboardingState: 'incomplete',
    })

    expect(toRecoveryPromotion(campaign)).toMatchObject({
      kind: 'finish_joining',
      campaignId: 'camp_incomplete',
      title: 'Finish joining Stormwatch',
      href: '/campaigns/camp_incomplete/onboarding',
      tone: 'warning',
    })
  })

  it('maps invalid participation to a non-onboarding promotion', () => {
    expect(
      toRecoveryPromotion(
        makeCampaignListItem({
          id: 'camp_invalid',
          identity: { name: 'Stormwatch' },
          viewerOnboardingState: 'invalid',
        }),
      ),
    ).toMatchObject({
      kind: 'participation_invalid',
      href: '/campaigns/camp_invalid',
      tone: 'destructive',
    })
  })

  it('lists every recoverable campaign regardless of preference', () => {
    const campaigns = [
      makeCampaignListItem({ id: 'camp_a', viewerOnboardingState: 'complete' }),
      makeCampaignListItem({ id: 'camp_b', viewerOnboardingState: 'incomplete' }),
      makeCampaignListItem({ id: 'camp_c', viewerOnboardingState: 'invalid' }),
    ]

    expect(listRecoverableCampaigns(campaigns).map((campaign) => campaign.id)).toEqual([
      'camp_b',
      'camp_c',
    ])
  })

  it('promotes preferred recoverable campaign when preference points at it', () => {
    const incompleteB = makeCampaignListItem({
      id: 'camp_b',
      viewerOnboardingState: 'incomplete',
    })
    const campaigns = [
      makeCampaignListItem({ id: 'camp_a', viewerOnboardingState: 'complete' }),
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
      makeCampaignListItem({ id: 'camp_a', viewerOnboardingState: 'complete' }),
      makeCampaignListItem({ id: 'camp_b', viewerOnboardingState: 'incomplete' }),
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
      makeCampaignListItem({ id: 'camp_a', viewerOnboardingState: 'complete' }),
      makeCampaignListItem({ id: 'camp_b', viewerOnboardingState: 'incomplete' }),
    ]

    const { promotion, recoverableCount } = resolveCampaignRecoveryPromotions(campaigns, {
      storedCampaignId: 'camp_a',
      lastSelectedCampaignId: 'camp_a',
    })

    expect(promotion?.campaignId).toBe('camp_b')
    expect(recoverableCount).toBe(1)
  })
})
