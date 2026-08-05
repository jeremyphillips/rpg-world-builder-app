import { describe, expect, it } from 'vitest'

import { LOCATION_AUTHORING_TYPE_IDS } from './location-authoring-type'
import {
  assertLocationPartyAuthoringPolicyExhaustive,
  getAvailableLocationPartyAssociationKinds,
  isLocationPartyAssociationAuthoringSupported,
  LOCATION_PARTY_AUTHORING_POLICY,
  shouldShowLocationPartyAssociationsSection,
} from './location-party-authoring-policy'
import { buildLocationPartySemanticOptions } from './location-party-associations.lib'

describe('location party authoring policy', () => {
  it('covers every LocationAuthoringType exactly once', () => {
    assertLocationPartyAuthoringPolicyExhaustive()
    expect(Object.keys(LOCATION_PARTY_AUTHORING_POLICY).sort()).toEqual(
      [...LOCATION_AUTHORING_TYPE_IDS].sort(),
    )
  })

  it('hides authoring for plane, world, site, and monument', () => {
    for (const authoringType of ['plane', 'world', 'site', 'monument'] as const) {
      expect(isLocationPartyAssociationAuthoringSupported(authoringType)).toBe(false)
      expect(getAvailableLocationPartyAssociationKinds(authoringType)).toEqual([])
    }
  })

  it('offers operator for region', () => {
    expect(getAvailableLocationPartyAssociationKinds('region')).toEqual(['operator'])
    expect(isLocationPartyAssociationAuthoringSupported('region')).toBe(true)
  })

  it('offers resident and headquarters for settlement', () => {
    expect(isLocationPartyAssociationAuthoringSupported('settlement')).toBe(true)
    expect(getAvailableLocationPartyAssociationKinds('settlement')).toEqual([
      'resident',
      'headquarters',
    ])
  })

  it('offers resident for district', () => {
    expect(isLocationPartyAssociationAuthoringSupported('district')).toBe(true)
    expect(getAvailableLocationPartyAssociationKinds('district')).toEqual(['resident'])
  })

  it('offers all six current roles for building', () => {
    expect(getAvailableLocationPartyAssociationKinds('building')).toEqual([
      'owner',
      'tenant',
      'resident',
      'headquarters',
      'operator',
      'works_at',
    ])
  })

  it('offers owner, operator, and works here for infrastructure', () => {
    expect(getAvailableLocationPartyAssociationKinds('infrastructure')).toEqual([
      'owner',
      'operator',
      'works_at',
    ])
  })

  it('offers the restricted vessel set', () => {
    expect(getAvailableLocationPartyAssociationKinds('vessel')).toEqual([
      'owner',
      'resident',
      'operator',
      'works_at',
    ])
  })

  it('offers the restricted interior set', () => {
    expect(getAvailableLocationPartyAssociationKinds('interior')).toEqual([
      'tenant',
      'resident',
      'headquarters',
      'works_at',
    ])
  })

  it('does not expose owner for region authoring', () => {
    expect(getAvailableLocationPartyAssociationKinds('region')).not.toContain('owner')
  })

  it('filters relationship select options by authoring type', () => {
    expect(buildLocationPartySemanticOptions('settlement').map((option) => option.value)).toEqual([
      'resident',
      'headquarters',
    ])
    expect(buildLocationPartySemanticOptions('building').map((option) => option.value)).toEqual([
      'owner',
      'tenant',
      'resident',
      'headquarters',
      'operator',
      'works_at',
    ])
    expect(buildLocationPartySemanticOptions('region').map((option) => option.value)).toEqual([
      'operator',
    ])
  })

  it('shows the section when associations exist even if authoring is unsupported', () => {
    expect(
      shouldShowLocationPartyAssociationsSection({
        authoringType: 'site',
        associations: [
          {
            id: 'assoc-1',
            kind: 'ownership',
            party: { kind: 'organization', organizationId: 'org-1' },
          },
        ],
      }),
    ).toBe(true)
    expect(
      shouldShowLocationPartyAssociationsSection({
        authoringType: 'site',
        associations: [],
      }),
    ).toBe(false)
  })
})
