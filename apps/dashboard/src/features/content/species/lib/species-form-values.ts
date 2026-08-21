import {
  contentTraitSchema,
  createSpeciesDraftInputSchema,
  createSpeciesInputSchema,
  type ContentTrait,
  type ContentValidationIntent,
  type CreateSpeciesInput,
  type Species,
  type SpeciesCultureConfig,
  type SpeciesHeritage,
} from '@rpg/contracts'

import {
  deriveSlugForCreate,
  finalizeContentInput,
  slugForInputParse,
} from '../../lib/forms/registry/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/registry/content-form-registry'
import { cultureToFormValues } from './species-culture-form-fields'
import { cultureFromFormValues } from './species-culture-form-values'
import { heritageFromFormValues, heritageToFormRow } from './species-heritage-form-values'
import { movementRecordToRows, movementRowsToRecord } from './species-movement-form-fields'
import {
  characterCreationFromFormValues,
  characterCreationToFormValues,
} from './species-rules-form-values'
import type { SpeciesFormValues } from './species-form-fields'
import { traitToFormRow, traitsFromFormValues } from './species-trait-form-values'

export const speciesCreateDefaultValues: Partial<SpeciesFormValues> = {
  creatureType: 'humanoid',
  sizes: ['medium'],
  movement: [{ mode: 'walk', feet: 30 }],
  languageAffinities: [],
  traits: [],
  culture: cultureToFormValues(),
}

export function speciesToFormValues(entity: Species): SpeciesFormValues {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    creatureType: entity.creatureType,
    sizes: entity.sizes,
    movement: movementRecordToRows(entity.movement),
    languageAffinities: entity.languageAffinities ?? [],
    traits: entity.traits.map(traitToFormRow),
    heritage: entity.heritage ? heritageToFormRow(entity.heritage) : undefined,
    characterCreation: characterCreationToFormValues(entity.characterCreation),
    culture: cultureToFormValues(entity.culture),
  }
}

function optionalLanguageAffinities(
  languageAffinities: SpeciesFormValues['languageAffinities'],
): Pick<CreateSpeciesInput, 'languageAffinities'> | undefined {
  if (languageAffinities === undefined || languageAffinities.length === 0) {
    return undefined
  }

  return { languageAffinities }
}

function optionalCulture(
  culture: SpeciesCultureConfig | undefined,
): Pick<CreateSpeciesInput, 'culture'> | undefined {
  return culture === undefined ? undefined : { culture }
}

function parsableTraits(traits: ContentTrait[]): ContentTrait[] {
  return traits.filter((trait) => contentTraitSchema.safeParse(trait).success)
}

function heritageForInput(
  heritage: SpeciesHeritage | undefined,
  validationIntent: ContentValidationIntent,
): SpeciesHeritage | undefined {
  if (!heritage) return undefined
  if (validationIntent === 'publish') return heritage

  return {
    ...heritage,
    options: parsableTraits(heritage.options),
  }
}

function traitsForInput(
  values: SpeciesFormValues,
  ctx: ContentFormInputCtx<Species> | undefined,
  validationIntent: ContentValidationIntent,
): ContentTrait[] {
  const traits = traitsFromFormValues(values.traits, ctx?.entity?.traits)
  return validationIntent === 'draft' ? parsableTraits(traits) : traits
}

function cultureForInput(
  values: SpeciesFormValues,
  ctx: ContentFormInputCtx<Species> | undefined,
): SpeciesCultureConfig | undefined {
  const slug = ctx?.entity?.slug ?? deriveSlugForCreate(values.name)
  return cultureFromFormValues(values.culture, {
    slug,
    existingCultureId: ctx?.entity?.culture?.id,
    entitySource: ctx?.entity?.source ?? 'homebrew',
  })
}

function speciesWirePayload(
  values: SpeciesFormValues,
  ctx: ContentFormInputCtx<Species> | undefined,
  validationIntent: ContentValidationIntent,
) {
  const characterCreation = characterCreationFromFormValues(values.characterCreation)
  const culture = cultureForInput(values, ctx)
  const heritage = heritageForInput(
    heritageFromFormValues(values.heritage, ctx?.entity?.heritage),
    validationIntent,
  )

  return {
    slug: slugForInputParse(values.name, ctx),
    name: values.name,
    description: values.description || undefined,
    creatureType: values.creatureType,
    sizes: values.sizes,
    movement: movementRowsToRecord(values.movement),
    ...optionalLanguageAffinities(values.languageAffinities),
    ...optionalCulture(culture),
    traits: traitsForInput(values, ctx, validationIntent),
    ...(heritage ? { heritage } : {}),
    ...(characterCreation ? { characterCreation } : {}),
  }
}

export function buildSpeciesCreateInput(
  values: SpeciesFormValues,
  ctx?: ContentFormInputCtx<Species>,
  validationIntent: ContentValidationIntent = 'publish',
): CreateSpeciesInput {
  const schema =
    validationIntent === 'draft' ? createSpeciesDraftInputSchema : createSpeciesInputSchema
  const input = schema.parse(speciesWirePayload(values, ctx, validationIntent))
  return finalizeContentInput(input, ctx) as CreateSpeciesInput
}
