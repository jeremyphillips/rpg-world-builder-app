import { describe, expect, it } from 'vitest'

import type { CampaignInviteInviteeListItem } from '@rpg/contracts'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { filterPendingInvitesForMembership } from '@/features/campaign/lib/filter-pending-invites-for-membership'

import { resolveDashboardHomeSections } from './dashboard-home-sections.lib'

const invite = (campaignId: string): CampaignInviteInviteeListItem => ({
  inviteId: 'a'.repeat(24),
  campaignId,
  campaignName: 'Stormwatch',
  inviterDisplayName: 'Avery',
  expiresAt: '2026-01-08T00:00:00.000Z',
})

describe('filterPendingInvitesForMembership', () => {
  it('removes invites when the viewer already has campaign membership', () => {
    expect(
      filterPendingInvitesForMembership(
        [invite('camp_member')],
        [makeCampaignListItem({ id: 'camp_member' })],
      ),
    ).toEqual([])
  })
})

describe('resolveDashboardHomeSections', () => {
  it('orders finish joining before pending invitations and continue campaign', () => {
    const incomplete = makeCampaignListItem({
      id: 'camp_incomplete',
      viewerOnboardingState: 'incomplete',
    })
    const active = makeCampaignListItem({ id: 'camp_active' })

    const sections = resolveDashboardHomeSections({
      campaigns: [incomplete, active],
      pendingInvites: [invite('camp_pending')],
      campaignsError: false,
      user: { lastSelectedCampaignId: 'camp_incomplete' },
    })

    expect(sections.map((section) => section.kind)).toEqual([
      'finishJoining',
      'pendingInvitations',
      'starterCards',
    ])
  })

  it('dedupes continue when finish joining targets the same campaign', () => {
    const incomplete = makeCampaignListItem({
      id: 'camp_shared',
      viewerOnboardingState: 'incomplete',
    })

    const sections = resolveDashboardHomeSections({
      campaigns: [incomplete],
      pendingInvites: [],
      campaignsError: false,
      user: { lastSelectedCampaignId: 'camp_shared' },
    })

    expect(sections.map((section) => section.kind)).toEqual(['finishJoining', 'starterCards'])
  })

  it('includes continue campaign when onboarding is complete', () => {
    const active = makeCampaignListItem({ id: 'camp_active' })

    const sections = resolveDashboardHomeSections({
      campaigns: [active],
      pendingInvites: [],
      campaignsError: false,
      user: { lastSelectedCampaignId: 'camp_active' },
    })

    expect(sections.map((section) => section.kind)).toEqual(['continueCampaign', 'starterCards'])
  })
})
