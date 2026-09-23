import { describe, expect, it } from 'vitest'

import {
  CONTENT_MEDIA_DOMAINS,
  CONTENT_MEDIA_POLICIES,
  getContentMediaPolicy,
} from './media-policy'

describe('CONTENT_MEDIA_POLICIES', () => {
  it('covers every opted-in domain', () => {
    for (const domain of CONTENT_MEDIA_DOMAINS) {
      expect(getContentMediaPolicy(domain).domain).toBe(domain)
    }
  })

  it('allows portrait only on character', () => {
    expect(CONTENT_MEDIA_POLICIES.character.allowedRoles).toEqual(['primary', 'portrait'])

    for (const domain of CONTENT_MEDIA_DOMAINS) {
      if (domain === 'character') continue
      expect(getContentMediaPolicy(domain).allowedRoles).toEqual(['primary'])
    }
  })
})
