/**
 * @vitest-environment jsdom
 */
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'

import { ROUTES } from '@/app/routes'
import { useCampaignStore } from '@/features/campaign'
import { renderWithProviders } from '@/test/render'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'

vi.mock('@/features/auth', () => ({
  useIsElevatedPlatformRole: vi.fn(() => false),
}))

import type * as CampaignFeature from '@/features/campaign'

vi.mock('@/features/campaign', async () => {
  const actual = await vi.importActual<typeof CampaignFeature>('@/features/campaign')
  return {
    ...actual,
    useCanManageCampaign: vi.fn(() => false),
    useCampaignCharacterNavigationContext: vi.fn(() => ({
      nav: {
        showCharactersNav: true,
        label: 'Characters',
        href: ROUTES.campaign.characters.list('camp_1'),
        mode: 'list',
        activeSection: 'characters',
      },
    })),
    useCampaigns: vi.fn(() => ({
      data: [makeCampaignListItem({ id: 'camp_1', identity: { name: 'Sunless Citadel' } })],
      isPending: false,
      isError: false,
    })),
  }
})

import { SidebarNav } from './sidebar-nav'

describe('SidebarNav', () => {
  beforeEach(() => {
    useCampaignStore.setState({ preferredCampaignId: 'camp_preferred' })
  })

  it('renders global navigation on /characters even when preferredCampaignId is set', () => {
    renderWithProviders(<SidebarNav />, { initialEntries: ['/characters'] })

    expect(screen.getByRole('link', { name: 'Characters' })).toHaveAttribute(
      'href',
      ROUTES.characters.list,
    )
    expect(screen.queryByRole('link', { name: 'Overview' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'All campaigns' })).not.toBeInTheDocument()
  })

  it('renders campaign navigation on campaign routes', () => {
    renderWithProviders(
      <Routes>
        <Route path="/campaigns/:campaignId/*" element={<SidebarNav />} />
      </Routes>,
      { initialEntries: ['/campaigns/camp_1/spells'] },
    )

    expect(screen.getByRole('link', { name: 'All campaigns' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Spells' })).toHaveAttribute(
      'href',
      ROUTES.content.spells.overview('camp_1'),
    )
    expect(screen.queryByRole('link', { name: 'Personal workspace' })).not.toBeInTheDocument()
  })
})

describe('GlobalSidebarNav axe', () => {
  itAxe('has no axe accessibility violations', async () => {
    const { container } = renderWithProviders(<SidebarNav />, { initialEntries: ['/characters'] })

    await expectNoAxeViolations(container)
  })
})
