/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'

import { ROUTES } from '@/app/routes'
import { useCampaignStore } from '@/features/campaign'
import { renderWithProviders } from '@/test/render'

vi.mock('@/features/auth', () => ({
  useIsElevatedPlatformRole: vi.fn(() => false),
}))

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
    expect(screen.queryByRole('link', { name: '← All campaigns' })).not.toBeInTheDocument()
  })
})
