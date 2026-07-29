/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'

import { ROUTES } from '@/app/routes'
import { renderWithProviders } from '@/test/render'

vi.mock('@/features/auth', () => ({
  useIsElevatedPlatformRole: vi.fn(),
}))

import { useIsElevatedPlatformRole } from '@/features/auth'

import { GlobalSidebarNav } from './global-sidebar-nav'

const useIsElevatedPlatformRoleMock = vi.mocked(useIsElevatedPlatformRole)

describe('GlobalSidebarNav', () => {
  beforeEach(() => {
    useIsElevatedPlatformRoleMock.mockReturnValue(false)
  })

  it('renders global destinations without campaign-scoped links on /characters', () => {
    renderWithProviders(<GlobalSidebarNav />, { initialEntries: ['/characters'] })

    expect(screen.getByRole('link', { name: 'Campaigns' })).toHaveAttribute(
      'href',
      ROUTES.campaign.list,
    )
    expect(screen.getByRole('link', { name: 'Characters' })).toHaveAttribute(
      'href',
      ROUTES.characters.list,
    )
    expect(screen.queryByRole('link', { name: 'Overview' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Spells' })).not.toBeInTheDocument()
  })
})
