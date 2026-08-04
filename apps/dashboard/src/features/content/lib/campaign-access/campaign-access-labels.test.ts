import { describe, expect, it } from 'vitest'

import { formatCampaignAccessBlockedDescription } from './campaign-access-labels'

describe('campaign access labels', () => {
  it('formats single blocked copy from scope when one target has multiple references', () => {
    expect(formatCampaignAccessBlockedDescription(2, 'Sharpshooter')).toBe(
      'This Sharpshooter is currently used by 2 active characters. Remove the references before making it unavailable.',
    )
    expect(formatCampaignAccessBlockedDescription(2, 'Sharpshooter')).not.toContain('selected')
  })

  it('falls back to generic subject when target name is omitted', () => {
    expect(formatCampaignAccessBlockedDescription(1)).toBe(
      'This content is currently used by 1 active character. Remove the references before making it unavailable.',
    )
  })

  it('ignores legacy placeholder target names', () => {
    expect(formatCampaignAccessBlockedDescription(2, 'This item')).toBe(
      'This content is currently used by 2 active characters. Remove the references before making it unavailable.',
    )
  })
})
