import type { ComponentProps } from 'react'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { headingVariants } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import { MESSAGES_ACTION_COPY } from '@/features/message'
import { renderWithProviders } from '@/test/render'
import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { CampaignOverviewHero } from '../campaign-overview-hero'
import { InviteMemberDialog } from '../invite-member-dialog'

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
  playerMemberCount: 4,
  openPcCount: 6,
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
      {...overrides}
    />,
  )
}

describe('CampaignOverviewHero', () => {
  beforeEach(() => {
    mutateAsync.mockReset()
  })

  it('renders the campaign title and viewer meta line with counts', () => {
    renderHero()

    const heading = screen.getByRole('heading', { level: 1, name: 'Sunless Citadel' })
    expect(heading).toBeInTheDocument()
    expect(heading).toHaveClass(...headingVariants({ variant: 'heroTitle' }).split(/\s+/))
    expect(screen.getByText(/GM/)).toBeInTheDocument()
    expect(screen.getByText(/Active/)).toBeInTheDocument()
    expect(screen.getByText(/4 players/)).toBeInTheDocument()
    expect(screen.getByText(/6 PCs/)).toBeInTheDocument()
    expect(screen.queryByText(/Last opened/)).not.toBeInTheDocument()
  })

  it('omits meta when the campaign is not a list item with role', () => {
    renderHero({
      campaign: {
        id: 'camp_1',
        status: 'active',
        identity: { name: 'Sunless Citadel' },
        configuration: {},
        visibility: 'private',
        rulesetId: campaign.rulesetId,
        createdBy: 'u1',
        createdAt: campaign.createdAt,
        updatedAt: campaign.updatedAt,
      },
    })

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

    function InviteHarness() {
      const [inviteOpen, setInviteOpen] = useState(false)
      return (
        <>
          <CampaignOverviewHero
            campaign={campaign}
            campaignId="camp_1"
            canManage
            onInviteMember={() => setInviteOpen(true)}
          />
          <InviteMemberDialog
            campaignId="camp_1"
            open={inviteOpen}
            onOpenChange={setInviteOpen}
            showTrigger={false}
          />
        </>
      )
    }

    renderWithProviders(<InviteHarness />)

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
