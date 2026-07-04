import type { AuthMeResponse, SessionUser } from '@rpg/contracts'

export function makeSessionUser(overrides: Partial<SessionUser> = {}): SessionUser {
  return {
    id: 'u1',
    email: 'dm@example.com',
    displayName: 'Dungeon Master',
    role: 'user',
    lastSelectedCampaignId: null,
    ...overrides,
  }
}

export function makeAuthMe(
  user: SessionUser = makeSessionUser(),
  overrides: Partial<AuthMeResponse> = {},
): AuthMeResponse {
  return { user, activeCampaign: null, ...overrides }
}
