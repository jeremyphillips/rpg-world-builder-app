import { describe, expect, it } from 'vitest'

import {
  CROSS_APP_PATHS,
  crossAppCampaignDetailPath,
  crossAppCampaignOnboardingPath,
} from './routes'

describe('CROSS_APP_PATHS', () => {
  it('uses a trailing slash on the dashboard base (Vite base: /app/)', () => {
    expect(CROSS_APP_PATHS.dashboard).toBe('/app/')
    expect(CROSS_APP_PATHS.dashboard.endsWith('/')).toBe(true)
  })

  it('keeps public auth routes at the site root', () => {
    expect(CROSS_APP_PATHS.login).toBe('/login')
    expect(CROSS_APP_PATHS.signup).toBe('/signup')
  })

  it('routes profile and account under the dashboard SPA', () => {
    expect(CROSS_APP_PATHS.dashboardProfile).toBe('/app/profile')
    expect(CROSS_APP_PATHS.dashboardAccount).toBe('/app/account')
  })

  it('builds campaign detail paths under the dashboard SPA', () => {
    expect(crossAppCampaignDetailPath('c_abc')).toBe('/app/campaigns/c_abc')
    expect(crossAppCampaignOnboardingPath('c_abc')).toBe('/app/campaigns/c_abc/onboarding')
  })
})
