import { describe, expect, it } from 'vitest'

import { ORGANIZATION_FUNCTION_IDS } from './function'
import { ORGANIZATION_PRACTICE_IDS } from './practice'
import {
  ORGANIZATION_ACTIVITY_MIGRATION,
  ORGANIZATION_ACTIVITY_PARTITION_IDS,
  migrateOrganizationActivities,
} from './activity-migration'

describe('organization activity migration map', () => {
  it('maps every partition id exactly once to an existing function or practice', () => {
    expect(Object.keys(ORGANIZATION_ACTIVITY_MIGRATION).sort()).toEqual(
      [...ORGANIZATION_ACTIVITY_PARTITION_IDS].sort(),
    )

    for (const partitionId of ORGANIZATION_ACTIVITY_PARTITION_IDS) {
      const target = ORGANIZATION_ACTIVITY_MIGRATION[partitionId]
      if (target.kind === 'function') {
        expect(ORGANIZATION_FUNCTION_IDS).toContain(target.id)
      } else {
        expect(ORGANIZATION_PRACTICE_IDS).toContain(target.id)
      }
      expect(target.id).toBe(partitionId)
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
