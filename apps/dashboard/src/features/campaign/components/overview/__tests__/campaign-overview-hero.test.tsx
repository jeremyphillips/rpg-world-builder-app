import type { ComponentProps } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ROUTES } from '@/app/routes'
import { MESSAGES_ACTION_COPY } from '@/features/message'
import { renderWithProviders } from '@/test/render'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { CampaignOverviewHero } from '../campaign-overview-hero'

const mutateAsync = vi.fn()

vi.mock('../../../hooks/use-send-campaign-invite', () => ({
  useSendCampaignInvite: () => ({
    mutateAsync,
    isPending: false,
    isSuccess: false,
  }),
}))

const campaign = makeCampaignListItem({
  identity: { name: 'Sunless Citadel' },
  configuration: {
    flavor: {
      playStyle: ['dungeon_crawl'],
      mood: ['heroic'],
      magicLevel: 'standard_fantasy',
    },
  },
})

function renderHero(overrides: Partial<ComponentProps<typeof CampaignOverviewHero>> = {}) {
  return renderWithProviders(
    <CampaignOverviewHero
      campaign={campaign}
      campaignId="camp_1"
      canManage={false}
      playerCount={4}
      characterCount={6}
      countsPending={false}
      {...overrides}
    />,
  )
}

describe('CampaignOverviewHero', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('renders the campaign title and status line with counts', () => {
    renderHero()

    const heading = screen.getByRole('heading', { level: 1, name: 'Sunless Citadel' })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveClass(
      'heading-style-subsection',
      'md:heading-style-sheet-section',
      'lg:heading-style-page',
    )
    expect(screen.getByText('Active · 4 players · 6 characters')).toBeInTheDocument()
  })

  it('shows only the status word while counts are pending', () => {
    renderHero({ countsPending: true, playerCount: undefined, characterCount: undefined })

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.queryByText(/players/)).not.toBeInTheDocument()
  })

  it('renders flavor badges from campaign configuration', () => {
    renderHero()

    expect(screen.getByText('Dungeon Crawl')).toBeInTheDocument()
    expect(screen.getByText('Heroic')).toBeInTheDocument()
    expect(screen.getByText('Standard Fantasy')).toBeInTheDocument()
  })

  it('lists invite first for managers and opens the invite dialog from the menu', async () => {
    const user = userEvent.setup()
    renderHero({ canManage: true })

    await user.click(screen.getByRole('button', { name: 'Open actions for Sunless Citadel' }))

    const menu = screen.getByRole('menu')
    expect(menu.textContent).toMatch(
      new RegExp(
        `Invite member.*${MESSAGES_ACTION_COPY.viewForCampaign}.*${MESSAGES_ACTION_COPY.viewAll}`,
      ),
    )

    await user.click(screen.getByRole('menuitem', { name: 'Invite member' }))

    expect(await screen.findByRole('heading', { name: 'Invite member' })).toBeInTheDocument()
  })

  it('links message actions to the campaign-scoped and global message routes', async () => {
    const user = userEvent.setup()
    renderHero()

    await user.click(screen.getByRole('button', { name: 'Open actions for Sunless Citadel' }))

    expect(
      screen.getByRole('link', { name: MESSAGES_ACTION_COPY.viewForCampaign }),
    ).toHaveAttribute('href', ROUTES.messages.listScoped('camp_1'))
    expect(screen.getByRole('link', { name: MESSAGES_ACTION_COPY.viewAll })).toHaveAttribute(
      'href',
      ROUTES.messages.list,
    )
  })
})
