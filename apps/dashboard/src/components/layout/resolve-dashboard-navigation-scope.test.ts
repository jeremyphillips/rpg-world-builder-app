import { describe, expect, it } from 'vitest'

import { resolveDashboardNavigationScope } from './resolve-dashboard-navigation-scope'

describe('resolveDashboardNavigationScope', () => {
  it('returns global scope when campaignId is absent', () => {
    expect(resolveDashboardNavigationScope({ campaignId: undefined })).toEqual({ kind: 'global' })
    expect(resolveDashboardNavigationScope({ campaignId: null })).toEqual({ kind: 'global' })
  })

  it('returns campaign scope when campaignId is present', () => {
    expect(resolveDashboardNavigationScope({ campaignId: 'camp_1' })).toEqual({
      kind: 'campaign',
      campaignId: 'camp_1',
    })
  })
})
