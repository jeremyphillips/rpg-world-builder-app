import { describe, expect, it } from 'vitest'

import {
  buildLocationPartyAssociation,
  getAssociationSemanticKey,
  getLocationPartyAssociationExactKey,
  locationPartyAssociationSchema,
  locationPartyAssociationsSchema,
} from './party-association'

describe('locationPartyAssociationSchema', () => {
  const guildOrgRef = {
    kind: 'organization' as const,
    organizationId: 'org-adventurers-guild',
  }

  it('parses owner, tenant, headquarters, operator, and works_at associations', () => {
    expect(
      locationPartyAssociationSchema.parse({
        id: 'assoc-owner',
        kind: 'ownership',
        party: { kind: 'character', characterId: 'char-mara' },
      }),
    ).toMatchObject({ kind: 'ownership' })

    expect(
      locationPartyAssociationSchema.parse({
        id: 'assoc-tenant',
        kind: 'occupancy',
        role: 'tenant',
        party: guildOrgRef,
      }),
    ).toMatchObject({ kind: 'occupancy', role: 'tenant' })

    expect(
      locationPartyAssociationSchema.parse({
        id: 'assoc-hq',
        kind: 'occupancy',
        role: 'headquarters',
        party: guildOrgRef,
      }),
    ).toMatchObject({ role: 'headquarters' })

    expect(
      locationPartyAssociationSchema.parse({
        id: 'assoc-operator',
        kind: 'operation',
        role: 'operator',
        party: guildOrgRef,
      }),
    ).toMatchObject({ role: 'operator' })

    expect(
      locationPartyAssociationSchema.parse({
        id: 'assoc-works',
        kind: 'operation',
        role: 'works_at',
        party: { kind: 'character', characterId: 'char-mara' },
      }),
    ).toMatchObject({ role: 'works_at' })
  })

  it('allows orthogonal multi-role associations for the same party', () => {
    const associations = locationPartyAssociationsSchema.parse([
      buildLocationPartyAssociation({
        id: 'guild-owner',
        semanticKey: 'owner',
        party: guildOrgRef,
      }),
      buildLocationPartyAssociation({
        id: 'guild-operator',
        semanticKey: 'operator',
        party: guildOrgRef,
      }),
      buildLocationPartyAssociation({
        id: 'guild-hq',
        semanticKey: 'headquarters',
        party: guildOrgRef,
      }),
    ])

    expect(associations).toHaveLength(3)
    expect(new Set(associations.map(getLocationPartyAssociationExactKey)).size).toBe(3)
  })

  it('allows the same character as owner and resident', () => {
    const maraRef = { kind: 'character' as const, characterId: 'char-mara' }
    const associations = locationPartyAssociationsSchema.parse([
      buildLocationPartyAssociation({ id: 'owner', semanticKey: 'owner', party: maraRef }),
      buildLocationPartyAssociation({ id: 'resident', semanticKey: 'resident', party: maraRef }),
    ])

    expect(associations).toHaveLength(2)
  })

  it('rejects v1 exact-key duplicates, invalid party kinds, and duplicate row ids', () => {
    const duplicateKey = buildLocationPartyAssociation({
      id: 'dup-a',
      semanticKey: 'owner',
      party: guildOrgRef,
    })

    expect(
      locationPartyAssociationsSchema.safeParse([duplicateKey, { ...duplicateKey, id: 'dup-b' }])
        .success,
    ).toBe(false)

    expect(
      locationPartyAssociationsSchema.safeParse([
        buildLocationPartyAssociation({
          id: 'same-id',
          semanticKey: 'owner',
          party: guildOrgRef,
        }),
        buildLocationPartyAssociation({
          id: 'same-id',
          semanticKey: 'tenant',
          party: guildOrgRef,
        }),
      ]).success,
    ).toBe(false)

    expect(
      locationPartyAssociationSchema.safeParse({
        id: 'bad-resident-org',
        kind: 'occupancy',
        role: 'resident',
        party: guildOrgRef,
      }).success,
    ).toBe(false)

    expect(
      locationPartyAssociationSchema.safeParse({
        id: 'bad-hq-character',
        kind: 'occupancy',
        role: 'headquarters',
        party: { kind: 'character', characterId: 'char-mara' },
      }).success,
    ).toBe(false)
  })

  it('maps semantic keys from persisted associations', () => {
    expect(
      getAssociationSemanticKey(
        buildLocationPartyAssociation({
          id: '1',
          semanticKey: 'works_at',
          party: { kind: 'character', characterId: 'char-mara' },
        }),
      ),
    ).toBe('works_at')
  })
})
