import { describe, expect, it } from 'vitest'

import {
  createPopulatedStandaloneBuilderContextFixture,
  createStandaloneBuilderCatalogIndexFixture,
  makeCampaignNpcListItem,
} from '@/features/character'
import {
  appendLocationPartyAssociation,
  buildLocationPartyAddActionLabel,
  buildLocationPartyAssociationExactKeyFromSelection,
  buildLocationPartyCharactersById,
  buildLocationPartyAssociationRows,
  buildRelatedToSegmentOptions,
  findLocationPartyAssociationId,
  isLocationPartyAssociationSelected,
  resolvePartyKindForRelationshipChange,
  wouldDuplicateLocationPartyAssociation,
} from './location-party-associations.lib'

const context = createPopulatedStandaloneBuilderContextFixture()
const catalogIndex = createStandaloneBuilderCatalogIndexFixture(context)

describe('location party associations lib', () => {
  it('merges campaign PCs and NPCs into a sorted lookup map', () => {
    const map = buildLocationPartyCharactersById(
      [
        {
          character: { id: 'pc-2', name: 'Zara', summary: 'Rogue' },
        },
        {
          character: { id: 'pc-1', name: 'Aldric', summary: 'Fighter' },
        },
      ],
      [makeCampaignNpcListItem({ character: { id: 'npc-1', name: 'Durnan' } })],
      catalogIndex,
    )

    expect([...map.keys()]).toEqual(['pc-1', 'npc-1', 'pc-2'])
    expect(map.get('npc-1')).toMatchObject({
      name: 'Durnan',
      summary: 'Dwarf · Level 1 Fighter',
      characterType: 'npc',
    })
  })

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
      campaignId: 'camp_1',
      charactersById: new Map(),
      organizationsById: new Map(),
    })

    expect(rows).toHaveLength(1)
    expect(rows[0]?.partyUnresolved).toBe(true)
  })

  it('builds add action labels from semantic keys', () => {
    expect(buildLocationPartyAddActionLabel('owner')).toBe('Add as owner')
    expect(buildLocationPartyAddActionLabel('tenant')).toBe('Add as tenant')
    expect(buildLocationPartyAddActionLabel('resident')).toBe('Add as resident')
    expect(buildLocationPartyAddActionLabel('headquarters')).toBe('Add as headquarters')
    expect(buildLocationPartyAddActionLabel('operator')).toBe('Add as operator')
    expect(buildLocationPartyAddActionLabel('works_at')).toBe('Add as works here')
  })

  it('builds related-to segments with stable mount and disable rules', () => {
    expect(buildRelatedToSegmentOptions(null)).toEqual([
      { value: 'character', label: 'Characters', disabled: true },
      { value: 'organization', label: 'Organizations', disabled: true },
    ])

    expect(buildRelatedToSegmentOptions('owner')).toEqual([
      { value: 'character', label: 'Characters', disabled: false },
      { value: 'organization', label: 'Organizations', disabled: false },
    ])

    expect(buildRelatedToSegmentOptions('resident')).toEqual([
      { value: 'character', label: 'Characters', disabled: false },
      { value: 'organization', label: 'Organizations', disabled: true },
    ])
  })

  it('preserves valid party kind across relationship changes', () => {
    expect(
      resolvePartyKindForRelationshipChange({
        previousPartyKind: 'character',
        partyKinds: ['character', 'organization'],
      }),
    ).toBe('character')

    expect(
      resolvePartyKindForRelationshipChange({
        previousPartyKind: 'organization',
        partyKinds: ['character'],
      }),
    ).toBe('character')

    expect(
      resolvePartyKindForRelationshipChange({
        previousPartyKind: null,
        partyKinds: ['organization'],
      }),
    ).toBe('organization')
  })

  it('resolves exact association keys and ids for remove', () => {
    const associations = appendLocationPartyAssociation({
      associations: [],
      semanticKey: 'owner',
      party: { kind: 'character', characterId: 'char-1' },
      id: 'assoc-owner',
    })

    const operatorAssociations = appendLocationPartyAssociation({
      associations,
      semanticKey: 'operator',
      party: { kind: 'character', characterId: 'char-1' },
      id: 'assoc-operator',
    })

    const ownerParty = { kind: 'character' as const, characterId: 'char-1' }

    expect(
      buildLocationPartyAssociationExactKeyFromSelection({
        semanticKey: 'owner',
        party: ownerParty,
      }),
    ).toContain('owner::character:char-1')

    expect(
      findLocationPartyAssociationId({
        associations: operatorAssociations,
        semanticKey: 'owner',
        party: ownerParty,
      }),
    ).toBe('assoc-owner')

    expect(
      isLocationPartyAssociationSelected({
        associations: operatorAssociations,
        semanticKey: 'operator',
        party: ownerParty,
      }),
    ).toBe(true)

    expect(
      isLocationPartyAssociationSelected({
        associations: operatorAssociations,
        semanticKey: 'owner',
        party: ownerParty,
      }),
    ).toBe(true)
  })

  it('includes party summary and href on association rows', () => {
    const rows = buildLocationPartyAssociationRows({
      associations: [
        {
          id: 'row-1',
          kind: 'ownership',
          party: { kind: 'character', characterId: 'char-1' },
        },
      ],
      campaignId: 'camp_1',
      charactersById: new Map([
        [
          'char-1',
          {
            id: 'char-1',
            name: 'Morgan Stonebreaker',
            summary: 'Dwarf · Level 4 Fighter',
            characterType: 'pc',
          },
        ],
      ]),
      organizationsById: new Map(),
    })

    expect(rows[0]?.partySummary).toBe('Dwarf · Level 4 Fighter')
    expect(rows[0]?.partyHref).toBe('/campaigns/camp_1/characters/char-1')
  })

  it('includes NPC party summary and npc detail href on association rows', () => {
    const rows = buildLocationPartyAssociationRows({
      associations: [
        {
          id: 'row-1',
          kind: 'ownership',
          party: { kind: 'character', characterId: 'npc-1' },
        },
      ],
      campaignId: 'camp_1',
      charactersById: buildLocationPartyCharactersById(
        [],
        [makeCampaignNpcListItem({ character: { id: 'npc-1', name: 'Durnan' } })],
        catalogIndex,
      ),
      organizationsById: new Map(),
    })

    expect(rows[0]?.partySummary).toBe('Dwarf · Level 1 Fighter')
    expect(rows[0]?.partyHref).toBe('/campaigns/camp_1/npcs/npc-1')
  })
})
