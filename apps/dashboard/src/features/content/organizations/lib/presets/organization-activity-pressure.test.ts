import { describe, expect, it } from 'vitest'
import { applyOrganizationAuthoringPreset, migrateOrganizationActivities } from '@rpg/contracts'

import {
  ORGANIZATION_ACTIVITY_PRESSURE_FIXTURE,
  isActivityPressurePresetRow,
} from './fixtures/organization-activity-pressure.fixture'

describe('organization activity pressure fixture (regression)', () => {
  it('projects preset functions and practices for representative Function boundary cases', () => {
    for (const row of ORGANIZATION_ACTIVITY_PRESSURE_FIXTURE) {
      if (!isActivityPressurePresetRow(row)) continue
      const projected = applyOrganizationAuthoringPreset(row.presetId)
      expect(projected.functions).toEqual(row.presetFunctions)
      expect(projected.practices).toEqual(row.presetPractices)
    }
  })

  it('keeps custom-path legacy activity tuples independently valid', () => {
    for (const row of ORGANIZATION_ACTIVITY_PRESSURE_FIXTURE) {
      if (isActivityPressurePresetRow(row)) continue
      expect(row.customLegacyActivities.length).toBeGreaterThan(0)
      expect(new Set(row.customLegacyActivities).size).toBe(row.customLegacyActivities.length)
    }
  })

  it('maps custom legacy activity tuples through migrateOrganizationActivities', () => {
    for (const row of ORGANIZATION_ACTIVITY_PRESSURE_FIXTURE) {
      if (isActivityPressurePresetRow(row)) continue
      const migrated = migrateOrganizationActivities(row.customLegacyActivities)
      expect([...migrated.functions, ...migrated.practices]).toEqual(row.customLegacyActivities)
    }
  })
})
