import { describe, expect, it } from 'vitest'

import {
  BUILDING_FACILITY_TYPE_ENTRIES,
  BUILDING_FACILITY_TYPE_IDS,
  buildingFacilityTypeSchema,
  getBuildingFacilityDefaultFunctions,
} from './building-facility-type'
import { BUILDING_FORM_ENTRIES, BUILDING_FORM_IDS, buildingFormSchema } from './building-form'
import { BUILDING_FUNCTION_FAMILY_IDS } from './building-function-family'

describe('Building semantic vocabularies', () => {
  it('keeps the initial Form registry narrow and schema-backed', () => {
    expect(BUILDING_FORM_IDS).toEqual(['house'])
    expect(Object.keys(BUILDING_FORM_ENTRIES)).toEqual(BUILDING_FORM_IDS)
    expect(buildingFormSchema.parse('house')).toBe('house')
    expect(buildingFormSchema.safeParse('tower')).toMatchObject({ success: false })
    expect(BUILDING_FORM_ENTRIES.house).not.toHaveProperty('defaultFunctions')
  })

  it('keeps the initial Facility registry narrow and schema-backed', () => {
    expect(BUILDING_FACILITY_TYPE_IDS).toEqual(['residence', 'brewery', 'temple'])
    expect(Object.keys(BUILDING_FACILITY_TYPE_ENTRIES)).toEqual(BUILDING_FACILITY_TYPE_IDS)
    expect(buildingFacilityTypeSchema.parse('brewery')).toBe('brewery')
    expect(buildingFacilityTypeSchema.safeParse('workshop')).toMatchObject({ success: false })
  })

  it('defines non-empty, duplicate-free Facility defaults from the function vocabulary', () => {
    const knownFunctions = new Set<string>(BUILDING_FUNCTION_FAMILY_IDS)

    for (const entry of Object.values(BUILDING_FACILITY_TYPE_ENTRIES)) {
      expect(entry.defaultFunctions.length).toBeGreaterThan(0)
      expect(new Set(entry.defaultFunctions).size).toBe(entry.defaultFunctions.length)
      for (const functionId of entry.defaultFunctions) {
        expect(knownFunctions.has(functionId)).toBe(true)
      }
    }
  })

  it('assigns only the agreed initial Facility defaults', () => {
    expect(getBuildingFacilityDefaultFunctions('residence')).toEqual(['dwelling'])
    expect(getBuildingFacilityDefaultFunctions('brewery')).toEqual(['production'])
    expect(getBuildingFacilityDefaultFunctions('temple')).toEqual(['worship'])
  })
})
