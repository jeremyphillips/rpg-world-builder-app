import { describe, expect, it } from 'vitest'

import {
  getVehicleCategoryEntry,
  getVehicleCategoryLabel,
  getVehicleCategorySentenceForm,
  VEHICLE_CATEGORIES,
  VEHICLE_CATEGORY_ENTRIES,
  vehicleCategorySchema,
} from './vehicle-category'

describe('vehicleCategorySchema', () => {
  it('accepts every known vehicle category', () => {
    for (const category of VEHICLE_CATEGORIES) {
      expect(vehicleCategorySchema.parse(category)).toBe(category)
    }
  })

  it('rejects unknown categories', () => {
    expect(vehicleCategorySchema.safeParse('underground').success).toBe(false)
  })
})

describe('vehicle category vocabulary', () => {
  it('has a label and description for every category', () => {
    for (const category of VEHICLE_CATEGORIES) {
      const entry = getVehicleCategoryEntry(category)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('derives labels from the entry map', () => {
    for (const category of VEHICLE_CATEGORIES) {
      expect(getVehicleCategoryLabel(category)).toBe(VEHICLE_CATEGORY_ENTRIES[category].label)
    }
  })

  it('returns counted vehicle category sentence forms', () => {
    expect(getVehicleCategorySentenceForm('land', 1)).toBe('land vehicle')
    expect(getVehicleCategorySentenceForm('land', 2)).toBe('land vehicles')
    expect(getVehicleCategorySentenceForm('water', 2)).toBe('water vehicles')
  })
})
