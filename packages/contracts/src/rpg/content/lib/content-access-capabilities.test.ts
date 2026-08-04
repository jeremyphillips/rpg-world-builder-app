import { describe, expect, it } from 'vitest'

import {
  CONTENT_ACCESS_CAPABILITIES,
  CONTENT_ACCESS_TARGET_TYPES,
  supportsContentBulkCampaignAccess,
} from './content-access-capabilities'
import { CONTENT_TYPE_KEYS } from '../../primitives/content/content-type-keys'

describe('CONTENT_ACCESS_CAPABILITIES', () => {
  it('defines a capability entry for every content access target type', () => {
    for (const targetType of CONTENT_ACCESS_TARGET_TYPES) {
      expect(CONTENT_ACCESS_CAPABILITIES[targetType]).toBeDefined()
    }
  })

  it('enables bulk campaign access for overview content types but not subclasses', () => {
    for (const contentTypeKey of CONTENT_TYPE_KEYS) {
      expect(supportsContentBulkCampaignAccess(contentTypeKey)).toBe(true)
    }

    expect(supportsContentBulkCampaignAccess('subclasses')).toBe(false)
  })
})
