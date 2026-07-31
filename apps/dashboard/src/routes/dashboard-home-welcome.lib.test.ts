import { describe, expect, it } from 'vitest'

import {
  resolveDashboardWelcomeCopy,
  resolveDashboardWelcomeState,
} from './dashboard-home-welcome.lib'

describe('resolveDashboardWelcomeState', () => {
  it('classifies the four coarse welcome states', () => {
    expect(resolveDashboardWelcomeState({ hasCampaigns: false, hasCharacters: false })).toBe(
      'empty',
    )
    expect(resolveDashboardWelcomeState({ hasCampaigns: true, hasCharacters: false })).toBe(
      'campaigns_only',
    )
    expect(resolveDashboardWelcomeState({ hasCampaigns: false, hasCharacters: true })).toBe(
      'characters_only',
    )
    expect(resolveDashboardWelcomeState({ hasCampaigns: true, hasCharacters: true })).toBe('active')
  })
})

describe('resolveDashboardWelcomeCopy', () => {
  it('returns empty-state copy for a new user', () => {
    expect(
      resolveDashboardWelcomeCopy({
        hasCampaigns: false,
        hasCharacters: false,
        displayName: 'kidradio',
      }),
    ).toEqual({
      title: 'Welcome, kidradio',
      body: 'Start by creating a campaign or building a character of your own.',
    })
  })

  it('returns campaigns-only copy when characters are missing', () => {
    expect(
      resolveDashboardWelcomeCopy({
        hasCampaigns: true,
        hasCharacters: false,
        displayName: 'kidradio',
      }),
    ).toEqual({
      title: 'Welcome back, kidradio',
      body: 'Continue a campaign or create your first character.',
    })
  })

  it('returns characters-only copy when campaigns are missing', () => {
    expect(
      resolveDashboardWelcomeCopy({
        hasCampaigns: false,
        hasCharacters: true,
        displayName: 'kidradio',
      }),
    ).toEqual({
      title: 'Welcome back, kidradio',
      body: 'Continue building your characters or start a campaign.',
    })
  })

  it('returns active copy when both exist', () => {
    expect(
      resolveDashboardWelcomeCopy({
        hasCampaigns: true,
        hasCharacters: true,
        displayName: 'kidradio',
      }),
    ).toEqual({
      title: 'Welcome back, kidradio',
      body: 'Continue where you left off.',
    })
  })

  it('omits the display name when it is missing', () => {
    expect(
      resolveDashboardWelcomeCopy({
        hasCampaigns: false,
        hasCharacters: false,
        displayName: null,
      }),
    ).toEqual({
      title: 'Welcome',
      body: 'Start by creating a campaign or building a character of your own.',
    })
  })
})
