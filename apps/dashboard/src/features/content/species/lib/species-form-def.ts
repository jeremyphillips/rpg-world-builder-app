import { type CreateSpeciesInput, type Species } from '@rpg/contracts'
import type { FormValueSync } from '@rpg/ui/form'

import { allowedCharacterCreatureTypesFromCtx } from './creature-type-field-options'
import {
  movementRowsIncludeFly,
  type MovementRowDraftFormValues,
} from '../../lib/forms/fields/content-movement-form-fields'
import {
  contentFormRegistry,
  contentFormFields,
  type ContentFormDef,
} from '../../lib/forms/registry/content-form-registry'
import { managedMediaFormDefFields } from '../../lib/forms/registry/managed-media-form-def.lib'
import { nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { finalizeContentInput } from '../../lib/forms/registry/content-form-key-helpers'
import { useSpecies, speciesQueryKey } from '../hooks/use-species'
import {
  buildSpeciesTabs,
  createSpeciesDraftFormSchema,
  createSpeciesFormSchema,
  speciesDraftFormSchema,
  speciesFormSchema,
  type SpeciesFormValues,
} from './species-form-fields'
import {
  buildSpeciesCreateInput,
  speciesCreateDefaultValues,
  speciesToFormValues,
} from './species-form-values'
import {
  buildSpeciesPreviewIdentity,
  buildSpeciesPreviewSections,
} from './species-preview-projection'
import { SpeciesPreviewPlayerHost } from './species-preview-player-host'

function buildSpeciesFormValueSyncs(): FormValueSync[] {
  return [
    {
      dependsOn: ['movement'],
      apply: (values, changedKeys) => {
        if (!changedKeys.includes('movement')) return undefined
        const movement = values.movement as MovementRowDraftFormValues[] | undefined
        if (!movementRowsIncludeFly(movement) && values.hover !== undefined) {
          return { hover: undefined }
        }
        return undefined
      },
    },
  ]
}

const speciesFormDef: ContentFormDef<Species, SpeciesFormValues, CreateSpeciesInput> = {
  routeKey: 'species',
  ...managedMediaFormDefFields('species'),

  schema: speciesFormSchema,
  draftSchema: speciesDraftFormSchema,
  resolveSchema: (ctx, intent = 'publish') =>
    intent === 'draft'
      ? createSpeciesDraftFormSchema()
      : createSpeciesFormSchema(
          allowedCharacterCreatureTypesFromCtx(ctx),
          ctx.creatureTypeVocabulary?.activeIds,
          ctx,
        ),
  createDefaultValues: speciesCreateDefaultValues,
  nameField,

  buildTabs: buildSpeciesTabs,
  buildFields: (ctx) => contentFormFields(speciesFormDef, ctx),
  valueSyncs: buildSpeciesFormValueSyncs,

  toFormValues: speciesToFormValues,
  enrichEditLayoutCtx: (ctx, entity) => ({
    ...ctx,
    creatureSizesSeedIds: entity.sizes,
  }),

  toInput: (values, ctx, validationIntent = 'publish') =>
    finalizeContentInput(
      buildSpeciesCreateInput(values, ctx, validationIntent),
      ctx,
    ) as CreateSpeciesInput,

  useListQuery: useSpecies,
  queryKey: speciesQueryKey,

  extractEmbeddedSeedRowIds: (entity) => ({
    traits: entity.traits.map((trait) => trait.id),
    'heritage.options': entity.heritage?.options.map((option) => option.id) ?? [],
  }),

  preview: {
    buildIdentity: buildSpeciesPreviewIdentity,
    buildSections: buildSpeciesPreviewSections,
    renderPlayerPreview: SpeciesPreviewPlayerHost,
  },
}

contentFormRegistry['species'] = speciesFormDef

export {
  speciesFormDef,
  createSpeciesFormSchema,
  createSpeciesDraftFormSchema,
  speciesDraftFormSchema,
}
export type { SpeciesFormValues }
