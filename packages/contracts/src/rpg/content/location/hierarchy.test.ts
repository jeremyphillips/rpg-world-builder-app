import { describe, expect, it } from 'vitest'

import {
  LOCATION_KIND_DEFINITIONS,
  LOCATION_KINDS_WITH_DEFINITIONS,
  getAllowedParentKinds,
  getParentRequirement,
  isValidParentKind,
  validateLocationParentRequirement,
} from './hierarchy'
import { LOCATION_KIND_IDS } from '../../vocab/location/region/kind'

describe('LOCATION_KIND_DEFINITIONS integrity', () => {
  it('defines hierarchy policy for every location kind', () => {
    expect(LOCATION_KINDS_WITH_DEFINITIONS).toEqual(LOCATION_KIND_IDS)
    expect(Object.keys(LOCATION_KIND_DEFINITIONS).sort()).toEqual([...LOCATION_KIND_IDS].sort())
  })

  it('uses only valid kinds in allowedParents', () => {
    for (const kind of LOCATION_KIND_IDS) {
      for (const parentKind of getAllowedParentKinds(kind)) {
        expect(LOCATION_KIND_IDS).toContain(parentKind)
      }
    }
  })

  it('keeps parentRequirement consistent with allowedParents', () => {
    for (const kind of LOCATION_KIND_IDS) {
      const definition = LOCATION_KIND_DEFINITIONS[kind]
      const allowedParents = getAllowedParentKinds(kind)

      if (definition.parentRequirement === 'forbidden') {
        expect(allowedParents).toEqual([])
      }

      if (definition.parentRequirement === 'required') {
        expect(allowedParents.length).toBeGreaterThan(0)
      }

      expect(getParentRequirement(kind)).toBe(definition.parentRequirement)
    }
  })

  it('rejects region → structure as an invalid parent pairing', () => {
    expect(isValidParentKind('structure', 'region')).toBe(false)
  })

  it('allows settlement → world without requiring a region wrapper', () => {
    expect(isValidParentKind('settlement', 'world')).toBe(true)
  })

  it('allows settlement to parent district', () => {
    expect(isValidParentKind('district', 'settlement')).toBe(true)
  })

  it('forbids district from parenting district', () => {
    expect(isValidParentKind('district', 'district')).toBe(false)
  })

  it('allows district to parent structure and site place kinds', () => {
    expect(isValidParentKind('structure', 'district')).toBe(true)
    expect(isValidParentKind('site', 'district')).toBe(true)
  })

  it('validates parent requirement presence per kind', () => {
    expect(validateLocationParentRequirement('plane', undefined)).toBeUndefined()
    expect(validateLocationParentRequirement('plane', 'parent-1')).toBeDefined()
    expect(validateLocationParentRequirement('region', undefined)).toBeDefined()
    expect(validateLocationParentRequirement('world', undefined)).toBeUndefined()
  })
})
