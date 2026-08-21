import { z } from 'zod'
import { createElement } from 'react'
import {
  buildingFacilityTypeSchema,
  buildingFormSchema,
  interiorTypeSchema,
  planeTypeSchema,
  settlementTypeSchema,
  siteTypeSchema,
  slugSchema,
  validateLocationParentRequirement,
  type BuildingFacilityAuthoringGroup,
} from '@rpg/contracts'
import type { FormItem, RowFieldItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import type { LocationFormCtx } from './location-form-ctx'
import { descriptionField, nameField } from '../../../lib/forms/fields/content-identity-form-fields'
import { draftOptionalSelect } from '../../../lib/forms/validation/draft-form-schema-helpers'
import {
  buildLocationClassificationFields,
  buildLocationPrimaryClassificationFields,
  filterLocationFieldsForAuthoringType,
} from './location-classification-form-fields'
import {
  buildLocationAuthoringTypeOptions,
  canonicalFieldsForAuthoringType,
  LOCATION_AUTHORING_TYPE_IDS,
} from '../location-authoring-type'
import { buildParentLocationFieldOptions } from '../hierarchy/location-parent-field-options.lib'
import {
  buildParentLocationOptionAvailability,
  parentLocationFieldVisibility,
} from '../hierarchy/location-parent-picker'
import { LocationSettlementStartingDistrictsSlot } from '../../components/create/composition/location-settlement-starting-districts-slot'
import type { SettlementStructureAuthoringGuidance } from '../create/composition/location-settlement-create-composition.lib'

const locationAuthoringTypeSchema = z.enum(LOCATION_AUTHORING_TYPE_IDS)

const LOCATION_SELECT_PLACEHOLDER = 'Select…'

const classificationFormSchema = z
  .object({
    kind: z.string().optional(),
    type: z.string().optional(),
    form: draftOptionalSelect(buildingFormSchema),
    facilityType: draftOptionalSelect(buildingFacilityTypeSchema),
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

function resolveOmittedFixedCreateFieldNames(
  fixedCreate: LocationFormCtx['fixedCreate'],
): ReadonlySet<string> {
  const omitted = new Set<string>()
  if (!fixedCreate) return omitted
  if (fixedCreate.settlementType) omitted.add('settlementType')
  if (fixedCreate.siteType) omitted.add('siteType')
  if (fixedCreate.classification) {
    omitted.add('classification.kind')
    omitted.add('classification.type')
  }
  return omitted
}

function omitFixedCreateNamedFields<T>(
  fields: readonly T[],
  fixedCreate: LocationFormCtx['fixedCreate'],
): T[] {
  const omitted = resolveOmittedFixedCreateFieldNames(fixedCreate)
  if (omitted.size === 0) return [...fields]

  return fields.filter((field) => {
    const name =
      field && typeof field === 'object' && 'name' in field && typeof field.name === 'string'
        ? field.name
        : undefined
    return !name || !omitted.has(name)
  })
}

function omitNamedFields<T>(fields: readonly T[], names: ReadonlySet<string>): T[] {
  return fields.filter((field) => {
    const name =
      field && typeof field === 'object' && 'name' in field && typeof field.name === 'string'
        ? field.name
        : undefined
    return !name || !names.has(name)
  })
}

export function buildLocationFields(
  ctx: ContentFormCtx,
  options?: {
    buildingFacilityAuthoringGroup?: BuildingFacilityAuthoringGroup
    omitBuildingForm?: boolean
  },
): FormItem[] {
  const locationCtx = ctx as LocationFormCtx
  const fixedCreate = locationCtx.fixedCreate
  const parentIsFixed = fixedCreate?.parent?.kind === 'fixed'
  const referenceableLocations = ctx.options?.locations?.forReference()
  const items: FormItem[] = []

  if (fixedCreate) {
    const primaryFields: RowFieldItem[] = omitNamedFields(
      omitFixedCreateNamedFields(
        filterLocationFieldsForAuthoringType(
          buildLocationPrimaryClassificationFields(),
          fixedCreate.authoringType,
        ),
        fixedCreate,
      ),
      options?.omitBuildingForm ? new Set(['classification.form']) : new Set(),
    )
    if (primaryFields.length > 0) {
      items.push({ kind: 'row', fields: primaryFields })
    }

    items.push(
      ...omitFixedCreateNamedFields(
        filterLocationFieldsForAuthoringType(
          buildLocationClassificationFields(options),
          fixedCreate.authoringType,
        ),
        fixedCreate,
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
      options: buildParentLocationFieldOptions(ctx, ctx.locationParentLocationIdSeed),
      placeholder: LOCATION_SELECT_PLACEHOLDER,
      visibility: parentLocationFieldVisibility(),
      optionAvailability: buildParentLocationOptionAvailability(
        referenceableLocations,
        ctx.entityId,
      ),
    })
  }

  items.push(descriptionField(ctx))

  return items
}

export function composeLocationCreateBodyFields(
  ctx: ContentFormCtx,
  options?: {
    afterDescription?: FormItem[]
    buildingFacilityAuthoringGroup?: BuildingFacilityAuthoringGroup
    omitBuildingForm?: boolean
  },
): FormItem[] {
  const items = buildLocationFields(ctx, options)
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
      chrome: { variant: 'rail' },
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
