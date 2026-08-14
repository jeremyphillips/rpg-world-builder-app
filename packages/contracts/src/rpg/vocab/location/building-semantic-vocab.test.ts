import { describe, expect, it } from 'vitest'

import { buildingClassificationSchema } from '../../content/location/building-classification'
import {
  BUILDING_FACILITY_AUTHORING_GROUP_IDS,
  BUILDING_FACILITY_TYPE_ENTRIES,
  BUILDING_FACILITY_TYPE_IDS,
  buildingFacilityTypeSchema,
  getBuildingFacilityTypesForAuthoringGroup,
  getBuildingFacilityDefaultFunctions,
} from './building-facility-type'
import { BUILDING_FORM_ENTRIES, BUILDING_FORM_IDS, buildingFormSchema } from './building-form'
import { BUILDING_FUNCTION_FAMILY_IDS } from './building-function-family'

describe('Building semantic vocabularies', () => {
  it('keeps the Form registry narrow, schema-backed, and morphology-only', () => {
    expect(BUILDING_FORM_IDS).toEqual(['house', 'tower', 'hall', 'keep'])
    expect(Object.keys(BUILDING_FORM_ENTRIES)).toEqual(BUILDING_FORM_IDS)
    expect(buildingFormSchema.parse('house')).toBe('house')
    expect(buildingFormSchema.parse('tower')).toBe('tower')
    expect(buildingFormSchema.parse('hall')).toBe('hall')
    expect(buildingFormSchema.parse('keep')).toBe('keep')
    expect(buildingFormSchema.safeParse('gatehouse')).toMatchObject({ success: false })
    for (const entry of Object.values(BUILDING_FORM_ENTRIES)) {
      expect(entry).not.toHaveProperty('defaultFunctions')
    }
  })

  it('accepts open Form and Facility compositions without pair allowlists', () => {
    expect(buildingClassificationSchema.parse({ form: 'tower', facilityType: 'temple' })).toEqual({
      form: 'tower',
      facilityType: 'temple',
    })
    expect(buildingClassificationSchema.parse({ form: 'hall', facilityType: 'town_hall' })).toEqual(
      { form: 'hall', facilityType: 'town_hall' },
    )
    expect(buildingClassificationSchema.parse({ form: 'house', facilityType: 'temple' })).toEqual({
      form: 'house',
      facilityType: 'temple',
    })
    expect(
      buildingClassificationSchema.parse({ form: 'tower', facilityType: 'residence' }),
    ).toEqual({ form: 'tower', facilityType: 'residence' })
    expect(buildingClassificationSchema.parse({ form: 'keep', facilityType: 'residence' })).toEqual(
      { form: 'keep', facilityType: 'residence' },
    )
    expect(buildingClassificationSchema.parse({ form: 'keep', facilityType: 'barracks' })).toEqual({
      form: 'keep',
      facilityType: 'barracks',
    })
    expect(buildingClassificationSchema.parse({ form: 'house', facilityType: 'shop' })).toEqual({
      form: 'house',
      facilityType: 'shop',
    })
    expect(
      buildingClassificationSchema.parse({ form: 'tower', facilityType: 'watchtower' }),
    ).toEqual({ form: 'tower', facilityType: 'watchtower' })
    expect(buildingClassificationSchema.parse({ form: 'hall', facilityType: 'guildhall' })).toEqual(
      { form: 'hall', facilityType: 'guildhall' },
    )
    expect(buildingClassificationSchema.parse({ form: 'keep', facilityType: 'armory' })).toEqual({
      form: 'keep',
      facilityType: 'armory',
    })
    expect(buildingClassificationSchema.parse({ form: 'house', facilityType: 'archive' })).toEqual({
      form: 'house',
      facilityType: 'archive',
    })
  })

  it('keeps hall, guildhall, and town_hall as distinct ids on their axes', () => {
    expect(buildingFormSchema.safeParse('town_hall')).toMatchObject({ success: false })
    expect(buildingFormSchema.safeParse('guildhall')).toMatchObject({ success: false })
    expect(buildingFacilityTypeSchema.safeParse('hall')).toMatchObject({ success: false })
    expect(buildingFacilityTypeSchema.parse('town_hall')).toBe('town_hall')
    expect(buildingFacilityTypeSchema.parse('guildhall')).toBe('guildhall')
  })

  it('defines the approved Facility UX sample in deterministic registry order', () => {
    expect(BUILDING_FACILITY_TYPE_IDS).toEqual([
      'residence',
      'apartment_building',
      'boarding_house',
      'inn',
      'tavern',
      'market',
      'shop',
      'bank',
      'warehouse',
      'brewery',
      'distillery',
      'factory',
      'mill',
      'town_hall',
      'guildhall',
      'courthouse',
      'prison',
      'barracks',
      'armory',
      'watchtower',
      'library',
      'archive',
      'hospital',
      'temple',
      'theater',
      'stable',
    ])
    expect(Object.keys(BUILDING_FACILITY_TYPE_ENTRIES)).toEqual(BUILDING_FACILITY_TYPE_IDS)
    expect(buildingFacilityTypeSchema.parse('hospital')).toBe('hospital')
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

  it('assigns the approved default functions without changing function resolution', () => {
    expect(
      Object.fromEntries(
        BUILDING_FACILITY_TYPE_IDS.map((facilityType) => [
          facilityType,
          getBuildingFacilityDefaultFunctions(facilityType),
        ]),
      ),
    ).toEqual({
      residence: ['dwelling'],
      apartment_building: ['dwelling'],
      boarding_house: ['dwelling', 'lodging'],
      inn: ['lodging', 'food_drink_social'],
      tavern: ['food_drink_social'],
      market: ['retail'],
      shop: ['retail'],
      bank: ['finance'],
      warehouse: ['storage'],
      brewery: ['production'],
      distillery: ['production'],
      factory: ['production'],
      mill: ['production'],
      town_hall: ['governance', 'assembly'],
      guildhall: ['assembly'],
      courthouse: ['governance'],
      prison: ['governance'],
      barracks: ['defense_watch'],
      armory: ['storage', 'defense_watch'],
      watchtower: ['defense_watch'],
      library: ['knowledge'],
      archive: ['knowledge'],
      hospital: ['care'],
      temple: ['worship'],
      theater: ['spectacle'],
      stable: ['transport_support'],
    })
  })

  it('derives populated, non-exclusive discovery groups in registry order', () => {
    expect(BUILDING_FACILITY_AUTHORING_GROUP_IDS).toEqual([
      'residential',
      'commercial',
      'production',
      'civic',
      'religious',
      'lodging',
    ])
    expect(getBuildingFacilityTypesForAuthoringGroup('residential')).toEqual([
      'residence',
      'apartment_building',
      'boarding_house',
    ])
    expect(getBuildingFacilityTypesForAuthoringGroup('commercial')).toEqual([
      'inn',
      'tavern',
      'market',
      'shop',
      'bank',
      'warehouse',
      'brewery',
      'distillery',
      'theater',
      'stable',
    ])
    expect(getBuildingFacilityTypesForAuthoringGroup('production')).toEqual([
      'warehouse',
      'brewery',
      'distillery',
      'factory',
      'mill',
    ])
    expect(getBuildingFacilityTypesForAuthoringGroup('civic')).toEqual([
      'town_hall',
      'guildhall',
      'courthouse',
      'prison',
      'barracks',
      'armory',
      'watchtower',
      'library',
      'archive',
      'hospital',
      'theater',
    ])
    expect(getBuildingFacilityTypesForAuthoringGroup('religious')).toEqual(['temple'])
    expect(getBuildingFacilityTypesForAuthoringGroup('lodging')).toEqual([
      'boarding_house',
      'inn',
      'stable',
    ])
  })

  it('provides unique label, alias, and search discovery metadata', () => {
    for (const entry of Object.values(BUILDING_FACILITY_TYPE_ENTRIES)) {
      const discoveryTerms = [entry.label, ...('aliases' in entry ? entry.aliases : [])]
      expect(new Set(discoveryTerms.map((term) => term.toLocaleLowerCase())).size).toBe(
        discoveryTerms.length,
      )
      if ('searchTerms' in entry) {
        expect(entry.searchTerms.length).toBeGreaterThan(0)
        expect(new Set(entry.searchTerms).size).toBe(entry.searchTerms.length)
      }
    }
  })
})
