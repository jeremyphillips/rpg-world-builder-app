import { describe, expect, it } from 'vitest'

import { getCrossContentRelationshipProjection } from '@rpg/contracts'

describe('organization location connection projections', () => {
  it('registers subject-owned location connection projections', () => {
    const character = getCrossContentRelationshipProjection('character_location_connection')
    const organization = getCrossContentRelationshipProjection('organization_location_connection')

    expect(character).toMatchObject({
      ownerContentType: 'characters',
      targetContentType: 'locations',
      ownerField: 'connections.locations',
      capabilities: { forward: 'write', inverse: 'write' },
    })
    expect(organization).toMatchObject({
      ownerContentType: 'organizations',
      targetContentType: 'locations',
      ownerField: 'connections.locations',
      capabilities: { forward: 'write', inverse: 'write' },
    })
  })
})
