import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { VISIBLE_SIDEBAR_CONTENT } from '@/features/homebrew'
import { ROUTES } from '@/app/routes'

import { CampaignNavSection } from './campaign-nav-section'

vi.mock('@/features/campaign/store/campaign-store', () => ({
  useCampaignStore: (selector: (state: { activeCampaignId: string }) => unknown) =>
    selector({ activeCampaignId: 'camp_1' }),
}))

vi.mock('@/features/campaign', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    CampaignSwitcher: () => <div data-testid="campaign-switcher" />,
  }
})

describe('CampaignNavSection', () => {
  it('lists visible-sidebar content entries and Homebrew below Skill Proficiencies', () => {
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

    const navLinks = screen.getAllByRole('link').map((link) => link.textContent)
    const sessionsIndex = navLinks.indexOf('Sessions')
    const npcsIndex = navLinks.indexOf('NPCs')
    const skillIndex = navLinks.indexOf('Skill Proficiencies')
    const homebrewIndex = navLinks.indexOf('Homebrew')
    expect(sessionsIndex).toBeGreaterThan(-1)
    expect(npcsIndex).toBe(sessionsIndex + 1)
    expect(skillIndex).toBeGreaterThan(-1)
    expect(homebrewIndex).toBe(skillIndex + 1)
  })
})
