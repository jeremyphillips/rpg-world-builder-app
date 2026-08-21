import { createElement } from 'react'
import { z } from 'zod'
import {
  CREATURE_SIZES,
  CREATURE_SIZE_ENTRIES,
  CREATURE_SIZE_TERM,
  CREATURE_TYPE_TERM,
  creatureSizeSchema,
  creatureTypeSchema,
  defineMessage,
  getTermSentenceForm,
  getVocabularyTermLabel,
  slugSchema,
  type CreatureTypeId,
} from '@rpg/contracts'
import { toOptions, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import { vocabularyFieldLabel, vocabularySelectFieldForTerm } from '@/features/vocabulary'

import { getCharacterCreatureTypeFieldOptions } from './creature-type-field-options'
import { descriptionField } from '../../lib/forms/fields/content-identity-form-fields'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  embeddedArrayResolverField,
  embeddedMasterDetailTabValidation,
  prefixFormItems,
} from '../../lib/forms/validation/tabbed-form-resolver-fields'
import { SpeciesHeritageTab } from '../components/species-heritage-tab.client'
import { SpeciesRulesTab } from '../components/species-rules-tab.client'
import { SpeciesTraitsTab } from '../components/species-traits-tab.client'
import { heritageScalarFields } from './species-heritage-form-fields'
import {
  cultureFields,
  cultureFormSchemaRefinement,
  speciesCultureFormSchema,
} from './species-culture-form-fields'
import {
  LEVEL_LIMITS_FIELD_PREFIX,
  multiclassingPolicyFields,
  MULTICLASSING_FIELD_PREFIX,
  speciesLevelLimitsFields,
} from './species-rules-form-fields'
import { heritageDraftFormSchema, heritageFormSchema } from './species-heritage-form-fields'
import { speciesCharacterCreationFormSchema } from './species-rules-form-fields'
import { refineSpeciesCharacterCreationForm } from './species-rules-form-values'
import {
  movementArrayField,
  movementRowFormSchema,
  refineSpeciesMovementRows,
} from './species-movement-form-fields'
import {
  traitItemFields,
  traitRowDraftFormSchema,
  traitRowFormSchema,
} from './species-trait-form-fields'

const creatureSizeOptions = toOptions(
  CREATURE_SIZES,
  Object.fromEntries(CREATURE_SIZES.map((s) => [s, CREATURE_SIZE_ENTRIES[s].label])) as Record<
    (typeof CREATURE_SIZES)[number],
    string
  >,
)

/** Species form validation messages (tier 3 form overrides). */
export const speciesValidationMessages = {
  creatureTypeNotAllowed: defineMessage(
    'validation.species.creatureTypeNotAllowed',
    () =>
      `${vocabularyFieldLabel(CREATURE_TYPE_TERM)} is not allowed for character sheets in this campaign.`,
  ),
  creatureTypeUnavailable: defineMessage(
    'validation.species.creatureTypeUnavailable',
    () =>
      `This ${getTermSentenceForm(CREATURE_TYPE_TERM, 1)} is not available in this campaign vocabulary.`,
  ),
}

export function createSpeciesFormSchema(
  allowedCreatureTypes: readonly CreatureTypeId[],
  activeCreatureTypes?: ReadonlySet<string>,
  formCtx: ContentFormCtx = {},
) {
  const allowedSet = new Set(allowedCreatureTypes)

  return z
    .object({
      name: z.string().min(1),
      slug: slugSchema.optional(),
      description: z.string().optional(),
      creatureType: creatureTypeSchema,
      sizes: z.array(creatureSizeSchema).min(1),
      movement: z.array(movementRowFormSchema).min(1),
      languageAffinities: z.array(z.string()).optional(),
      traits: z.array(traitRowFormSchema),
      heritage: heritageFormSchema.optional(),
      characterCreation: speciesCharacterCreationFormSchema.optional(),
      culture: speciesCultureFormSchema.optional(),
    })
    .superRefine((values, ctx) => {
      if (!allowedSet.has(values.creatureType)) {
        ctx.addIssue({
          code: 'custom',
          message: speciesValidationMessages.creatureTypeNotAllowed(),
          path: ['creatureType'],
        })
      }
      if (activeCreatureTypes && !activeCreatureTypes.has(values.creatureType)) {
        ctx.addIssue({
          code: 'custom',
          message: speciesValidationMessages.creatureTypeUnavailable(),
          path: ['creatureType'],
        })
      }
      refineSpeciesMovementRows(values.movement, ctx)
      refineSpeciesCharacterCreationForm(values.characterCreation, formCtx, ctx)
      cultureFormSchemaRefinement(values, formCtx, (issue) => {
        ctx.addIssue({
          code: 'custom',
          message: issue.message,
          path: issue.path,
        })
      })
    })
}

export function createSpeciesDraftFormSchema() {
  return z.object({
    name: z.string(),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    creatureType: creatureTypeSchema,
    sizes: z.array(creatureSizeSchema).default([]),
    movement: z.array(movementRowFormSchema).default([]),
    languageAffinities: z.array(z.string()).optional(),
    traits: z.array(traitRowDraftFormSchema).default([]),
    heritage: heritageDraftFormSchema.optional(),
    characterCreation: speciesCharacterCreationFormSchema.optional(),
    culture: speciesCultureFormSchema.optional(),
  })
}

export const speciesFormSchema = createSpeciesFormSchema(['humanoid'])
export const speciesDraftFormSchema = createSpeciesDraftFormSchema()
export type SpeciesFormValues = z.infer<typeof speciesFormSchema>

function attributesFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'row',
      fields: [
        vocabularySelectFieldForTerm(CREATURE_TYPE_TERM, {
          name: 'creatureType',
          options: getCharacterCreatureTypeFieldOptions(ctx),
          required: true,
          width: 'lg',
        }),
      ],
    },
    {
      type: 'chips',
      name: 'sizes',
      label: getVocabularyTermLabel(CREATURE_SIZE_TERM),
      options: creatureSizeOptions,
      required: true,
      chrome: { variant: 'panel' },
    },
    movementArrayField(),
  ]
}

export function buildSpeciesTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  return [
    {
      id: 'basics',
      label: 'Basics',
      fields: [...attributesFields(ctx), cultureFields(ctx), descriptionField(ctx)],
    },
    {
      id: 'traits',
      label: 'Traits',
      fields: [],
      ...embeddedMasterDetailTabValidation({
        path: 'traits',
        legend: 'Traits',
        fields: traitItemFields(ctx),
      }),
      header: createElement(SpeciesTraitsTab, { formCtx: ctx }),
    },
    {
      id: 'heritage',
      label: 'Heritage',
      fields: [],
      errorPaths: ['heritage'],
      resolverFields: [
        ...prefixFormItems(heritageScalarFields(ctx), 'heritage'),
        embeddedArrayResolverField('heritage.options', 'Heritage options', traitItemFields(ctx)),
      ],
      header: createElement(SpeciesHeritageTab, { formCtx: ctx }),
    },
    {
      id: 'rules',
      label: 'Rules',
      fields: [],
      errorPaths: ['characterCreation'],
      resolverFields: [
        ...prefixFormItems(multiclassingPolicyFields(ctx), MULTICLASSING_FIELD_PREFIX),
        ...prefixFormItems(speciesLevelLimitsFields(ctx), LEVEL_LIMITS_FIELD_PREFIX),
      ],
      header: createElement(SpeciesRulesTab, { formCtx: ctx }),
    },
  ]
}
