import { describe, expect, it } from 'vitest'

import {
  buildAuthContinuationUrl,
  extractCampaignInviteTokenFromPath,
  validateAuthContinuationPath,
} from './auth-continuation'

describe('validateAuthContinuationPath', () => {
  it('accepts allowlisted campaign invite paths', () => {
    expect(validateAuthContinuationPath('/campaign-invites/abc123')).toBe(
      '/campaign-invites/abc123',
    )
  })

  it('rejects missing, external, and non-allowlisted paths', () => {
    expect(validateAuthContinuationPath(null)).toBeNull()
    expect(validateAuthContinuationPath('')).toBeNull()
    expect(validateAuthContinuationPath('//evil.example/phish')).toBeNull()
    expect(validateAuthContinuationPath('https://evil.example/phish')).toBeNull()
    expect(validateAuthContinuationPath('/app/campaigns/c1')).toBeNull()
    expect(validateAuthContinuationPath('/login')).toBeNull()
  })
})

describe('buildAuthContinuationUrl', () => {
  it('builds login and signup URLs with returnTo and optional email', () => {
    expect(buildAuthContinuationUrl('/login', '/campaign-invites/token-1')).toBe(
      '/login?returnTo=%2Fcampaign-invites%2Ftoken-1',
    )
    expect(
      buildAuthContinuationUrl('/signup', '/campaign-invites/token-1', {
        email: 'player@example.com',
      }),
    ).toBe('/signup?returnTo=%2Fcampaign-invites%2Ftoken-1&email=player%40example.com')
  })
})

describe('extractCampaignInviteTokenFromPath', () => {
  it('extracts the token segment from invite paths', () => {
    expect(extractCampaignInviteTokenFromPath('/campaign-invites/abc123')).toBe('abc123')
    expect(extractCampaignInviteTokenFromPath('/campaign-invites/abc123?x=1')).toBe('abc123')
    expect(extractCampaignInviteTokenFromPath('/login')).toBeNull()
  })
})
