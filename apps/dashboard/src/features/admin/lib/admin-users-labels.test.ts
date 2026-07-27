import { describe, expect, it } from 'vitest'

import { formatAdminUserCampaignCounts, formatAdminUserLastActive } from './admin-users-labels'

describe('admin-users-labels', () => {
  it('formats campaign counts with em dash when all zero', () => {
    expect(formatAdminUserCampaignCounts({ owned: 0, coOwned: 0, joined: 0 })).toBe('—')
    expect(formatAdminUserCampaignCounts({ owned: 2, coOwned: 0, joined: 1 })).toBe(
      '2 owned · 1 joined',
    )
  })

  it('formats never-active users', () => {
    expect(formatAdminUserLastActive(null)).toEqual({
      label: 'Never',
      absoluteLabel: 'Never active',
    })
  })
})
