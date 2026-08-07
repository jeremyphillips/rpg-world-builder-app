import { describe, expect, it } from 'vitest'

import type { Location, LocationConnectedPartyRow } from '@rpg/contracts'

import {
  buildOrganizationInverseLocationConnections,
  buildOrganizationLocationConnectionEdgesAtLocation,
} from './location-connection-duplicate-keys'
import {
  assertChangeKindGatingAlignsWithPicker,
  assertChangeKindPickerIncludesCurrentKind,
  buildOrganizationLocationChangeKindOptions,
  ORGANIZATION_LOCATION_CONNECTION_STALE_CURRENT_KIND_REASON,
} from './location-connection-kind-options'
import { resolveRelationshipAlternatives } from './relationship/relationship-alternatives'

function buildingLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'building-1',
    campaignId: 'camp-1',
    name: 'Guildhall',
    slug: 'guildhall',
    kind: 'structure',
    structureType: 'building',
    ...overrides,
  } as Location
}

function regionLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'region-1',
    campaignId: 'camp-1',
    name: 'Northern March',
    slug: 'northern-march',
    kind: 'region',
    ...overrides,
  } as Location
}

function headquartersRow(organizationId = 'org-1'): LocationConnectedPartyRow {
  return {
    relationshipId: 'conn-1',
    subject: {
      type: 'organization',
      id: organizationId,
      name: 'Thieves Guild',
      slug: 'thieves-guild',
    },
    kind: 'headquarters',
    label: 'Headquarters',
    family: 'site',
    priority: 60,
    sectionGroup: 'people_and_organizations',
  }
}

describe('buildOrganizationLocationChangeKindOptions', () => {
  it('includes the persisted current kind in the picker options', () => {
    const location = buildingLocation()
    const currentKind = 'headquarters' as const
    const options = buildOrganizationLocationChangeKindOptions({
      location,
      intent: 'site',
      currentKind,
      subjectOrganizationId: 'org-1',
      connections: [{ id: 'conn-1', locationId: location.id, kind: currentKind }],
      edgesAtLocation: [],
      excludeConnectionId: 'conn-1',
    })

    assertChangeKindPickerIncludesCurrentKind(options, currentKind)
    expect(options.find((option) => option.value === currentKind)?.disabled).not.toBe(true)
  })

  it('represents a stale current kind as a selected-but-disabled option', () => {
    const location = regionLocation()
    const currentKind = 'headquarters' as const
    const options = buildOrganizationLocationChangeKindOptions({
      location,
      intent: 'site',
      currentKind,
      subjectOrganizationId: 'org-1',
      connections: [{ id: 'conn-1', locationId: location.id, kind: currentKind }],
      edgesAtLocation: [],
      excludeConnectionId: 'conn-1',
    })

    const staleCurrent = options.find((option) => option.value === currentKind)
    expect(staleCurrent?.disabled).toBe(true)
    expect(staleCurrent?.disabledReason).toBe(
      ORGANIZATION_LOCATION_CONNECTION_STALE_CURRENT_KIND_REASON,
    )
    assertChangeKindPickerIncludesCurrentKind(options, currentKind)
  })

  it('resolves the same picker options for org-forward and location-inverse change-kind flows', () => {
    const location = buildingLocation()
    const currentKind = 'headquarters' as const
    const organizationId = 'org-1'
    const connectionId = 'conn-1'
    const row = headquartersRow(organizationId)
    const orgRows = [row]
    const edgesAtLocation = buildOrganizationLocationConnectionEdgesAtLocation(
      orgRows.filter((partyRow): partyRow is typeof partyRow & { relationshipId: string } =>
        Boolean(partyRow.relationshipId),
      ),
      location.id,
    )
    const inverseConnections = buildOrganizationInverseLocationConnections(
      orgRows,
      location.id,
      organizationId,
      connectionId,
    )

    const forwardOptions = buildOrganizationLocationChangeKindOptions({
      location,
      intent: 'site',
      currentKind,
      subjectOrganizationId: organizationId,
      connections: [{ id: connectionId, locationId: location.id, kind: currentKind }],
      edgesAtLocation,
      excludeConnectionId: connectionId,
    })

    const inverseOptions = buildOrganizationLocationChangeKindOptions({
      location,
      intent: 'site',
      currentKind,
      subjectOrganizationId: organizationId,
      connections: inverseConnections,
      edgesAtLocation,
      excludeConnectionId: connectionId,
    })

    expect(forwardOptions).toEqual(inverseOptions)
    expect(forwardOptions.map((option) => option.value)).toEqual([
      'headquarters',
      'owns',
      'tenant',
      'operator',
    ])
  })

  it('aligns gating alternates with selectable non-current picker options', () => {
    const location = buildingLocation()
    const currentKind = 'headquarters' as const
    const resolved = resolveRelationshipAlternatives({
      surface: 'organization_forward',
      canManage: true,
      occupancyLoaded: true,
      relationship: {
        connectionId: 'conn-1',
        locationId: location.id,
        kind: currentKind,
        subjectOrganizationId: 'org-1',
      },
      locations: [location],
      connections: [{ id: 'conn-1', locationId: location.id, kind: currentKind }],
    })

    const pickerOptions = buildOrganizationLocationChangeKindOptions({
      location,
      intent: 'site',
      currentKind,
      subjectOrganizationId: 'org-1',
      connections: [{ id: 'conn-1', locationId: location.id, kind: currentKind }],
      edgesAtLocation: [],
      excludeConnectionId: 'conn-1',
    })

    assertChangeKindGatingAlignsWithPicker({
      gatingAlternates: resolved.alternatives.changeKind,
      pickerOptions,
      currentKind,
    })

    expect(resolved.alternatives.changeKind?.length).toBeGreaterThan(0)
    expect(pickerOptions.some((option) => option.value !== currentKind && !option.disabled)).toBe(
      true,
    )
  })
})
