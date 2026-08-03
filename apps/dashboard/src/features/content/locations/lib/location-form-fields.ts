import { z } from 'zod'
import {
  interiorTypeSchema,
  INTERIOR_TYPE_ENTRIES,
  INTERIOR_TYPE_IDS,
  locationKindSchema,
  LOCATION_KIND_ENTRIES,
  LOCATION_KIND_IDS,
  planeTypeSchema,
  PLANE_TYPE_ENTRIES,
  PLANE_TYPE_IDS,
  regionTypeSchema,
  REGION_TYPE_ENTRIES,
  REGION_TYPE_IDS,
  settlementTypeSchema,
  SETTLEMENT_TYPE_ENTRIES,
  SETTLEMENT_TYPE_IDS,
  siteTypeSchema,
  SITE_TYPE_ENTRIES,
  SITE_TYPE_IDS,
  slugSchema,
  structureTypeSchema,
  STRUCTURE_TYPE_ENTRIES,
  STRUCTURE_TYPE_IDS,
  validateLocationParentRequirement,
} from '@rpg/contracts'
import { toOptions, type FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { descriptionField, nameField } from '../../lib/forms/fields/content-identity-form-fields'
import { draftOptionalSelect } from '../../lib/forms/draft-form-schema-helpers'
import { visibleForLocationKind } from './location-display'
import {
  buildParentLocationOptionAvailability,
  buildParentLocationOptions,
  parentLocationFieldVisibility,
} from './location-parent-picker'

const locationKindOptions = toOptions(
  LOCATION_KIND_IDS,
  Object.fromEntries(
    LOCATION_KIND_IDS.map((id) => [id, LOCATION_KIND_ENTRIES[id].label]),
  ) as Record<(typeof LOCATION_KIND_IDS)[number], string>,
)

function subtypeOptions<T extends string>(
  ids: readonly T[],
  entries: Record<T, { label: string }>,
) {
  return toOptions(
    ids,
    Object.fromEntries(ids.map((id) => [id, entries[id].label])) as Record<T, string>,
  )
}

const LOCATION_SELECT_PLACEHOLDER = 'Select…'

export const locationFormSchema = z
  .object({
    name: z.string().min(1),
    slug: slugSchema.optional(),
    description: z.string().optional(),
    kind: locationKindSchema,
    parentLocationId: z.string().optional(),
    planeType: planeTypeSchema.optional(),
    regionType: regionTypeSchema.optional(),
    settlementType: settlementTypeSchema.optional(),
    siteType: siteTypeSchema.optional(),
    structureType: structureTypeSchema.optional(),
    interiorType: interiorTypeSchema.optional(),
  })
  .superRefine((values, ctx) => {
    const error = validateLocationParentRequirement(values.kind, values.parentLocationId)
    if (error) {
      ctx.addIssue({ code: 'custom', message: error, path: ['parentLocationId'] })
    }
  })

export const locationDraftFormSchema = z.object({
  name: z.string(),
  slug: slugSchema.optional(),
  description: z.string().optional(),
  kind: draftOptionalSelect(locationKindSchema),
  parentLocationId: draftOptionalSelect(z.string().min(1)),
  planeType: draftOptionalSelect(planeTypeSchema),
  regionType: draftOptionalSelect(regionTypeSchema),
  settlementType: draftOptionalSelect(settlementTypeSchema),
  siteType: draftOptionalSelect(siteTypeSchema),
  structureType: draftOptionalSelect(structureTypeSchema),
  interiorType: draftOptionalSelect(interiorTypeSchema),
})

export type LocationFormValues = z.infer<typeof locationFormSchema>

export { nameField as locationNameField }

export function buildLocationFields(ctx: ContentFormCtx): FormItem[] {
  const locationEntities = ctx.options?.locationEntities

  return [
    descriptionField(ctx),
    {
      type: 'chips',
      name: 'kind',
      label: 'Kind',
      options: locationKindOptions,
      multiple: false,
      required: true,
      chrome: { variant: 'outline' },
    },
    {
      type: 'select',
      name: 'planeType',
      label: 'Plane type',
      options: subtypeOptions(PLANE_TYPE_IDS, PLANE_TYPE_ENTRIES),
      placeholder: LOCATION_SELECT_PLACEHOLDER,
      visibility: visibleForLocationKind('plane'),
    },
    {
      type: 'select',
      name: 'regionType',
      label: 'Region type',
      options: subtypeOptions(REGION_TYPE_IDS, REGION_TYPE_ENTRIES),
      placeholder: LOCATION_SELECT_PLACEHOLDER,
      visibility: visibleForLocationKind('region'),
    },
    {
      type: 'select',
      name: 'settlementType',
      label: 'Settlement type',
      options: subtypeOptions(SETTLEMENT_TYPE_IDS, SETTLEMENT_TYPE_ENTRIES),
      placeholder: LOCATION_SELECT_PLACEHOLDER,
      visibility: visibleForLocationKind('settlement'),
    },
    {
      type: 'select',
      name: 'siteType',
      label: 'Site type',
      options: subtypeOptions(SITE_TYPE_IDS, SITE_TYPE_ENTRIES),
      placeholder: LOCATION_SELECT_PLACEHOLDER,
      visibility: visibleForLocationKind('site'),
    },
    {
      type: 'select',
      name: 'structureType',
      label: 'Structure type',
      options: subtypeOptions(STRUCTURE_TYPE_IDS, STRUCTURE_TYPE_ENTRIES),
      placeholder: LOCATION_SELECT_PLACEHOLDER,
      visibility: visibleForLocationKind('structure'),
    },
    {
      type: 'select',
      name: 'interiorType',
      label: 'Interior type',
      options: subtypeOptions(INTERIOR_TYPE_IDS, INTERIOR_TYPE_ENTRIES),
      placeholder: LOCATION_SELECT_PLACEHOLDER,
      visibility: visibleForLocationKind('interior'),
    },
    {
      type: 'select',
      name: 'parentLocationId',
      label: 'Parent location',
      options: buildParentLocationOptions(locationEntities),
      placeholder: LOCATION_SELECT_PLACEHOLDER,
      visibility: parentLocationFieldVisibility(),
      optionAvailability: buildParentLocationOptionAvailability(locationEntities, ctx.entityId),
    },
  ]
}
