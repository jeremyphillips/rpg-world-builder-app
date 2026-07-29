/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'

import { ROUTES } from '@/app/routes'
import { renderWithProviders } from '@/test/render'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'

vi.mock('@/features/auth', () => ({
  useIsElevatedPlatformRole: vi.fn(),
}))

vi.mock('@/features/campaign', async () => {
  const actual = await vi.importActual<typeof import('@/features/campaign')>('@/features/campaign')
  return {
    ...actual,
    useCanManageCampaign: vi.fn(),
    useCampaignCharacterNavigationContext: vi.fn(),
    useCampaigns: vi.fn(),
    useActiveCampaignId: vi.fn(),
  }
})

import { useIsElevatedPlatformRole } from '@/features/auth'
import {
  useActiveCampaignId,
  useCampaignCharacterNavigationContext,
  useCampaigns,
  useCanManageCampaign,
} from '@/features/campaign'

import { CampaignSidebarNav } from './campaign-sidebar-nav'

const useIsElevatedPlatformRoleMock = vi.mocked(useIsElevatedPlatformRole)
const useCanManageCampaignMock = vi.mocked(useCanManageCampaign)
const useCampaignCharacterNavigationContextMock = vi.mocked(useCampaignCharacterNavigationContext)
const useCampaignsMock = vi.mocked(useCampaigns)
const useActiveCampaignIdMock = vi.mocked(useActiveCampaignId)

const campaignId = 'camp_1'

describe('CampaignSidebarNav', () => {
  beforeEach(() => {
    useIsElevatedPlatformRoleMock.mockReturnValue(false)
    useCanManageCampaignMock.mockReturnValue(false)
    useCampaignCharacterNavigationContextMock.mockReturnValue({
      nav: {
        showCharactersNav: true,
        label: 'Characters',
        href: ROUTES.campaign.characters.list(campaignId),
        mode: 'list',
        activeSection: 'characters',
      },
    } as ReturnType<typeof useCampaignCharacterNavigationContext>)
    useCampaignsMock.mockReturnValue({
      data: [makeCampaignListItem({ id: campaignId, identity: { name: 'Sunless Citadel' } })],
      isPending: false,
      isError: false,
    } as ReturnType<typeof useCampaigns>)
    useActiveCampaignIdMock.mockReturnValue(campaignId)
  })

  it('shows All campaigns exit link and campaign library items on spell routes', () => {
    renderWithProviders(<CampaignSidebarNav campaignId={campaignId} />, {
      initialEntries: [`/campaigns/${campaignId}/spells`],
    })

    expect(screen.getByRole('link', { name: '← All campaigns' })).toHaveAttribute(
      'href',
      ROUTES.campaign.list,
    )
    expect(screen.getByRole('link', { name: 'Spells' })).toHaveAttribute(
      'href',
      ROUTES.content.spells.overview(campaignId),
    )
    expect(screen.queryByRole('link', { name: 'Characters' })).not.toHaveAttribute(
      'href',
      ROUTES.characters.list,
    )
  })
})
