import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'
import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'

import {
  CAMPAIGN_CONNECTION_RESTORE_INDEX_ROW_BODY,
  CAMPAIGN_ONBOARDING_INDEX_ROW_BODY,
} from './campaign-onboarding-copy'
import {
  resolveCampaignEntryDestination,
  resolveCampaignRecoveryDestination,
  shouldRunCampaignSelectionSideEffect,
} from './campaign-destination.lib'

describe('resolveCampaignEntryDestination', () => {
  it('returns campaign detail destination for ready memberships', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_1',
      identity: { name: 'The Argent Road' },
      viewerState: VIEWER_STATE.ready,
    })

    expect(resolveCampaignEntryDestination(campaign)).toEqual({
      href: ROUTES.campaign.detail('camp_1'),
      ariaLabel: 'Open The Argent Road',
      showSetupBadge: false,
      supportingCopy: null,
      shouldPersistSelection: true,
    })
  })

  it('returns campaign detail with setup badge for incomplete memberships', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_2',
      identity: { name: 'Stormwatch' },
      campaignRole: 'pc',
      controlledCharacterIds: [],
      viewerState: VIEWER_STATE.onboardingIncomplete,
    })

    expect(resolveCampaignEntryDestination(campaign)).toEqual({
      href: ROUTES.campaign.detail('camp_2'),
      ariaLabel: 'Open Stormwatch — setup incomplete',
      showSetupBadge: true,
      supportingCopy: CAMPAIGN_ONBOARDING_INDEX_ROW_BODY,
      shouldPersistSelection: true,
    })
  })

  it('returns campaign detail with reconnect copy for stale control', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_3',
      identity: { name: 'Stormwatch' },
      viewerState: VIEWER_STATE.controlStale('char_1'),
    })

    expect(resolveCampaignEntryDestination(campaign)).toEqual({
      href: ROUTES.campaign.detail('camp_3'),
      ariaLabel: 'Open Stormwatch — character connection needs attention',
      showSetupBadge: true,
      supportingCopy: CAMPAIGN_CONNECTION_RESTORE_INDEX_ROW_BODY,
      shouldPersistSelection: true,
    })
  })
})

describe('resolveCampaignRecoveryDestination', () => {
  it('returns onboarding href for incomplete memberships', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_2',
      viewerState: VIEWER_STATE.onboardingIncomplete,
    })

    expect(resolveCampaignRecoveryDestination(campaign)).toEqual({
      href: ROUTES.campaign.onboarding('camp_2'),
      actionLabel: 'Continue setup',
    })
  })

  it('returns reconnect onboarding href for stale control', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_3',
      viewerState: VIEWER_STATE.controlStale('char_1'),
    })

    expect(resolveCampaignRecoveryDestination(campaign)).toEqual({
      href: ROUTES.campaign.onboardingReconnect('camp_3', { characterId: 'char_1' }),
      actionLabel: 'Reconnect character',
    })
  })

  it('returns no CTA for membership_invalid', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_4',
      viewerState: VIEWER_STATE.membershipInvalid,
    })

    expect(resolveCampaignRecoveryDestination(campaign)).toEqual({
      href: null,
      actionLabel: null,
    })
  })
})

describe('shouldRunCampaignSelectionSideEffect', () => {
  it('allows primary unmodified clicks', () => {
    expect(
      shouldRunCampaignSelectionSideEffect({
        button: 0,
        defaultPrevented: false,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
      }),
    ).toBe(true)
  })

  it('skips modified and non-primary clicks', () => {
    expect(
      shouldRunCampaignSelectionSideEffect({
        button: 0,
        defaultPrevented: false,
        metaKey: true,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
      }),
    ).toBe(false)

    expect(
      shouldRunCampaignSelectionSideEffect({
        button: 1,
        defaultPrevented: false,
        metaKey: false,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
      }),
    ).toBe(false)
  })
})
