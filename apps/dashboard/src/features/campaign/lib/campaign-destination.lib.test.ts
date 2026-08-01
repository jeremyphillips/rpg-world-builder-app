import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import {
  CAMPAIGN_ONBOARDING_INDEX_ROW_BODY,
  CAMPAIGN_PARTICIPATION_INVALID_INDEX_ROW_BODY,
} from './campaign-onboarding-copy'
import {
  resolveCampaignDestination,
  shouldRunCampaignSelectionSideEffect,
} from './campaign-destination.lib'

describe('resolveCampaignDestination', () => {
  it('returns campaign detail destination for complete memberships', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_1',
      identity: { name: 'The Argent Road' },
      viewerOnboardingState: 'complete',
    })

    expect(resolveCampaignDestination(campaign)).toEqual({
      href: ROUTES.campaign.detail('camp_1'),
      ariaLabel: 'Open The Argent Road',
      showSetupBadge: false,
      supportingCopy: null,
      shouldPersistSelection: true,
    })
  })

  it('returns onboarding destination with badge and supporting copy for incomplete memberships', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_2',
      identity: { name: 'Stormwatch' },
      campaignRole: 'pc',
      controlledCharacterIds: [],
      viewerOnboardingState: 'incomplete',
    })

    expect(resolveCampaignDestination(campaign)).toEqual({
      href: ROUTES.campaign.onboarding('camp_2'),
      ariaLabel: 'Continue setup for Stormwatch',
      showSetupBadge: true,
      supportingCopy: CAMPAIGN_ONBOARDING_INDEX_ROW_BODY,
      shouldPersistSelection: true,
    })
  })

  it('returns campaign detail with invalid-participation copy instead of onboarding', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_3',
      identity: { name: 'Stormwatch' },
      viewerOnboardingState: 'invalid',
    })

    expect(resolveCampaignDestination(campaign)).toEqual({
      href: ROUTES.campaign.detail('camp_3'),
      ariaLabel: 'Open Stormwatch — character connection needs attention',
      showSetupBadge: true,
      supportingCopy: CAMPAIGN_PARTICIPATION_INVALID_INDEX_ROW_BODY,
      shouldPersistSelection: true,
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
