import { loadSeedClasses } from '@rpg/catalog/classes'
import { loadSeedSpecies } from '@rpg/catalog/species'
import { contentMediaSchema } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import '../../../classes/lib/class-form-def'
import '../../../equipment/lib/equipment-form-def'
import '../../../locations/lib/forms/location-form-def'
import '../../../organizations/lib/organization-form-def'
import '../../../species/lib/species-form-def'
import { classFormDef } from '../../../classes/lib/class-form-def'
import { classDraftFormSchema, classFormSchema } from '../../../classes/lib/class-form-fields'
import { equipmentFormDef } from '../../../equipment/lib/equipment-form-def'
import {
  equipmentFormDraftSchema,
  equipmentFormSchema,
} from '../../../equipment/lib/equipment-form-fields'
import { locationFormDef } from '../../../locations/lib/forms/location-form-def'
import {
  locationDraftFormSchema,
  locationFormSchema,
} from '../../../locations/lib/forms/location-form-fields'
import { organizationFormDef } from '../../../organizations/lib/organization-form-def'
import {
  organizationDraftFormSchema,
  organizationFormSchema,
} from '../organization-form-projection'
import { speciesFormDef } from '../../../species/lib/species-form-def'
import { speciesDraftFormSchema, speciesFormSchema } from '../../../species/lib/species-form-fields'
import { contentFormRegistry } from './content-form-registry'

const sampleMedia = contentMediaSchema.parse({
  revision: 1,
  images: [{ id: 'image-1', assetId: 'asset-1' }],
  roles: {},
})

const MEDIA_ENABLED_ROUTE_KEYS = [
  'classes',
  'species',
  'equipment',
  'locations',
  'organizations',
] as const

describe('managed content media form defs', () => {
  it.each(MEDIA_ENABLED_ROUTE_KEYS)('registers media capability on %s', (routeKey) => {
    const def = contentFormRegistry[routeKey]
    expect(def?.supportsManagedMedia).toBe(true)
    expect(def?.mediaDomain).toBeDefined()
  })
})

describe('managed content media schema parse retention', () => {
  it('classes publish and draft retain media', () => {
    const fighter = loadSeedClasses('srd-cc-5.2.1').find((record) => record.slug === 'fighter')
    expect(fighter).toBeDefined()
    const base = classFormDef.toFormValues(fighter!)
    const withMedia = { ...base, media: sampleMedia }

    expect(
      (classFormSchema.parse(withMedia) as unknown as { media?: typeof sampleMedia }).media,
    ).toEqual(sampleMedia)
    expect(
      (classDraftFormSchema.parse(withMedia) as unknown as { media?: typeof sampleMedia }).media,
    ).toEqual(sampleMedia)
  })

  it('species publish and draft retain media', () => {
    const elf = loadSeedSpecies('srd-cc-5.2.1').find((record) => record.slug === 'elf')
    expect(elf).toBeDefined()
    const base = speciesFormDef.toFormValues(elf!)
    const withMedia = { ...base, media: sampleMedia }

    expect(
      (speciesFormSchema.parse(withMedia) as unknown as { media?: typeof sampleMedia }).media,
    ).toEqual(sampleMedia)
    expect(
      (speciesDraftFormSchema.parse(withMedia) as unknown as { media?: typeof sampleMedia }).media,
    ).toEqual(sampleMedia)
  })

  it('equipment hub schemas retain media', () => {
    const withMedia = {
      ...equipmentFormDef.createDefaultValues,
      name: 'Torch',
      hasMarketPrice: false,
      cost: null,
      media: sampleMedia,
    }

    expect(
      (equipmentFormSchema.parse(withMedia) as unknown as { media?: typeof sampleMedia }).media,
    ).toEqual(sampleMedia)
    expect(
      (equipmentFormDraftSchema.parse(withMedia) as unknown as { media?: typeof sampleMedia })
        .media,
    ).toEqual(sampleMedia)
  })

  it('location schemas retain media', () => {
    const withMedia = {
      ...locationFormDef.createDefaultValues,
      name: 'Site',
      authoringType: 'site' as const,
      parentLocationId: 'parent-location-id',
      media: sampleMedia,
    }

    expect(
      (locationFormSchema.parse(withMedia) as unknown as { media?: typeof sampleMedia }).media,
    ).toEqual(sampleMedia)
    expect(
      (locationDraftFormSchema.parse(withMedia) as unknown as { media?: typeof sampleMedia }).media,
    ).toEqual(sampleMedia)
  })

  it('organization schemas retain media', () => {
    const withMedia = {
      ...organizationFormDef.createDefaultValues,
      name: 'Guild',
      organizationDomain: 'commercial' as const,
      media: sampleMedia,
    }

    expect(
      (organizationFormSchema.parse(withMedia) as unknown as { media?: typeof sampleMedia }).media,
    ).toEqual(sampleMedia)
    expect(
      (organizationDraftFormSchema.parse(withMedia) as unknown as { media?: typeof sampleMedia })
        .media,
    ).toEqual(sampleMedia)
  })
})
