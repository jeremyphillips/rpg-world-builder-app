import { describe, expect, it } from 'vitest'

import {
  buildCharacterRelationshipCanonicalKey,
  canonicalizeCharacterRelationshipEndpoints,
  normalizeDirectedPersonRelationshipEndpoints,
  orderSymmetricCharacterIds,
} from './canonical-endpoints'

describe('canonical-endpoints', () => {
  it('orders symmetric character ids stably', () => {
    expect(orderSymmetricCharacterIds('char-b', 'char-a')).toEqual(['char-a', 'char-b'])
    expect(orderSymmetricCharacterIds('char-a', 'char-b')).toEqual(['char-a', 'char-b'])
  })

  it('normalizes parentOf to parent → child', () => {
    expect(
      normalizeDirectedPersonRelationshipEndpoints({
        kind: 'parentOf',
        focalCharacterId: 'child',
        relatedCharacterId: 'parent',
        role: 'child',
      }),
    ).toEqual({ characterId: 'parent', relatedCharacterId: 'child' })
  })

  it('canonicalizes symmetric partner endpoints', () => {
    expect(
      canonicalizeCharacterRelationshipEndpoints({
        kind: 'partnerOf',
        characterId: 'zeta',
        relatedCharacterId: 'alpha',
      }),
    ).toEqual({ characterId: 'alpha', relatedCharacterId: 'zeta' })
  })

  it('builds canonical uniqueness keys per endpoint type', () => {
    expect(
      buildCharacterRelationshipCanonicalKey({
        kind: 'organizationMembership',
        characterId: 'pc-1',
        organizationId: 'org-1',
      }),
    ).toBe('pc-1:org-1')

    expect(
      buildCharacterRelationshipCanonicalKey({
        kind: 'resides_at',
        characterId: 'pc-1',
        locationId: 'loc-1',
      }),
    ).toBe('pc-1:loc-1')
  })
})
