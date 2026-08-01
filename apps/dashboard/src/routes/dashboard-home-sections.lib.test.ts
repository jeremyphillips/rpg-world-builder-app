import { describe, expect, it } from 'vitest'

import type { CampaignInviteInviteeListItem } from '@rpg/contracts'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import { filterPendingInvitesForMembership } from '@/features/campaign/lib/filter-pending-invites-for-membership'

import {
  resolveDashboardHomeSections,
  resolveDashboardHomeShowAllCampaignsLink,
} from './dashboard-home-sections.lib'

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
  it('orders recovery before pending invitations and continue campaign', () => {
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
      'campaignRecovery',
      'pendingInvitations',
      'starterCards',
    ])
  })

  it('shows recovery and continue when preference is complete but another campaign needs recovery', () => {
    const completeA = makeCampaignListItem({
      id: 'camp_a',
      viewerOnboardingState: 'complete',
    })
    const incompleteB = makeCampaignListItem({
      id: 'camp_b',
      viewerOnboardingState: 'incomplete',
    })

    const sections = resolveDashboardHomeSections({
      campaigns: [completeA, incompleteB],
      pendingInvites: [],
      campaignsError: false,
      user: { lastSelectedCampaignId: 'camp_a' },
    })

    expect(sections.map((section) => section.kind)).toEqual([
      'campaignRecovery',
      'continueCampaign',
      'starterCards',
    ])
  })

  it('dedupes continue when recovery targets the same campaign', () => {
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

    expect(sections.map((section) => section.kind)).toEqual(['campaignRecovery', 'starterCards'])
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

  it('does not show pending invites and recovery for the same accepted membership', () => {
    const incomplete = makeCampaignListItem({
      id: 'camp_member',
      viewerOnboardingState: 'incomplete',
    })

    const sections = resolveDashboardHomeSections({
      campaigns: [incomplete],
      pendingInvites: [invite('camp_member')],
      campaignsError: false,
      user: null,
    })

    expect(sections.map((section) => section.kind)).toEqual(['campaignRecovery', 'starterCards'])
  })
})

describe('resolveDashboardHomeShowAllCampaignsLink', () => {
  it('shows the link when multiple recoverable campaigns exist', () => {
    const sections = resolveDashboardHomeSections({
      campaigns: [
        makeCampaignListItem({ id: 'camp_a', viewerOnboardingState: 'incomplete' }),
        makeCampaignListItem({ id: 'camp_b', viewerOnboardingState: 'incomplete' }),
      ],
      pendingInvites: [],
      campaignsError: false,
      user: null,
    })

    expect(resolveDashboardHomeShowAllCampaignsLink(sections)).toBe(true)
  })

  it('hides the link for a single recoverable campaign', () => {
    const sections = resolveDashboardHomeSections({
      campaigns: [makeCampaignListItem({ id: 'camp_a', viewerOnboardingState: 'incomplete' })],
      pendingInvites: [],
      campaignsError: false,
      user: null,
    })

    expect(resolveDashboardHomeShowAllCampaignsLink(sections)).toBe(false)
  })
})
