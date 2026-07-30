/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ROUTES } from '@/app/routes'
import { VISIBLE_SIDEBAR_CONTENT } from '@/features/homebrew'
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
  }
})

import { useIsElevatedPlatformRole } from '@/features/auth'
import {
  useCampaignCharacterNavigationContext,
  useCampaigns,
  useCanManageCampaign,
} from '@/features/campaign'

import { CampaignSidebarNav } from './campaign-sidebar-nav'
import { SIDEBAR_PREFERENCES_KEY } from './lib/sidebar-preferences'

const useIsElevatedPlatformRoleMock = vi.mocked(useIsElevatedPlatformRole)
const useCanManageCampaignMock = vi.mocked(useCanManageCampaign)
const useCampaignCharacterNavigationContextMock = vi.mocked(useCampaignCharacterNavigationContext)
const useCampaignsMock = vi.mocked(useCampaigns)

const campaignId = 'camp_1'

describe('CampaignSidebarNav', () => {
  beforeEach(() => {
    localStorage.clear()
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
  })

  it('shows All campaigns exit link and full campaign library inventory on spell routes', () => {
    renderWithProviders(<CampaignSidebarNav campaignId={campaignId} />, {
      initialEntries: [`/campaigns/${campaignId}/spells`],
    })

    expect(screen.getByRole('link', { name: 'All campaigns' })).toHaveAttribute(
      'href',
      ROUTES.campaign.list,
    )
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute(
      'href',
      ROUTES.campaign.detail(campaignId),
    )
    expect(screen.getByRole('link', { name: 'Characters' })).toHaveAttribute(
      'href',
      ROUTES.campaign.characters.list(campaignId),
    )
    expect(screen.getByRole('link', { name: 'Spells' })).toHaveAttribute(
      'href',
      ROUTES.content.spells.overview(campaignId),
    )
    expect(screen.getByRole('link', { name: 'NPCs' })).toHaveAttribute(
      'href',
      ROUTES.campaign.npcs.list(campaignId),
    )
    expect(screen.getByRole('link', { name: 'Organizations' })).toHaveAttribute(
      'href',
      ROUTES.content.organizations.overview(campaignId),
    )

    for (const entry of VISIBLE_SIDEBAR_CONTENT.filter(
      (item) => item.contentType !== 'organizations',
    )) {
      expect(screen.getByRole('link', { name: entry.label })).toBeInTheDocument()
    }
    expect(screen.getByRole('link', { name: 'Homebrew' })).toBeInTheDocument()
  })

  it('shows Manage when the viewer can manage the campaign', () => {
    useCanManageCampaignMock.mockReturnValue(true)

    renderWithProviders(<CampaignSidebarNav campaignId={campaignId} />, {
      initialEntries: [`/campaigns/${campaignId}`],
    })

    expect(screen.getByRole('link', { name: 'Campaign Settings' })).toHaveAttribute(
      'href',
      ROUTES.campaign.settings(campaignId),
    )
  })

  it('shows Admin when the viewer has an elevated platform role', () => {
    useIsElevatedPlatformRoleMock.mockReturnValue(true)

    renderWithProviders(<CampaignSidebarNav campaignId={campaignId} />, {
      initialEntries: [`/campaigns/${campaignId}`],
    })

    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute('href', '/admin/users')
    expect(screen.getByRole('link', { name: 'Admin Settings' })).toHaveAttribute(
      'href',
      '/admin/settings',
    )
  })

  it('hides collapsed section links until expanded', async () => {
    const user = userEvent.setup()
    localStorage.setItem(
      SIDEBAR_PREFERENCES_KEY,
      JSON.stringify({ version: 1, expandedSections: { gameLibrary: false } }),
    )

    renderWithProviders(<CampaignSidebarNav campaignId={campaignId} />, {
      initialEntries: [`/campaigns/${campaignId}`],
    })

    expect(screen.queryByRole('link', { name: 'Spells' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Game Library' }))

    expect(screen.getByRole('link', { name: 'Spells' })).toBeInTheDocument()
  })
})
