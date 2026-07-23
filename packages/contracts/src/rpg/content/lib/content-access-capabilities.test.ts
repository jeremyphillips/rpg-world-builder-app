import { describe, expect, it } from 'vitest'

import {
  CONTENT_ACCESS_CAPABILITIES,
  CONTENT_ACCESS_TARGET_TYPES,
} from './content-access-capabilities'

describe('CONTENT_ACCESS_CAPABILITIES', () => {
  it('defines a capability entry for every content access target type', () => {
    for (const targetType of CONTENT_ACCESS_TARGET_TYPES) {
      expect(CONTENT_ACCESS_CAPABILITIES[targetType]).toBeDefined()
    }
  })
})
