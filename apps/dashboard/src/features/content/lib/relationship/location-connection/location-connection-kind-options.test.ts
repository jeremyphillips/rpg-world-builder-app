import { describe, expect, it } from 'vitest'

import type { LocationConnectedPartyRow } from '@rpg/contracts'

import {
  guildhallBuilding,
  northernMarchRegion,
} from '@/features/content/lib/fixtures/location-test-helpers'

import {
  buildOrganizationInverseLocationConnections,
  buildOrganizationLocationConnectionEdgesAtLocation,
} from './location-connection-duplicate-keys'
import {
  assertChangeKindGatingAlignsWithPicker,
  assertChangeKindPickerIncludesCurrentKind,
  buildCharacterInverseLocationConnectionKindOptions,
  buildOrganizationFamilyKindOptions,
  buildOrganizationInverseLocationConnectionKindOptions,
  buildOrganizationLocationChangeKindOptions,
  canReopenConnectionKindDecision,
  ORGANIZATION_LOCATION_CONNECTION_STALE_CURRENT_KIND_REASON,
} from './location-connection-kind-options'
import { resolveRelationshipAlternatives } from '../list/relationship-alternatives'

function headquartersRow(organizationId = 'org-1'): LocationConnectedPartyRow {
  return {
    relationshipId: 'conn-1',
    subjectType: 'organization',
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

describe('buildOrganizationFamilyKindOptions', () => {
  it('keeps an organization-wide headquarters slot visible but disabled with location-specific reason', () => {
    const guildhouse = guildhallBuilding({ id: 'building-hq', name: 'Thieves Guildhouse' })
    const silverEel = guildhallBuilding({
      id: 'building-2',
      name: 'The Silver Eel',
      slug: 'silver-eel',
    })

    const options = buildOrganizationFamilyKindOptions({
      intent: 'site',
      locations: [guildhouse, silverEel],
      subjectOrganizationId: 'org-1',
      connections: [{ id: 'conn-hq', locationId: guildhouse.id, kind: 'headquarters' }],
      edgesByLocationId: {},
      occupancyLoaded: true,
    })

    const headquarters = options.find((option) => option.value === 'headquarters')
    expect(headquarters?.disabled).toBe(true)
    expect(headquarters?.disabledReason).toBe('Already set at Thieves Guildhouse.')
    expect(options.find((option) => option.value === 'owns')?.disabled).not.toBe(true)
  })

  it('enables headquarters when the organization has no existing headquarters connection', () => {
    const guildhouse = guildhallBuilding()

    const options = buildOrganizationFamilyKindOptions({
      intent: 'site',
      locations: [guildhouse],
      subjectOrganizationId: 'org-1',
      connections: [],
      edgesByLocationId: {},
      occupancyLoaded: true,
    })

    const headquarters = options.find((option) => option.value === 'headquarters')
    expect(headquarters?.disabled).not.toBe(true)
    expect(headquarters?.disabledReason).toBeUndefined()
    expect(headquarters?.description).toContain('primary base')
  })
})

describe('buildOrganizationLocationChangeKindOptions', () => {
  it('includes the persisted current kind in the picker options', () => {
    const location = guildhallBuilding()
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
    const location = northernMarchRegion()
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
    const location = guildhallBuilding()
    const currentKind = 'headquarters' as const
    const organizationId = 'org-1'
    const connectionId = 'conn-1'
    const row = headquartersRow(organizationId)
    const orgRows = [row]
    const edgesAtLocation = buildOrganizationLocationConnectionEdgesAtLocation(orgRows, location.id)
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
    const location = guildhallBuilding()
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
      locationCandidates: { items: [location], isAuthoritativeDomainSet: true },
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

describe('canReopenConnectionKindDecision', () => {
  it('returns false when fewer than two options exist', () => {
    expect(canReopenConnectionKindDecision([])).toBe(false)
    expect(
      canReopenConnectionKindDecision([
        { value: 'owns', label: 'Owner', description: 'Owns this location.' },
      ]),
    ).toBe(false)
  })

  it('returns true when two or more options exist, including when one is disabled', () => {
    expect(
      canReopenConnectionKindDecision([
        { value: 'headquarters', label: 'Headquarters', description: 'HQ', disabled: true },
        { value: 'owns', label: 'Owner', description: 'Owns this location.' },
      ]),
    ).toBe(true)
  })
})

describe('inverse location connection kind options', () => {
  it('uses contextual descriptions and inverse labels at a fixed location', () => {
    const location = guildhallBuilding()

    const options = buildOrganizationInverseLocationConnectionKindOptions({
      location,
      kinds: ['headquarters', 'owns'],
      connections: [],
      edgesAtLocation: [],
    })

    expect(options).toEqual([
      expect.objectContaining({
        value: 'headquarters',
        label: 'Headquarters of',
        description: 'Uses this building as its primary headquarters.',
      }),
      expect.objectContaining({
        value: 'owns',
        label: 'Owner',
        description: 'Owns or holds title to this building.',
      }),
    ])
  })

  it('requires location for character inverse kind options', () => {
    const location = guildhallBuilding()
    const options = buildCharacterInverseLocationConnectionKindOptions({
      location,
      kinds: ['works_at', 'resides_at'],
    })

    expect(options[0]?.description).toBe('Works at or is regularly present at this building.')
    expect(options[1]?.description).toBe('Lives at this building as a primary residence.')
  })
})
