import { describe, expect, it } from 'vitest'

import type { LocationConnectedPartyRow } from '@rpg/contracts'

import { YAWNING_PORTAL } from '../../../locations/fixtures'
import { CITY_COUNCIL } from '../../../organizations/fixtures'
import {
  relationshipPickerOrganizationCreateAvailable,
  revalidateCreatedLocationForOrganizationForwardDrawer,
  revalidateCreatedNpcForInverseDrawer,
  revalidateCreatedOrganizationForInverseDrawer,
  resolveRelationshipPickerCharacterCreateIntents,
  resolveRelationshipPickerOrganizationCreateIntents,
  RELATIONSHIP_PICKER_NESTED_CREATE_ORGANIZATION_SENTINEL_ID,
} from './relationship-picker-nested-create.lib'

function territorialRow(input: {
  relationshipId: string
  organizationId: string
  kind: 'governs' | 'controls' | 'claims'
}): LocationConnectedPartyRow {
  return {
    relationshipId: input.relationshipId,
    subjectType: 'organization',
    subject: {
      type: 'organization',
      id: input.organizationId,
      name: input.organizationId,
      slug: input.organizationId,
    },
    kind: input.kind,
    label: input.kind,
    family: 'territorial_authority',
    priority: 50,
    sectionGroup: 'territorial_authority',
  }
}

describe('relationshipPickerOrganizationCreateAvailable', () => {
  it('returns false when singleton governs slot is occupied', () => {
    const rows = [
      territorialRow({
        relationshipId: 'rel-other',
        organizationId: 'org-other',
        kind: 'governs',
      }),
    ]

    expect(
      relationshipPickerOrganizationCreateAvailable({
        locationId: YAWNING_PORTAL.id,
        kinds: ['governs'],
        orgRows: rows,
      }),
    ).toBe(false)
  })

  it('returns true when governs slot is still open', () => {
    expect(
      relationshipPickerOrganizationCreateAvailable({
        locationId: YAWNING_PORTAL.id,
        kinds: ['governs'],
        orgRows: [],
      }),
    ).toBe(true)
  })
})

describe('resolveRelationshipPickerOrganizationCreateIntents', () => {
  it('returns no intents when organization create is unavailable', () => {
    expect(
      resolveRelationshipPickerOrganizationCreateIntents({
        locationId: YAWNING_PORTAL.id,
        kinds: ['governs'],
        orgRows: [
          territorialRow({
            relationshipId: 'rel-other',
            organizationId: 'org-other',
            kind: 'governs',
          }),
        ],
      }),
    ).toEqual([])
  })

  it('returns one organization intent when create is available', () => {
    expect(
      resolveRelationshipPickerOrganizationCreateIntents({
        locationId: YAWNING_PORTAL.id,
        kinds: ['headquarters'],
        orgRows: [],
      }),
    ).toEqual([
      expect.objectContaining({
        target: 'organization',
        label: 'Create organization',
      }),
    ])
  })
})

describe('resolveRelationshipPickerCharacterCreateIntents', () => {
  it('returns Create NPC when npc is createable', () => {
    expect(
      resolveRelationshipPickerCharacterCreateIntents({ createableCharacterTypes: ['npc'] }),
    ).toEqual([
      expect.objectContaining({
        target: 'character',
        id: 'npc',
        label: 'Create NPC',
      }),
    ])
  })
})

describe('revalidateCreatedNpcForInverseDrawer', () => {
  it('rejects when the character slot is already linked', () => {
    expect(
      revalidateCreatedNpcForInverseDrawer({
        character: {
          id: 'char-1',
          name: 'Braggi',
          summary: 'Merchant',
          characterType: 'npc',
          classIds: [],
        },
        kinds: ['owns'],
        existingKeys: new Set(['char-1:owns']),
      }),
    ).toBe(false)
  })

  it('accepts a created character when the slot is open', () => {
    expect(
      revalidateCreatedNpcForInverseDrawer({
        character: {
          id: 'char-1',
          name: 'Braggi',
          summary: 'Merchant',
          characterType: 'npc',
          classIds: [],
        },
        kinds: ['owns'],
        existingKeys: new Set(),
      }),
    ).toBe(true)
  })
})

describe('revalidateCreatedLocationForOrganizationForwardDrawer', () => {
  it('rejects when the created location is ineligible for the active kind', () => {
    expect(
      revalidateCreatedLocationForOrganizationForwardDrawer({
        location: { ...YAWNING_PORTAL, kind: 'site' },
        kind: 'operates_in',
        subjectOrganizationId: 'org-1',
        existingConnections: [],
      }),
    ).toBe(false)
  })

  it('accepts an eligible created location with an open relationship slot', () => {
    expect(
      revalidateCreatedLocationForOrganizationForwardDrawer({
        location: YAWNING_PORTAL,
        kind: 'headquarters',
        subjectOrganizationId: 'org-1',
        existingConnections: [],
      }),
    ).toBe(true)
  })
})

describe('revalidateCreatedOrganizationForInverseDrawer', () => {
  it('rejects when singleton slot is already occupied', () => {
    expect(
      revalidateCreatedOrganizationForInverseDrawer({
        organization: CITY_COUNCIL,
        locationId: YAWNING_PORTAL.id,
        kinds: ['governs'],
        orgRows: [
          territorialRow({
            relationshipId: 'rel-other',
            organizationId: 'org-other',
            kind: 'governs',
          }),
        ],
      }),
    ).toBe(false)
  })

  it('accepts a created organization when the slot is open', () => {
    expect(
      revalidateCreatedOrganizationForInverseDrawer({
        organization: CITY_COUNCIL,
        locationId: YAWNING_PORTAL.id,
        kinds: ['headquarters'],
        orgRows: [],
      }),
    ).toBe(true)
  })

  it('does not treat the sentinel id as a persisted subject during availability checks', () => {
    expect(RELATIONSHIP_PICKER_NESTED_CREATE_ORGANIZATION_SENTINEL_ID).not.toBe('org-new')
  })
})
