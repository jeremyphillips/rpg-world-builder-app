import { describe, expect, it } from 'vitest'

import {
  LOCATION_KIND_DEFINITIONS,
  LOCATION_KINDS_WITH_DEFINITIONS,
  getAllowedParentKinds,
  getParentRequirement,
  isValidParentKind,
} from './hierarchy'
import { LOCATION_KIND_IDS } from '../../vocab/location/kind'

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
})
