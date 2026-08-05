import { describe, expect, it } from 'vitest'

import {
  TERRITORIAL_AUTHORITY_ENTRIES,
  TERRITORIAL_AUTHORITY_KIND_IDS,
} from '../../vocab/location/territorial-authority'
import {
  buildTerritorialAuthorityRelationship,
  groupTerritorialAuthorityRelationshipsByKind,
  sortTerritorialAuthorityRelationships,
  territorialAuthorityRelationshipsSchema,
} from './territorial-authority'

describe('territorialAuthorityRelationshipsSchema', () => {
  const guildOrgId = 'org-adventurers-guild'

  it('parses governs, controls, and claims relationships', () => {
    const relationships = territorialAuthorityRelationshipsSchema.parse([
      buildTerritorialAuthorityRelationship({
        id: 'ta-governs',
        organizationId: guildOrgId,
        kind: 'governs',
      }),
      buildTerritorialAuthorityRelationship({
        id: 'ta-controls',
        organizationId: guildOrgId,
        kind: 'controls',
      }),
      buildTerritorialAuthorityRelationship({
        id: 'ta-claims',
        organizationId: guildOrgId,
        kind: 'claims',
      }),
    ])

    expect(relationships).toHaveLength(3)
  })

  it('rejects duplicate ids within the array', () => {
    expect(() =>
      territorialAuthorityRelationshipsSchema.parse([
        buildTerritorialAuthorityRelationship({
          id: 'duplicate-id',
          organizationId: guildOrgId,
          kind: 'governs',
        }),
        buildTerritorialAuthorityRelationship({
          id: 'duplicate-id',
          organizationId: guildOrgId,
          kind: 'controls',
        }),
      ]),
    ).toThrow(/unique/)
  })

  it('allows multiple rows with the same organization and kind', () => {
    const relationships = territorialAuthorityRelationshipsSchema.parse([
      buildTerritorialAuthorityRelationship({
        id: 'ta-governs-a',
        organizationId: guildOrgId,
        kind: 'governs',
      }),
      buildTerritorialAuthorityRelationship({
        id: 'ta-governs-b',
        organizationId: guildOrgId,
        kind: 'governs',
      }),
    ])

    expect(relationships).toHaveLength(2)
  })

  it('sorts by in-family priority then id', () => {
    const sorted = sortTerritorialAuthorityRelationships([
      buildTerritorialAuthorityRelationship({
        id: 'z-claims',
        organizationId: guildOrgId,
        kind: 'claims',
      }),
      buildTerritorialAuthorityRelationship({
        id: 'a-governs',
        organizationId: guildOrgId,
        kind: 'governs',
      }),
      buildTerritorialAuthorityRelationship({
        id: 'm-controls',
        organizationId: guildOrgId,
        kind: 'controls',
      }),
    ])

    expect(sorted.map((row) => row.kind)).toEqual(['governs', 'controls', 'claims'])
  })

  it('groups rows by kind in priority order', () => {
    const grouped = groupTerritorialAuthorityRelationshipsByKind([
      buildTerritorialAuthorityRelationship({
        id: 'ta-claims',
        organizationId: guildOrgId,
        kind: 'claims',
      }),
      buildTerritorialAuthorityRelationship({
        id: 'ta-governs',
        organizationId: guildOrgId,
        kind: 'governs',
      }),
    ])

    expect([...grouped.keys()]).toEqual(['governs', 'claims'])
  })
})

describe('territorial authority vocab exhaustiveness', () => {
  it('covers exactly governs, controls, and claims with priority and descriptions', () => {
    expect(TERRITORIAL_AUTHORITY_KIND_IDS.sort()).toEqual(['claims', 'controls', 'governs'])

    for (const kind of TERRITORIAL_AUTHORITY_KIND_IDS) {
      const entry = TERRITORIAL_AUTHORITY_ENTRIES[kind]
      expect(entry.label.length).toBeGreaterThan(0)
      expect(entry.description.length).toBeGreaterThan(0)
      expect(entry.priority).toBeGreaterThan(0)
    }
  })
})
