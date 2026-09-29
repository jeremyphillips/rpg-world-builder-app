import { LOCATION_KIND_IDS, type LocationKind } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { childAuthoringTypesForParentKind } from './create/location-create-shortcuts'
import type { LocationAuthoringType } from './location-authoring-type'
import { resolveLocationAuthoringOptionDescription } from './location-authoring-option-description.lib'

const PARENT_KIND_AUTHORING_TYPE: Partial<Record<LocationKind, LocationAuthoringType>> = {
  plane: 'plane',
  world: 'world',
  region: 'region',
  settlement: 'settlement',
  district: 'district',
  site: 'site',
  structure: 'building',
  interior: 'interior',
}

describe('resolveLocationAuthoringOptionDescription', () => {
  it('returns building child default for building-under-building override path', () => {
    expect(
      resolveLocationAuthoringOptionDescription({
        parentAuthoringType: 'building',
        childAuthoringType: 'building',
      }),
    ).toContain('annex')
  })

  it('returns building child default for site parent (no parent-specific override)', () => {
    expect(
      resolveLocationAuthoringOptionDescription({
        parentAuthoringType: 'site',
        childAuthoringType: 'building',
      }),
    ).toContain('annex')
  })

  it('covers every child type allowed under each parent kind in hierarchy SSOT', () => {
    for (const parentKind of LOCATION_KIND_IDS) {
      const childTypes = childAuthoringTypesForParentKind(parentKind)
      if (childTypes.length === 0) {
        continue
      }

      const parentAuthoringType = PARENT_KIND_AUTHORING_TYPE[parentKind]
      expect(
        parentAuthoringType,
        `expected authoring type mapping for parent kind "${parentKind}"`,
      ).toBeDefined()

      for (const childAuthoringType of childTypes) {
        const description = resolveLocationAuthoringOptionDescription({
          parentAuthoringType: parentAuthoringType!,
          childAuthoringType,
        })
        expect(description.length, `${parentKind} → ${childAuthoringType}`).toBeGreaterThan(0)
      }
    }
  })
})
