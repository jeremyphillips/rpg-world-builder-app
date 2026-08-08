import { z } from 'zod'
import { createElement } from 'react'
import {
  interiorTypeSchema,
  planeTypeSchema,
  settlementTypeSchema,
  siteTypeSchema,
  slugSchema,
  validateLocationParentRequirement,
} from '@rpg/contracts'
import type { FormItem, RowFieldItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import type { LocationFormCtx } from './location-form-ctx'
import { descriptionField, nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { draftOptionalSelect } from '../../lib/forms/draft-form-schema-helpers'
import {
  buildLocationClassificationFields,
  buildLocationPrimaryClassificationFields,
  filterLocationFieldsForAuthoringType,
} from './location-classification-form-fields'
import {
  buildLocationAuthoringTypeOptions,
  canonicalFieldsForAuthoringType,
  LOCATION_AUTHORING_TYPE_IDS,
} from './location-authoring-type'
import {
  buildParentLocationOptionAvailability,
  buildParentLocationOptions,
  parentLocationFieldVisibility,
} from './location-parent-picker'
import { LocationSettlementStartingDistrictsSlot } from '../components/location-settlement-starting-districts-slot.client'
import type { SettlementStructureAuthoringGuidance } from './location-settlement-create-composition.lib'

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
})

export type LocationFormValues = z.infer<typeof locationFormSchema>

export { nameField as locationNameField }

export function buildLocationFields(ctx: ContentFormCtx): FormItem[] {
  const locationCtx = ctx as LocationFormCtx
  const fixedCreate = locationCtx.fixedCreate
  const parentIsFixed = fixedCreate?.parent?.kind === 'fixed'
  const locationEntities = ctx.options?.locationEntities
  const items: FormItem[] = []

  const omitFixedSettlementTypeFields = (fields: RowFieldItem[]): RowFieldItem[] => {
    if (!fixedCreate?.settlementType) return fields
    return fields.filter((field) => field.name !== 'settlementType')
  }

  if (fixedCreate) {
    const primaryFields = omitFixedSettlementTypeFields(
      filterLocationFieldsForAuthoringType(
        buildLocationPrimaryClassificationFields(),
        fixedCreate.authoringType,
      ),
    )
    if (primaryFields.length > 0) {
      items.push({ kind: 'row', fields: primaryFields })
    }

    items.push(
      ...filterLocationFieldsForAuthoringType(
        buildLocationClassificationFields(),
        fixedCreate.authoringType,
      ),
    )
  } else {
    items.push({
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
    })
  }

  if (!fixedCreate) {
    items.push(...buildLocationClassificationFields())
  }

  if (!parentIsFixed) {
    items.push({
      type: 'select',
      name: 'parentLocationId',
      label: 'Parent location',
      options: buildParentLocationOptions(locationEntities),
      placeholder: LOCATION_SELECT_PLACEHOLDER,
      visibility: parentLocationFieldVisibility(),
      optionAvailability: buildParentLocationOptionAvailability(locationEntities, ctx.entityId),
    })
  }

  items.push(descriptionField(ctx))

  return items
}

export function composeLocationCreateBodyFields(
  ctx: ContentFormCtx,
  options?: { afterDescription?: FormItem[] },
): FormItem[] {
  const items = buildLocationFields(ctx)
  if (options?.afterDescription?.length) {
    items.push(...options.afterDescription)
  }
  return items
}

export const SETTLEMENT_STARTING_DISTRICTS_GROUP_LEGEND = 'Structure' as const

/** Presentation-only FormItems for optional starting districts — no composition state. */
export function buildSettlementStartingDistrictsFormItems(
  guidance: SettlementStructureAuthoringGuidance,
): FormItem[] {
  return [
    {
      kind: 'group',
      legend: SETTLEMENT_STARTING_DISTRICTS_GROUP_LEGEND,
      description: `${guidance.helper} ${guidance.emphasis}`,
      chrome: { variant: 'inset' },
      fields: [
        {
          kind: 'slot',
          name: 'startingDistricts',
          render: () => createElement(LocationSettlementStartingDistrictsSlot),
        },
      ],
    },
  ]
}

/** Resolves canonical kind from form values for hierarchy helpers within the form layer. */
export function resolveLocationKindFromFormValues(values: Record<string, unknown>) {
  const authoringType = values.authoringType
  if (typeof authoringType !== 'string') return undefined
  return canonicalFieldsForAuthoringType(
    authoringType as (typeof LOCATION_AUTHORING_TYPE_IDS)[number],
  ).kind
}
