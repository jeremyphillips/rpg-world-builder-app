import { describe, expect, it } from 'vitest'

import { buildingClassificationSchema } from '../../content/location/building-classification'
import {
  BUILDING_FACILITY_AUTHORING_GROUP_IDS,
  BUILDING_FACILITY_TYPE_ENTRIES,
  BUILDING_FACILITY_TYPE_IDS,
  buildingFacilityTypeSchema,
  getBuildingFacilityDefaultFunctions,
  getBuildingFacilityTypeLabel,
  getBuildingFacilityTypesForAuthoringGroup,
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
    expect(buildingClassificationSchema.parse({ facilityType: 'checkpoint' })).toEqual({
      facilityType: 'checkpoint',
    })
    expect(
      buildingClassificationSchema.parse({ form: 'keep', facilityType: 'checkpoint' }),
    ).toEqual({ form: 'keep', facilityType: 'checkpoint' })
    expect(
      buildingClassificationSchema.parse({ form: 'tower', facilityType: 'checkpoint' }),
    ).toEqual({ form: 'tower', facilityType: 'checkpoint' })
    expect(buildingClassificationSchema.parse({ facilityType: 'lighthouse' })).toEqual({
      facilityType: 'lighthouse',
    })
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
    expect(
      buildingClassificationSchema.parse({ form: 'hall', facilityType: 'watchtower' }),
    ).toEqual({ form: 'hall', facilityType: 'watchtower' })
    expect(
      buildingClassificationSchema.parse({ form: 'hall', facilityType: 'lighthouse' }),
    ).toEqual({ form: 'hall', facilityType: 'lighthouse' })
    expect(
      buildingClassificationSchema.parse({ form: 'tower', facilityType: 'town_hall' }),
    ).toEqual({ form: 'tower', facilityType: 'town_hall' })
    expect(buildingClassificationSchema.parse({ form: 'keep', facilityType: 'library' })).toEqual({
      form: 'keep',
      facilityType: 'library',
    })
    expect(
      buildingClassificationSchema.parse({ form: 'house', facilityType: 'checkpoint' }),
    ).toEqual({
      form: 'house',
      facilityType: 'checkpoint',
    })
    expect(buildingClassificationSchema.parse({ facilityType: 'bathhouse' })).toEqual({
      facilityType: 'bathhouse',
    })
    expect(buildingClassificationSchema.parse({ form: 'hall', facilityType: 'bathhouse' })).toEqual(
      { form: 'hall', facilityType: 'bathhouse' },
    )
    expect(
      buildingClassificationSchema.parse({ form: 'house', facilityType: 'bathhouse' }),
    ).toEqual({ form: 'house', facilityType: 'bathhouse' })
    expect(buildingClassificationSchema.parse({ facilityType: 'observatory' })).toEqual({
      facilityType: 'observatory',
    })
    expect(
      buildingClassificationSchema.parse({ form: 'tower', facilityType: 'observatory' }),
    ).toEqual({ form: 'tower', facilityType: 'observatory' })
    expect(
      buildingClassificationSchema.parse({ form: 'hall', facilityType: 'observatory' }),
    ).toEqual({ form: 'hall', facilityType: 'observatory' })
    expect(buildingClassificationSchema.parse({ facilityType: 'embassy' })).toEqual({
      facilityType: 'embassy',
    })
    expect(buildingClassificationSchema.parse({ form: 'house', facilityType: 'embassy' })).toEqual({
      form: 'house',
      facilityType: 'embassy',
    })
    expect(buildingClassificationSchema.parse({ form: 'hall', facilityType: 'embassy' })).toEqual({
      form: 'hall',
      facilityType: 'embassy',
    })
    expect(buildingClassificationSchema.parse({ facilityType: 'schoolhouse' })).toEqual({
      facilityType: 'schoolhouse',
    })
    expect(
      buildingClassificationSchema.parse({ form: 'house', facilityType: 'schoolhouse' }),
    ).toEqual({ form: 'house', facilityType: 'schoolhouse' })
    expect(buildingClassificationSchema.parse({ facilityType: 'barn' })).toEqual({
      facilityType: 'barn',
    })
    expect(buildingClassificationSchema.parse({ form: 'house', facilityType: 'barn' })).toEqual({
      form: 'house',
      facilityType: 'barn',
    })
    expect(buildingClassificationSchema.parse({ facilityType: 'granary' })).toEqual({
      facilityType: 'granary',
    })
    expect(buildingClassificationSchema.parse({ form: 'house', facilityType: 'granary' })).toEqual({
      form: 'house',
      facilityType: 'granary',
    })
    expect(buildingClassificationSchema.parse({ facilityType: 'greenhouse' })).toEqual({
      facilityType: 'greenhouse',
    })
    expect(
      buildingClassificationSchema.parse({ form: 'hall', facilityType: 'greenhouse' }),
    ).toEqual({ form: 'hall', facilityType: 'greenhouse' })
    expect(buildingClassificationSchema.parse({ facilityType: 'arena' })).toEqual({
      facilityType: 'arena',
    })
    expect(buildingClassificationSchema.parse({ form: 'hall', facilityType: 'arena' })).toEqual({
      form: 'hall',
      facilityType: 'arena',
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
      'office',
      'warehouse',
      'barn',
      'bakery',
      'granary',
      'greenhouse',
      'brewery',
      'distillery',
      'factory',
      'mill',
      'workshop',
      'town_hall',
      'guildhall',
      'courthouse',
      'embassy',
      'prison',
      'barracks',
      'checkpoint',
      'armory',
      'watchtower',
      'library',
      'schoolhouse',
      'lighthouse',
      'observatory',
      'archive',
      'auction_house',
      'arena',
      'bathhouse',
      'hospital',
      'temple',
      'theater',
      'stable',
    ])
    expect(Object.keys(BUILDING_FACILITY_TYPE_ENTRIES)).toEqual(BUILDING_FACILITY_TYPE_IDS)
    expect(buildingFacilityTypeSchema.parse('hospital')).toBe('hospital')
    expect(buildingFacilityTypeSchema.parse('workshop')).toBe('workshop')
    expect(buildingFacilityTypeSchema.parse('office')).toBe('office')
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
      office: ['governance'],
      warehouse: ['storage'],
      barn: ['storage', 'service'],
      bakery: ['production', 'retail'],
      granary: ['storage'],
      greenhouse: ['production'],
      brewery: ['production'],
      distillery: ['production'],
      factory: ['production'],
      mill: ['production'],
      workshop: ['production'],
      town_hall: ['governance', 'assembly'],
      guildhall: ['assembly'],
      courthouse: ['governance'],
      embassy: ['governance', 'assembly'],
      prison: ['governance'],
      barracks: ['defense_watch'],
      checkpoint: ['defense_watch'],
      armory: ['storage', 'defense_watch'],
      watchtower: ['defense_watch'],
      library: ['knowledge'],
      schoolhouse: ['knowledge'],
      lighthouse: ['defense_watch'],
      observatory: ['knowledge'],
      archive: ['knowledge'],
      auction_house: ['retail'],
      arena: ['spectacle'],
      bathhouse: ['care'],
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
      'office',
      'warehouse',
      'barn',
      'bakery',
      'brewery',
      'distillery',
      'workshop',
      'auction_house',
      'arena',
      'bathhouse',
      'theater',
      'stable',
    ])
    expect(getBuildingFacilityTypesForAuthoringGroup('production')).toEqual([
      'warehouse',
      'barn',
      'bakery',
      'granary',
      'greenhouse',
      'brewery',
      'distillery',
      'factory',
      'mill',
      'workshop',
    ])
    expect(getBuildingFacilityTypesForAuthoringGroup('civic')).toEqual([
      'office',
      'town_hall',
      'guildhall',
      'courthouse',
      'embassy',
      'prison',
      'barracks',
      'checkpoint',
      'armory',
      'watchtower',
      'library',
      'schoolhouse',
      'lighthouse',
      'observatory',
      'archive',
      'arena',
      'bathhouse',
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

  it('ships bathhouse as a Form-independent hygiene premises Facility distinct from hospital', () => {
    expect(buildingFacilityTypeSchema.parse('bathhouse')).toBe('bathhouse')
    expect(getBuildingFacilityTypeLabel('bathhouse')).toBe('Bathhouse')
    expect(getBuildingFacilityDefaultFunctions('bathhouse')).toEqual(['care'])
    expect(getBuildingFacilityDefaultFunctions('hospital')).toEqual(['care'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.bathhouse.description).toContain('bathing')
    expect(BUILDING_FACILITY_TYPE_ENTRIES.hospital.description).toContain('healing')
    expect(getBuildingFacilityTypesForAuthoringGroup('civic')).toContain('bathhouse')
    expect(getBuildingFacilityTypesForAuthoringGroup('commercial')).toContain('bathhouse')
    expect(getBuildingFacilityTypeLabel('bathhouse').toLocaleLowerCase()).not.toBe('house')
  })

  it('ships observatory as instrumented observation premises distinct from watch post and library', () => {
    expect(buildingFacilityTypeSchema.parse('observatory')).toBe('observatory')
    expect(getBuildingFacilityTypeLabel('observatory')).toBe('Observatory')
    expect(getBuildingFacilityDefaultFunctions('observatory')).toEqual(['knowledge'])
    expect(getBuildingFacilityDefaultFunctions('library')).toEqual(['knowledge'])
    expect(getBuildingFacilityDefaultFunctions('watchtower')).toEqual(['defense_watch'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.observatory.description).toContain('observation')
    expect(BUILDING_FACILITY_TYPE_ENTRIES.observatory.description).toContain('viewpoint')
    expect(BUILDING_FACILITY_TYPE_ENTRIES.library.description).toContain('records')
    expect(getBuildingFacilityTypesForAuthoringGroup('civic')).toContain('observatory')
  })

  it('ships embassy as diplomatic premises distinct from town hall and residence pairing', () => {
    expect(buildingFacilityTypeSchema.parse('embassy')).toBe('embassy')
    expect(getBuildingFacilityTypeLabel('embassy')).toBe('Embassy')
    expect(getBuildingFacilityDefaultFunctions('embassy')).toEqual(['governance', 'assembly'])
    expect(getBuildingFacilityDefaultFunctions('town_hall')).toEqual(['governance', 'assembly'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.embassy.description).toContain('representational')
    expect(BUILDING_FACILITY_TYPE_ENTRIES.embassy.description).toContain(
      'not the diplomatic organization itself',
    )
    expect(BUILDING_FACILITY_TYPE_ENTRIES.town_hall.description).toContain('civic')
    expect(getBuildingFacilityTypesForAuthoringGroup('civic')).toContain('embassy')
    expect(buildingFacilityTypeSchema.safeParse('residence')).toMatchObject({ success: true })
  })

  it('ships schoolhouse as instructional premises distinct from library', () => {
    expect(buildingFacilityTypeSchema.parse('schoolhouse')).toBe('schoolhouse')
    expect(getBuildingFacilityTypeLabel('schoolhouse')).toBe('Schoolhouse')
    expect(getBuildingFacilityDefaultFunctions('schoolhouse')).toEqual(['knowledge'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.schoolhouse.description).toContain('instruction')
    expect(BUILDING_FACILITY_TYPE_ENTRIES.library.description).toContain('records')
    expect(getBuildingFacilityTypesForAuthoringGroup('civic')).toContain('schoolhouse')
    expect(getBuildingFacilityTypeLabel('schoolhouse').toLocaleLowerCase()).not.toBe('house')
  })

  it('ships barn as agricultural premises distinct from warehouse and stable', () => {
    expect(buildingFacilityTypeSchema.parse('barn')).toBe('barn')
    expect(getBuildingFacilityTypeLabel('barn')).toBe('Barn')
    expect(getBuildingFacilityDefaultFunctions('barn')).toEqual(['storage', 'service'])
    expect(getBuildingFacilityDefaultFunctions('warehouse')).toEqual(['storage'])
    expect(getBuildingFacilityDefaultFunctions('stable')).toEqual(['transport_support'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.barn.description).toContain('agricultural')
    expect(BUILDING_FACILITY_TYPE_ENTRIES.warehouse.description).toContain('cargo')
    expect(getBuildingFacilityTypesForAuthoringGroup('production')).toContain('barn')
    expect(getBuildingFacilityTypesForAuthoringGroup('commercial')).toContain('barn')
  })

  it('ships granary as grain-storage premises distinct from warehouse and barn via functions and groups', () => {
    expect(buildingFacilityTypeSchema.parse('granary')).toBe('granary')
    expect(getBuildingFacilityTypeLabel('granary')).toBe('Granary')
    expect(getBuildingFacilityDefaultFunctions('granary')).toEqual(['storage'])
    expect(getBuildingFacilityDefaultFunctions('warehouse')).toEqual(['storage'])
    expect(getBuildingFacilityDefaultFunctions('barn')).toEqual(['storage', 'service'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.granary.description).toContain('grain')
    expect(getBuildingFacilityTypesForAuthoringGroup('production')).toContain('granary')
    expect(getBuildingFacilityTypesForAuthoringGroup('commercial')).not.toContain('granary')
  })

  it('ships greenhouse as cultivation premises distinct from barn via functions and groups', () => {
    expect(buildingFacilityTypeSchema.parse('greenhouse')).toBe('greenhouse')
    expect(getBuildingFacilityTypeLabel('greenhouse')).toBe('Greenhouse')
    expect(getBuildingFacilityDefaultFunctions('greenhouse')).toEqual(['production'])
    expect(getBuildingFacilityDefaultFunctions('barn')).toEqual(['storage', 'service'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.greenhouse.description).toContain('cultivation')
    expect(getBuildingFacilityTypesForAuthoringGroup('production')).toContain('greenhouse')
    expect(getBuildingFacilityTypesForAuthoringGroup('commercial')).not.toContain('greenhouse')
  })

  it('ships arena as combat spectacle premises distinct from theater via labels and search terms', () => {
    expect(buildingFacilityTypeSchema.parse('arena')).toBe('arena')
    expect(getBuildingFacilityTypeLabel('arena')).toBe('Arena')
    expect(getBuildingFacilityDefaultFunctions('arena')).toEqual(['spectacle'])
    expect(getBuildingFacilityDefaultFunctions('theater')).toEqual(['spectacle'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.arena.description).toContain('combat')
    expect(BUILDING_FACILITY_TYPE_ENTRIES.theater.description).toContain('performance')
    expect(getBuildingFacilityTypesForAuthoringGroup('civic')).toContain('arena')
    expect(getBuildingFacilityTypesForAuthoringGroup('commercial')).toContain('arena')
  })

  it('ships workshop as artisan production premises distinct from factory via functions and groups', () => {
    expect(buildingFacilityTypeSchema.parse('workshop')).toBe('workshop')
    expect(getBuildingFacilityTypeLabel('workshop')).toBe('Workshop')
    expect(getBuildingFacilityDefaultFunctions('workshop')).toEqual(['production'])
    expect(getBuildingFacilityDefaultFunctions('factory')).toEqual(['production'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.workshop.description).toContain('small-scale')
    expect(BUILDING_FACILITY_TYPE_ENTRIES.factory.description).toContain('manufacturing')
    expect(getBuildingFacilityTypesForAuthoringGroup('production')).toContain('workshop')
    expect(getBuildingFacilityTypesForAuthoringGroup('commercial')).toContain('workshop')
  })

  it('ships office as administrative premises distinct from shop and town hall via functions and groups', () => {
    expect(buildingFacilityTypeSchema.parse('office')).toBe('office')
    expect(getBuildingFacilityTypeLabel('office')).toBe('Office')
    expect(getBuildingFacilityDefaultFunctions('office')).toEqual(['governance'])
    expect(getBuildingFacilityDefaultFunctions('shop')).toEqual(['retail'])
    expect(getBuildingFacilityDefaultFunctions('town_hall')).toEqual(['governance', 'assembly'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.office.description).toContain('administrative')
    expect(getBuildingFacilityTypesForAuthoringGroup('commercial')).toContain('office')
    expect(getBuildingFacilityTypesForAuthoringGroup('civic')).toContain('office')
  })

  it('ships bakery as configured baking premises distinct from shop and factory via functions and groups', () => {
    expect(buildingFacilityTypeSchema.parse('bakery')).toBe('bakery')
    expect(getBuildingFacilityTypeLabel('bakery')).toBe('Bakery')
    expect(getBuildingFacilityDefaultFunctions('bakery')).toEqual(['production', 'retail'])
    expect(getBuildingFacilityDefaultFunctions('shop')).toEqual(['retail'])
    expect(getBuildingFacilityDefaultFunctions('factory')).toEqual(['production'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.bakery.description).toContain('baking')
    expect(getBuildingFacilityTypesForAuthoringGroup('production')).toContain('bakery')
    expect(getBuildingFacilityTypesForAuthoringGroup('commercial')).toContain('bakery')
  })

  it('ships auction_house as sale-event premises distinct from market and shop via labels and groups', () => {
    expect(buildingFacilityTypeSchema.parse('auction_house')).toBe('auction_house')
    expect(getBuildingFacilityTypeLabel('auction_house')).toBe('Auction house')
    expect(getBuildingFacilityDefaultFunctions('auction_house')).toEqual(['retail'])
    expect(getBuildingFacilityDefaultFunctions('market')).toEqual(['retail'])
    expect(BUILDING_FACILITY_TYPE_ENTRIES.auction_house.description).toContain('auction')
    expect(BUILDING_FACILITY_TYPE_ENTRIES.market.description).toContain('merchants')
    expect(getBuildingFacilityTypesForAuthoringGroup('commercial')).toContain('auction_house')
    expect(getBuildingFacilityTypesForAuthoringGroup('production')).not.toContain('auction_house')
  })

  it('resolves legacy morphological Facility ids from registry metadata, not lexical id shape', () => {
    expect(getBuildingFacilityTypeLabel('watchtower')).toBe('Watch post')
    expect(getBuildingFacilityTypeLabel('lighthouse')).toBe('Beacon station')
    expect(getBuildingFacilityTypeLabel('watchtower').toLocaleLowerCase()).not.toContain('tower')
    expect(getBuildingFacilityTypeLabel('lighthouse').toLocaleLowerCase()).not.toContain('tower')
    expect(getBuildingFacilityTypeLabel('lighthouse').toLocaleLowerCase()).not.toBe('lighthouse')
    expect(getBuildingFacilityDefaultFunctions('watchtower')).toEqual(['defense_watch'])
    expect(getBuildingFacilityDefaultFunctions('lighthouse')).toEqual(['defense_watch'])
    expect(
      buildingClassificationSchema.parse({ form: 'hall', facilityType: 'watchtower' }),
    ).toEqual({ form: 'hall', facilityType: 'watchtower' })
    expect(
      buildingClassificationSchema.parse({ form: 'house', facilityType: 'lighthouse' }),
    ).toEqual({ form: 'house', facilityType: 'lighthouse' })
  })
})
