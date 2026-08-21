import { describe, expect, it } from 'vitest'

import type { CreatedContentResult } from './created-content-result.lib'

describe('CreatedContentResult contract', () => {
  it('accepts organization, location, and npc nested-create payloads', () => {
    const organizationResult: CreatedContentResult = {
      contentType: 'organizations',
      id: 'org-1',
    }
    const locationResult: CreatedContentResult = {
      contentType: 'locations',
      id: 'loc-1',
    }
    const npcResult: CreatedContentResult = {
      contentType: 'npcs',
      id: 'character-1',
    }

    expect(organizationResult.contentType).toBe('organizations')
    expect(locationResult.contentType).toBe('locations')
    expect(npcResult.contentType).toBe('npcs')
  })
})
