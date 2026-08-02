import { describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { projectContentEntity } from './project-content-document'

describe('projectContentEntity', () => {
  it('sets campaignAvailable false when catalog access is unavailable', () => {
    const document = projectContentEntity('feats', {
      id: 'feat-1',
      name: 'Hidden Feat',
      slug: 'hidden-feat',
      source: 'homebrew',
      status: 'published',
      campaignAccess: {
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        available: false,
        effectiveAudience: 'none',
      },
    } as never)

    expect(document.campaignAvailable).toBe(false)
  })

  it('omits campaignAvailable when catalog access is available', () => {
    const document = projectContentEntity('feats', {
      id: 'feat-2',
      name: 'Visible Feat',
      slug: 'visible-feat',
      source: 'homebrew',
      status: 'published',
      campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
    } as never)

    expect(document.campaignAvailable).toBeUndefined()
  })
})
