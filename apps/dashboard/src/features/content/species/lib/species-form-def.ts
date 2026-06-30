import { type CreateSpeciesInput, type Species } from '@rpg/contracts'

import { allowedCharacterCreatureTypesFromCtx } from '../../lib/creature-type-field-options'
import {
  contentFormRegistry,
  contentFormFields,
  type ContentFormDef,
} from '../../lib/content-form-registry'
import { finalizeContentInput } from '../../lib/content-form-key-helpers'
import { useSpecies, speciesQueryKey } from '../hooks/use-species'
import {
  buildSpeciesTabs,
  createSpeciesFormSchema,
  speciesFormSchema,
  type SpeciesFormValues,
} from './species-form-fields'
import {
  buildSpeciesCreateInput,
  speciesCreateDefaultValues,
  speciesToFormValues,
} from './species-form-values'

const speciesFormDef: ContentFormDef<Species, SpeciesFormValues, CreateSpeciesInput> = {
  routeKey: 'species',

  schema: speciesFormSchema,
  resolveSchema: (ctx) =>
    createSpeciesFormSchema(
      allowedCharacterCreatureTypesFromCtx(ctx),
      ctx.creatureTypeVocabulary?.activeIds,
      ctx,
    ),
  createDefaultValues: speciesCreateDefaultValues,

  buildTabs: buildSpeciesTabs,
  buildFields: (ctx) => contentFormFields(speciesFormDef, ctx),

  toFormValues: speciesToFormValues,

  toInput: (values, ctx) =>
    finalizeContentInput(buildSpeciesCreateInput(values, ctx), ctx) as CreateSpeciesInput,

  useListQuery: useSpecies,
  queryKey: speciesQueryKey,

  extractEmbeddedSeedRowIds: (entity) => ({
    traits: entity.traits.map((trait) => trait.id),
    'heritage.options': entity.heritage?.options.map((option) => option.id) ?? [],
  }),
}

contentFormRegistry['species'] = speciesFormDef

export { speciesFormDef, createSpeciesFormSchema }
export type { SpeciesFormValues }
