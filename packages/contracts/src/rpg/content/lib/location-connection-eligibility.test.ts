import { describe, expect, it } from 'vitest'

import { CHARACTER_LOCATION_CONNECTION_KIND_IDS } from '../../vocab/location/character-location-connection'
import { ORGANIZATION_LOCATION_CONNECTION_KIND_IDS } from '../../vocab/location/organization-location-connection'
import {
  isOrganizationLocationConnectionEligible,
  resolveLocationConnectionEligibility,
  resolveLocationConnectionProfile,
} from './location-connection-eligibility'

describe('location connection eligibility', () => {
  it('maps structure kinds through structureType', () => {
    expect(resolveLocationConnectionProfile({ kind: 'structure', structureType: 'building' })).toBe(
      'building',
    )
    expect(resolveLocationConnectionProfile({ kind: 'structure' })).toBe('structure')
  })

  it('locks region eligibility to geographic and territorial kinds only', () => {
    expect(resolveLocationConnectionEligibility({ kind: 'region' })).toEqual({
      characterKinds: [],
      organizationKinds: ['operates_in', 'governs', 'controls', 'claims'],
    })
    expect(isOrganizationLocationConnectionEligible({ kind: 'region' }, 'headquarters')).toBe(false)
    expect(isOrganizationLocationConnectionEligible({ kind: 'region' }, 'operates_in')).toBe(true)
  })

  it('allows governs but not controls or claims on settlements', () => {
    expect(resolveLocationConnectionEligibility({ kind: 'settlement' }).organizationKinds).toEqual([
      'headquarters',
      'operates_in',
      'governs',
    ])
    expect(isOrganizationLocationConnectionEligible({ kind: 'settlement' }, 'governs')).toBe(true)
    expect(isOrganizationLocationConnectionEligible({ kind: 'settlement' }, 'controls')).toBe(false)
  })

  it('allows resides_at on districts without headquarters', () => {
    expect(resolveLocationConnectionEligibility({ kind: 'district' })).toEqual({
      characterKinds: ['resides_at'],
      organizationKinds: ['operates_in'],
    })
  })

  it('exposes every declared connection kind on at least one profile', () => {
    const characterKinds = new Set<string>()
    const organizationKinds = new Set<string>()

    for (const kind of ['plane', 'world', 'region', 'settlement', 'district', 'site'] as const) {
      const eligibility = resolveLocationConnectionEligibility({ kind })
      eligibility.characterKinds.forEach((value) => characterKinds.add(value))
      eligibility.organizationKinds.forEach((value) => organizationKinds.add(value))
    }

    for (const structureType of [
      'building',
      'fortification',
      'infrastructure',
      'monument',
      'vessel',
    ] as const) {
      const eligibility = resolveLocationConnectionEligibility({
        kind: 'structure',
        structureType,
      })
      eligibility.characterKinds.forEach((value) => characterKinds.add(value))
      eligibility.organizationKinds.forEach((value) => organizationKinds.add(value))
    }

    expect([...CHARACTER_LOCATION_CONNECTION_KIND_IDS].sort()).toEqual([...characterKinds].sort())
    expect([...ORGANIZATION_LOCATION_CONNECTION_KIND_IDS].sort()).toEqual(
      [...organizationKinds].sort(),
    )
  })
})
