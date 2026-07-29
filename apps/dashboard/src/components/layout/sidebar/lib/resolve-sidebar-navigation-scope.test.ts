import { describe, expect, it } from 'vitest'

import { resolveSidebarNavigationScope } from './resolve-sidebar-navigation-scope'

describe('resolveSidebarNavigationScope', () => {
  it('returns global scope when campaignId is absent', () => {
    expect(resolveSidebarNavigationScope({ campaignId: undefined })).toEqual({ kind: 'global' })
    expect(resolveSidebarNavigationScope({ campaignId: null })).toEqual({ kind: 'global' })
  })

  it('returns campaign scope when campaignId is present', () => {
    expect(resolveSidebarNavigationScope({ campaignId: 'camp_1' })).toEqual({
      kind: 'campaign',
      campaignId: 'camp_1',
    })
  })
})
