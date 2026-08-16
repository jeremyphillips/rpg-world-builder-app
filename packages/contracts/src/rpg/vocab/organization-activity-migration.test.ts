import { describe, expect, it } from 'vitest'

import { ORGANIZATION_FUNCTION_IDS } from './organization-function'
import { ORGANIZATION_PRACTICE_IDS } from './organization-practice'
import {
  ORGANIZATION_ACTIVITY_MIGRATION,
  ORGANIZATION_LEGACY_ACTIVITY_IDS,
  migrateOrganizationActivities,
} from './organization-activity-migration'

describe('organization activity migration map', () => {
  it('maps every legacy id exactly once to an existing function or practice', () => {
    expect(Object.keys(ORGANIZATION_ACTIVITY_MIGRATION).sort()).toEqual(
      [...ORGANIZATION_LEGACY_ACTIVITY_IDS].sort(),
    )

    for (const legacyId of ORGANIZATION_LEGACY_ACTIVITY_IDS) {
      const target = ORGANIZATION_ACTIVITY_MIGRATION[legacyId]
      if (target.kind === 'function') {
        expect(ORGANIZATION_FUNCTION_IDS).toContain(target.id)
      } else {
        expect(ORGANIZATION_PRACTICE_IDS).toContain(target.id)
      }
      expect(target.id).toBe(legacyId)
    }
  })

  it('keeps function and practice ids disjoint', () => {
    const overlap = ORGANIZATION_FUNCTION_IDS.filter((id) =>
      (ORGANIZATION_PRACTICE_IDS as readonly string[]).includes(id),
    )
    expect(overlap).toEqual([])
  })

  it('partitions legacy activities preserving order within each output array', () => {
    expect(migrateOrganizationActivities(['production', 'brewing'])).toEqual({
      functions: ['production'],
      practices: ['brewing'],
    })

    expect(migrateOrganizationActivities(['finance', 'banking'])).toEqual({
      functions: ['finance'],
      practices: ['banking'],
    })

    expect(migrateOrganizationActivities(['transport', 'smuggling'])).toEqual({
      functions: ['transport'],
      practices: ['smuggling'],
    })
  })

  it('drops duplicate legacy ids while preserving first-seen order', () => {
    expect(migrateOrganizationActivities(['trade', 'trade', 'brewing', 'brewing'])).toEqual({
      functions: ['trade'],
      practices: ['brewing'],
    })
  })

  it('returns empty arrays for no legacy activities', () => {
    expect(migrateOrganizationActivities([])).toEqual({ functions: [], practices: [] })
  })
})
