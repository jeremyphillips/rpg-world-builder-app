/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { buildCampaignCharacterNavigationContext } from '../lib/build-campaign-character-navigation-context'
import { useCampaignCharacterNavigationContext } from './use-campaign-character-navigation-context'

vi.mock('./use-campaigns', () => ({
  useCampaigns: vi.fn(),
}))

import { useCampaigns } from './use-campaigns'

const useCampaignsMock = vi.mocked(useCampaigns)

describe('useCampaignCharacterNavigationContext', () => {
  it('delegates to the pure builder with campaign list data', () => {
    const campaign = makeCampaignListItem({
      id: 'camp_1',
      campaignRole: 'pc',
      openControlledCharacterIds: ['char_1'],
      controlledCharacterIds: ['char_1'],
    })

    useCampaignsMock.mockReturnValue({ data: [campaign] } as ReturnType<typeof useCampaigns>)

    const { result } = renderHook(() => useCampaignCharacterNavigationContext('camp_1'))

    expect(result.current).toEqual(
      buildCampaignCharacterNavigationContext({
        campaignId: 'camp_1',
        role: 'pc',
        openControlledCharacterIds: ['char_1'],
        onboardingIncomplete: false,
      }),
    )
  })
})
