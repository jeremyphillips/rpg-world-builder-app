import { describe, expect, it } from 'vitest'

import type { CampaignInvitePublicResolution } from '@rpg/contracts'

import {
  emailsMatch,
  resolveInviteViewState,
  shouldAutoAcceptInvite,
} from './campaign-invite-page.lib'

const baseResolution: CampaignInvitePublicResolution = {
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

  it('returns ready_to_accept for matching authenticated users', () => {
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
    ).toBe('ready_to_accept')
  })
})

describe('emailsMatch', () => {
  it('compares normalized addresses', () => {
    expect(emailsMatch('Player@Example.com', 'player@example.com')).toBe(true)
  })
})

describe('shouldAutoAcceptInvite', () => {
  it('is true only for ready_to_accept', () => {
    expect(shouldAutoAcceptInvite({ kind: 'ready_to_accept' })).toBe(true)
    expect(shouldAutoAcceptInvite({ kind: 'loading' })).toBe(false)
  })
})
