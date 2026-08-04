import { z } from 'zod'
import { createElement } from 'react'
import {
  interiorTypeSchema,
  locationPartyAssociationsSchema,
  planeTypeSchema,
  settlementTypeSchema,
  siteTypeSchema,
  slugSchema,
  validateLocationParentRequirement,
} from '@rpg/contracts'
import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { descriptionField, nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { draftOptionalSelect } from '../../lib/forms/draft-form-schema-helpers'
import {
  buildLocationClassificationFields,
  buildLocationPrimaryClassificationFields,
} from './location-classification-form-fields'
import {
  buildLocationAuthoringTypeOptions,
  canonicalFieldsForAuthoringType,
  LOCATION_AUTHORING_TYPE_IDS,
  resolveAuthoringTypeFromFormValues,
} from './location-authoring-type'
import {
  buildParentLocationOptionAvailability,
  buildParentLocationOptions,
  parentLocationFieldVisibility,
} from './location-parent-picker'
import { LocationPartyAssociationsSection } from '../components/location-party-associations-section.client'
import { LOCATION_PARTY_ASSOCIATIONS_FIELD } from './location-party-associations.lib'

const locationAuthoringTypeSchema = z.enum(LOCATION_AUTHORING_TYPE_IDS)

const LOCATION_SELECT_PLACEHOLDER = 'Select…'

const classificationFormSchema = z
  .object({
    kind: z.string().optional(),
    type: z.string().optional(),
    archetype: z.string().optional(),
    functionOverride: z.string().optional(),
    specialization: z.string().optional(),
  })
  .optional()

export const locationFormSchema = z
  .object({
    name: z.string().min(1),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    authoringType: locationAuthoringTypeSchema,
    parentLocationId: z.string().optional(),
    planeType: planeTypeSchema.optional(),
    settlementType: settlementTypeSchema.optional(),
    siteType: siteTypeSchema.optional(),
    interiorType: interiorTypeSchema.optional(),
    classification: classificationFormSchema,
    partyAssociations: locationPartyAssociationsSchema,
  })
  .superRefine((values, ctx) => {
    const { kind } = canonicalFieldsForAuthoringType(values.authoringType)
    const error = validateLocationParentRequirement(kind, values.parentLocationId)
    if (error) {
      ctx.addIssue({ code: 'custom', message: error, path: ['parentLocationId'] })
    }
  })

export const locationDraftFormSchema = z.object({
  name: z.string(),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  authoringType: draftOptionalSelect(locationAuthoringTypeSchema),
  parentLocationId: draftOptionalSelect(z.string().min(1)),
  planeType: draftOptionalSelect(planeTypeSchema),
  settlementType: draftOptionalSelect(settlementTypeSchema),
  siteType: draftOptionalSelect(siteTypeSchema),
  interiorType: draftOptionalSelect(interiorTypeSchema),
  classification: classificationFormSchema,
  partyAssociations: locationPartyAssociationsSchema,
})

export type LocationFormValues = z.infer<typeof locationFormSchema>

export { nameField as locationNameField }

export function buildLocationFields(ctx: ContentFormCtx): FormItem[] {
  const locationEntities = ctx.options?.locationEntities

  return [
    {
      kind: 'row',
      fields: [
        {
          type: 'select',
          name: 'authoringType',
          label: 'Location type',
          options: buildLocationAuthoringTypeOptions(),
          placeholder: LOCATION_SELECT_PLACEHOLDER,
          required: true,
          width: '1/3',
        },
        ...buildLocationPrimaryClassificationFields(),
      ],
    },
    ...buildLocationClassificationFields(),
    {
      type: 'select',
      name: 'parentLocationId',
      label: 'Parent location',
      options: buildParentLocationOptions(locationEntities),
      placeholder: LOCATION_SELECT_PLACEHOLDER,
      visibility: parentLocationFieldVisibility(),
      optionAvailability: buildParentLocationOptionAvailability(locationEntities, ctx.entityId),
    },
    descriptionField(ctx),
    {
      kind: 'group',
      legend: 'People & organizations',
      legendSize: 'subsection',
      fields: [
        {
          kind: 'slot',
          name: LOCATION_PARTY_ASSOCIATIONS_FIELD,
          render: () => createElement(LocationPartyAssociationsSection),
        },
      ],
    },
  ]
}

/** Resolves canonical kind from form values for hierarchy helpers within the form layer. */
export function resolveLocationKindFromFormValues(values: Record<string, unknown>) {
  const authoringType = resolveAuthoringTypeFromFormValues(values)
  if (!authoringType) return undefined
  return canonicalFieldsForAuthoringType(authoringType).kind
}
