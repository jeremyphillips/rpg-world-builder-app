import { describe, expect, it } from 'vitest'
import { applyOrganizationAuthoringPreset } from '@rpg/contracts'

import {
  ORGANIZATION_ACTIVITY_PRESSURE_FIXTURE,
  isActivityPressurePresetRow,
} from './__tests__/fixtures/organization-activity-pressure.fixture'

describe('organization activity pressure fixture (regression)', () => {
  it('projects preset activities for representative Function boundary cases', () => {
    for (const row of ORGANIZATION_ACTIVITY_PRESSURE_FIXTURE) {
      if (!isActivityPressurePresetRow(row)) continue
      expect(applyOrganizationAuthoringPreset(row.presetId).activities).toEqual(
        row.presetActivities,
      )
    }
  })

  it('keeps custom-path activity tuples independently valid', () => {
    for (const row of ORGANIZATION_ACTIVITY_PRESSURE_FIXTURE) {
      if (isActivityPressurePresetRow(row)) continue
      expect(row.customActivities.length).toBeGreaterThan(0)
      expect(new Set(row.customActivities).size).toBe(row.customActivities.length)
    }
  })
})
