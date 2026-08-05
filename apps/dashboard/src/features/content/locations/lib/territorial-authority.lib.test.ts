import { describe, expect, it } from 'vitest'

import {
  appendTerritorialAuthorityRelationship,
  buildTerritorialAuthorityKindOptions,
  isTerritorialAuthorityAuthoringSupported,
  removeTerritorialAuthorityRelationship,
  shouldShowTerritorialAuthoritySection,
} from './territorial-authority.lib'

describe('territorial authority lib', () => {
  it('offers all territorial kinds for region authoring', () => {
    expect(buildTerritorialAuthorityKindOptions('region').map((option) => option.value)).toEqual([
      'governs',
      'controls',
      'claims',
    ])
    expect(isTerritorialAuthorityAuthoringSupported('region')).toBe(true)
  })

  it('does not offer territorial authoring for non-region types', () => {
    expect(isTerritorialAuthorityAuthoringSupported('settlement')).toBe(false)
    expect(buildTerritorialAuthorityKindOptions('settlement')).toEqual([])
  })

  it('appends rows without kind+org dedupe and removes by id', () => {
    const first = appendTerritorialAuthorityRelationship({
      relationships: [],
      organizationId: 'org-1',
      kind: 'governs',
      id: 'ta-1',
    })
    const second = appendTerritorialAuthorityRelationship({
      relationships: first,
      organizationId: 'org-1',
      kind: 'governs',
      id: 'ta-2',
    })

    expect(second).toHaveLength(2)
    expect(
      removeTerritorialAuthorityRelationship(second, 'ta-1').map((relationship) => relationship.id),
    ).toEqual(['ta-2'])
  })

  it('shows the section when relationships exist even if authoring is unsupported', () => {
    expect(
      shouldShowTerritorialAuthoritySection({
        authoringType: 'settlement',
        relationships: [
          {
            id: 'ta-1',
            organizationId: 'org-1',
            kind: 'governs',
          },
        ],
      }),
    ).toBe(true)
  })
})
