import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { VISIBLE_SIDEBAR_CONTENT } from '@/features/homebrew'
import { ROUTES } from '@/app/routes'

import { CampaignNavSection } from './campaign-nav-section'

vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    CampaignSwitcher: () => <div data-testid="campaign-switcher" />,
    useActiveCampaignId: () => 'camp_1',
    useCampaignCharacterNavigationContext: () => ({
      nav: {
        showCharactersNav: true,
        label: 'Characters',
        href: ROUTES.campaign.characters.list('camp_1'),
        mode: 'list',
        activeSection: 'characters',
      },
      list: {
        pageTitle: 'Characters',
        emptyState: 'no_participating_characters',
      },
    }),
  }
})

describe('CampaignNavSection', () => {
  it('lists visible-sidebar content entries and Homebrew after the final content entry', () => {
    render(
      <MemoryRouter>
        <CampaignNavSection />
      </MemoryRouter>,
    )

    const labels = VISIBLE_SIDEBAR_CONTENT.map((entry) => entry.label)
    for (const label of labels) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument()
    }

    const homebrewLink = screen.getByRole('link', { name: 'Homebrew' })
    expect(homebrewLink).toHaveAttribute('href', ROUTES.homebrew.hub('camp_1'))

    const npcsLink = screen.getByRole('link', { name: 'NPCs' })
    expect(npcsLink).toHaveAttribute('href', ROUTES.campaign.npcs.list('camp_1'))

    const charactersLink = screen.getByRole('link', { name: 'Characters' })
    expect(charactersLink).toHaveAttribute('href', ROUTES.campaign.characters.list('camp_1'))

    const navLinks = screen.getAllByRole('link').map((link) => link.textContent)
    const sessionsIndex = navLinks.indexOf('Sessions')
    const charactersIndex = navLinks.indexOf('Characters')
    const npcsIndex = navLinks.indexOf('NPCs')
    const finalContentIndex = navLinks.indexOf(VISIBLE_SIDEBAR_CONTENT.at(-1)!.label)
    const homebrewIndex = navLinks.indexOf('Homebrew')
    expect(sessionsIndex).toBeGreaterThan(-1)
    expect(charactersIndex).toBe(sessionsIndex + 1)
    expect(npcsIndex).toBe(charactersIndex + 1)
    expect(finalContentIndex).toBeGreaterThan(-1)
    expect(homebrewIndex).toBe(finalContentIndex + 1)
  })
})
