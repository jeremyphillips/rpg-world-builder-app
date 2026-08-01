import { describe, expect, it } from 'vitest'

import type { CampaignInvitePublicResolution } from '@rpg/contracts'

import { resolveInviteViewState } from './resolve-invite-review-state'

const baseResolution: CampaignInvitePublicResolution = {
  campaignId: 'camp_1',
  campaignName: 'The Shattered Vale',
  inviterDisplayName: 'Avery',
  invitedEmail: 'player@example.com',
  status: 'pending',
  expiresAt: '2026-01-08T00:00:00.000Z',
}

describe('resolveInviteViewState', () => {
  it('returns loading while session or resolution is pending', () => {
    expect(
      resolveInviteViewState({
        isSessionPending: true,
        isResolutionPending: false,
        isResolutionError: false,
        resolutionErrorMessage: '',
        resolution: baseResolution,
        sessionUser: undefined,
        isAccepting: false,
      }).kind,
    ).toBe('loading')
  })

  it('returns unauthenticated for pending invites without a session', () => {
    expect(
      resolveInviteViewState({
        isSessionPending: false,
        isResolutionPending: false,
        isResolutionError: false,
        resolutionErrorMessage: '',
        resolution: baseResolution,
        sessionUser: undefined,
        isAccepting: false,
      }),
    ).toEqual({ kind: 'unauthenticated', resolution: baseResolution })
  })

  it('returns email mismatch when the signed-in account differs', () => {
    expect(
      resolveInviteViewState({
        isSessionPending: false,
        isResolutionPending: false,
        isResolutionError: false,
        resolutionErrorMessage: '',
        resolution: baseResolution,
        sessionUser: {
          id: 'u1',
          email: 'other@example.com',
          displayName: 'Other',
          role: 'user',
          lastSelectedCampaignId: null,
        },
        isAccepting: false,
      }).kind,
    ).toBe('email_mismatch')
  })

  it('returns pending_review for matching authenticated users with pending invites', () => {
    expect(
      resolveInviteViewState({
        isSessionPending: false,
        isResolutionPending: false,
        isResolutionError: false,
        resolutionErrorMessage: '',
        resolution: baseResolution,
        sessionUser: {
          id: 'u1',
          email: 'player@example.com',
          displayName: 'Player',
          role: 'user',
          lastSelectedCampaignId: null,
        },
        isAccepting: false,
      }).kind,
    ).toBe('pending_review')
  })

  it('returns accepted_continue for already accepted invites', () => {
    expect(
      resolveInviteViewState({
        isSessionPending: false,
        isResolutionPending: false,
        isResolutionError: false,
        resolutionErrorMessage: '',
        resolution: { ...baseResolution, status: 'accepted' },
        sessionUser: {
          id: 'u1',
          email: 'player@example.com',
          displayName: 'Player',
          role: 'user',
          lastSelectedCampaignId: null,
        },
        isAccepting: false,
      }).kind,
    ).toBe('accepted_continue')
  })
})
