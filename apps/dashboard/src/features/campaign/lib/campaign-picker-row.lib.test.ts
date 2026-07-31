import { describe, expect, it } from 'vitest'

import { ROUTES } from '@/app/routes'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { CAMPAIGN_ONBOARDING_INCOMPLETE_COPY } from './campaign-onboarding-copy'
import {
  resolveCampaignPickerRowDestination,
  shouldRunCampaignSelectionSideEffect,
} from './campaign-picker-row.lib'

describe('resolveCampaignPickerRowDestination', () => {
  it('returns campaign detail destination for complete memberships', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_1',
      identity: { name: 'The Argent Road' },
      viewerOnboardingState: 'complete',
    })

    expect(resolveCampaignPickerRowDestination(campaign)).toEqual({
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

    expect(resolveCampaignPickerRowDestination(campaign)).toEqual({
      href: ROUTES.campaign.onboarding('camp_2'),
      ariaLabel: 'Continue setup for Stormwatch',
      showSetupBadge: true,
      supportingCopy: CAMPAIGN_ONBOARDING_INCOMPLETE_COPY.message,
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
