import { describe, expect, it } from 'vitest'

import type { CreatedContentResult } from './created-content-result.types'

describe('CreatedContentResult contract', () => {
  it('accepts organization and location nested-create payloads', () => {
    const organizationResult: CreatedContentResult = {
      contentType: 'organizations',
      id: 'org-1',
    }
    const locationResult: CreatedContentResult = {
      contentType: 'locations',
      id: 'loc-1',
    }

    expect(organizationResult.contentType).toBe('organizations')
    expect(locationResult.contentType).toBe('locations')
  })
})
