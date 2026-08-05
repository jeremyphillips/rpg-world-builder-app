import { describe, expect, it } from 'vitest'

import type { Location } from '@rpg/contracts'

import {
  filterOrganizationKindsByFamily,
  organizationDrawerIntentFromKind,
  organizationForwardLocationHasAvailableKind,
  organizationInverseSubjectHasAvailableKind,
  resolveLocationInverseOrganizationAddAffordances,
  resolveOrganizationKindsForDrawerIntent,
  resolvePeopleSectionOrganizationAddAffordances,
  resolveTerritorialSectionOrganizationAddAffordances,
} from './location-connection-drawer-intent'
import { organizationLocationConnectionKey } from './location-connection-duplicate-keys'

function regionLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'region-1',
    campaignId: 'camp-1',
    name: 'Kingdom of Foo',
    slug: 'kingdom-of-foo',
    kind: 'region',
    ...overrides,
  } as Location
}

function settlementLocation(overrides: Partial<Location> = {}): Location {
  return {
    id: 'settlement-1',
    campaignId: 'camp-1',
    name: 'Port City',
    slug: 'port-city',
    kind: 'settlement',
    ...overrides,
  } as Location
}

describe('location-connection-drawer-intent', () => {
  it('maps connection kinds to drawer intents via family', () => {
    expect(organizationDrawerIntentFromKind('governs')).toBe('territorial_authority')
    expect(organizationDrawerIntentFromKind('operates_in')).toBe('geographic_presence')
    expect(organizationDrawerIntentFromKind('headquarters')).toBe('site')
  })

  it('filters organization kinds by family for a region', () => {
    const kinds = resolveOrganizationKindsForDrawerIntent(regionLocation(), 'territorial_authority')
    expect(kinds).toEqual(['governs', 'controls', 'claims'])

    const presenceKinds = resolveOrganizationKindsForDrawerIntent(
      regionLocation(),
      'geographic_presence',
    )
    expect(presenceKinds).toEqual(['operates_in'])
  })

  it('exposes region territorial and presence add affordances separately', () => {
    const regionAffordances = resolveLocationInverseOrganizationAddAffordances(regionLocation())
    expect(regionAffordances.map((affordance) => affordance.label)).toEqual([
      'Add authority',
      'Add organization presence',
    ])

    expect(resolveTerritorialSectionOrganizationAddAffordances(regionLocation())).toEqual([
      { intent: 'territorial_authority', label: 'Add authority' },
    ])
    expect(resolvePeopleSectionOrganizationAddAffordances(regionLocation())).toEqual([
      { intent: 'geographic_presence', label: 'Add organization presence' },
    ])
  })

  it('exposes settlement governing org, headquarters, and presence affordances', () => {
    const settlementAffordances =
      resolveLocationInverseOrganizationAddAffordances(settlementLocation())
    expect(settlementAffordances.map((affordance) => affordance.label)).toEqual([
      'Add governing organization',
      'Add headquarters',
      'Add organization presence',
    ])
  })

  it('disables forward location rows only when all family kinds are linked', () => {
    const location = regionLocation()
    const existingKeys = new Set([organizationLocationConnectionKey(location.id, 'governs')])

    expect(
      organizationForwardLocationHasAvailableKind(location, 'territorial_authority', existingKeys),
    ).toBe(true)
    expect(
      organizationForwardLocationHasAvailableKind(location, 'geographic_presence', existingKeys),
    ).toBe(true)

    existingKeys.add(organizationLocationConnectionKey(location.id, 'controls'))
    existingKeys.add(organizationLocationConnectionKey(location.id, 'claims'))
    expect(
      organizationForwardLocationHasAvailableKind(location, 'territorial_authority', existingKeys),
    ).toBe(false)
  })

  it('keeps inverse organization rows selectable when only some family kinds are linked', () => {
    const existingKeys = new Set(['org-1:governs'])
    const eligibleKinds = filterOrganizationKindsByFamily(
      ['operates_in', 'governs', 'controls', 'claims'],
      'territorial_authority',
    )

    expect(organizationInverseSubjectHasAvailableKind('org-1', eligibleKinds, existingKeys)).toBe(
      true,
    )
  })
})
