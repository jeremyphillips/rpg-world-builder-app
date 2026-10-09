import { createElement } from 'react'
import { z } from 'zod'
import {
  CREATURE_SIZE_TERM,
  CREATURE_TYPE_TERM,
  addCustomRefinementIssue,
  creatureSizeSchema,
  creatureTypeSchema,
  defineMessage,
  getTermSentenceForm,
  getVocabularyTermLabel,
  slugSchema,
  type CreatureTypeId,
  getSpeciesHeritageLabel,
  getSpeciesHeritageOptionsLabel,
} from '@rpg/contracts'
import { type FormItem, type TabbedFormTab } from '@rpg/ui/form'

import {
  buildActiveSizeFieldOptions,
  vocabularyFieldLabel,
  vocabularySelectFieldForTerm,
} from '@/features/vocabulary'

import { getCharacterCreatureTypeFieldOptions } from './creature-type-field-options'
import {
  managedContentMediaFormFields,
  withManagedContentMediaFormSchema,
} from '../../lib/forms/fields/content-managed-media-form-schema.lib'
import { withContentFormTabIcon } from '../../lib/forms/content-form-tab-icons'
import { descriptionField } from '../../lib/forms/fields/content-identity-form-fields'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import {
  embeddedArrayResolverField,
  embeddedMasterDetailTabValidation,
  prefixFormItems,
} from '../../lib/forms/validation/tabbed-form-resolver-fields'
import { SpeciesHeritageTab } from '../components/species-heritage-tab'
import { SpeciesRulesTab } from '../components/species-rules-tab'
import { SpeciesTraitsTab } from '../components/species-traits-tab'
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
  movementRowDraftFormSchema,
  movementRowFormSchema,
  refineSpeciesMovementRows,
} from './species-movement-form-fields'
import {
  heritageOptionItemFields,
  traitItemFields,
  traitRowDraftFormSchema,
  traitRowFormSchema,
} from './species-trait-form-fields'

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
      ...managedContentMediaFormFields,
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
        addCustomRefinementIssue(ctx, speciesValidationMessages.creatureTypeNotAllowed(), [
          'creatureType',
        ])
      }
      if (activeCreatureTypes && !activeCreatureTypes.has(values.creatureType)) {
        addCustomRefinementIssue(ctx, speciesValidationMessages.creatureTypeUnavailable(), [
          'creatureType',
        ])
      }
      refineSpeciesMovementRows(values.movement, ctx)
      refineSpeciesCharacterCreationForm(values.characterCreation, formCtx, ctx)
      cultureFormSchemaRefinement(values, formCtx, (issue) => {
        addCustomRefinementIssue(ctx, issue.message, issue.path)
      })
    })
}

export function createSpeciesDraftFormSchema() {
  return withManagedContentMediaFormSchema(
    z.object({
      name: z.string(),
      slug: slugSchema.optional(),
      description: z.string().optional(),
      creatureType: creatureTypeSchema,
      sizes: z.array(creatureSizeSchema).default([]),
      movement: z.array(movementRowDraftFormSchema).default([]),
      languageAffinities: z.array(z.string()).optional(),
      traits: z.array(traitRowDraftFormSchema).default([]),
      heritage: heritageDraftFormSchema.optional(),
      characterCreation: speciesCharacterCreationFormSchema.optional(),
      culture: speciesCultureFormSchema.optional(),
    }),
  )
}

export const speciesFormSchema = createSpeciesFormSchema(['humanoid'])
export const speciesDraftFormSchema = createSpeciesDraftFormSchema()
export type SpeciesFormValues = z.infer<typeof speciesFormSchema>

function attributesFields(ctx: ContentFormCtx): FormItem[] {
  return [
    {
      kind: 'columns',
      collapseOrder: [
        [0, 0],
        [1, 0],
        [0, 1],
        [0, 2],
        [1, 1],
      ],
      columns: [
        {
          fields: [
            vocabularySelectFieldForTerm(CREATURE_TYPE_TERM, {
              name: 'creatureType',
              options: getCharacterCreatureTypeFieldOptions(ctx),
              required: true,
            }),
            movementArrayField(),
            cultureFields(ctx),
          ],
        },
        {
          fields: [
            {
              type: 'chips',
              name: 'sizes',
              label: getVocabularyTermLabel(CREATURE_SIZE_TERM),
              options: buildActiveSizeFieldOptions(ctx.sizeVocabulary),
              required: true,
            },
            descriptionField(ctx),
          ],
        },
      ],
    },
  ]
}

export function buildSpeciesTabs(ctx: ContentFormCtx): TabbedFormTab[] {
  return [
    {
      id: 'basics',
      label: 'Basics',
      fields: attributesFields(ctx),
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
      label: getSpeciesHeritageLabel(),
      fields: [],
      errorPaths: ['heritage'],
      resolverFields: [
        ...prefixFormItems(heritageScalarFields(ctx), 'heritage'),
        embeddedArrayResolverField(
          'heritage.options',
          getSpeciesHeritageOptionsLabel(),
          heritageOptionItemFields(ctx),
        ),
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
  ].map(withContentFormTabIcon)
}
