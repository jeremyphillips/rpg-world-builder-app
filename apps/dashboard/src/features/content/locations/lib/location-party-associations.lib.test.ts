import { describe, expect, it } from 'vitest'

import {
  appendLocationPartyAssociation,
  buildLocationPartyAssociationRows,
  wouldDuplicateLocationPartyAssociation,
} from './location-party-associations.lib'

describe('location party associations lib', () => {
  it('appends associations and prevents v1 duplicate exact keys', () => {
    const first = appendLocationPartyAssociation({
      associations: [],
      semanticKey: 'owner',
      party: { kind: 'organization', organizationId: 'org-1' },
      id: 'row-1',
    })

    const second = appendLocationPartyAssociation({
      associations: first,
      semanticKey: 'owner',
      party: { kind: 'organization', organizationId: 'org-1' },
      id: 'row-2',
    })

    expect(second).toHaveLength(1)
    expect(
      wouldDuplicateLocationPartyAssociation(first, {
        id: 'row-2',
        kind: 'ownership',
        party: { kind: 'organization', organizationId: 'org-1' },
      }),
    ).toBe(true)
  })

  it('keeps unresolved party rows in detail projection', () => {
    const rows = buildLocationPartyAssociationRows({
      associations: [
        {
          id: 'row-1',
          kind: 'operation',
          role: 'works_at',
          party: { kind: 'character', characterId: 'missing-character' },
        },
      ],
      charactersById: new Map(),
      organizationsById: new Map(),
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]?.partyUnresolved).toBe(true)
  })
})
