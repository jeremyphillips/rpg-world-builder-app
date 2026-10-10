import { HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { CAMPAIGN_SIDEBAR_CONTENT_SECTION } from './campaign-sidebar-content-section'

describe('CAMPAIGN_SIDEBAR_CONTENT_SECTION', () => {
  it('covers every visible sidebar content type', () => {
    expect(Object.keys(CAMPAIGN_SIDEBAR_CONTENT_SECTION).sort()).toEqual(
      [...HOMEBREW_SUMMARY_CONTENT_TYPE_KEYS].sort(),
    )
  })
})
