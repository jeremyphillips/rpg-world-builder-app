import {
  createLocationDraftInputSchema,
  createLocationInputSchema,
  type ContentValidationIntent,
  type CreateLocationInput,
  type Location,
  type LocationKind,
} from '@rpg/contracts'

import { finalizeContentInput, slugForInputParse } from '../../lib/forms/content-form-key-helpers'
import type { ContentFormInputCtx } from '../../lib/forms/content-form-registry'
import type { LocationFormValues } from './location-form-fields'

export const locationCreateDefaultValues: Partial<LocationFormValues> = {}

function sharedBodyFields(values: LocationFormValues) {
  return {
    name: values.name,
    description: values.description || undefined,
    ...(values.parentLocationId ? { parentLocationId: values.parentLocationId } : {}),
  }
}

function buildRegionClassification(values: LocationFormValues) {
  const classification = values.classification
  if (classification?.kind !== 'political' && classification?.kind !== 'geographic') {
    return {}
  }
  if (!classification.type) return {}
  return {
    classification: {
      kind: classification.kind,
      type: classification.type,
    },
  }
}

function buildBuildingClassification(values: LocationFormValues) {
  const classification = values.classification
  if (!classification?.type) return {}
  return {
    classification: classification.subtype
      ? { type: classification.type, subtype: classification.subtype }
      : { type: classification.type },
  }
}

function buildInteriorClassification(values: LocationFormValues) {
  const classification = values.classification
  if (!classification?.type) return {}
  return {
    classification: { type: classification.type },
  }
}

const kindBodyFieldBuilders: Record<
  LocationKind,
  (values: LocationFormValues) => Record<string, unknown>
> = {
  plane: (values) => ({
    ...sharedBodyFields(values),
    kind: 'plane',
    ...(values.planeType ? { planeType: values.planeType } : {}),
  }),
  world: (values) => ({ ...sharedBodyFields(values), kind: 'world' }),
  region: (values) => ({
    ...sharedBodyFields(values),
    kind: 'region',
    ...buildRegionClassification(values),
  }),
  settlement: (values) => ({
    ...sharedBodyFields(values),
    kind: 'settlement',
    ...(values.settlementType ? { settlementType: values.settlementType } : {}),
  }),
  district: (values) => ({ ...sharedBodyFields(values), kind: 'district' }),
  site: (values) => ({
    ...sharedBodyFields(values),
    kind: 'site',
    ...(values.siteType ? { siteType: values.siteType } : {}),
  }),
  structure: (values) => ({
    ...sharedBodyFields(values),
    kind: 'structure',
    ...(values.structureType ? { structureType: values.structureType } : {}),
    ...(values.structureType === 'building' ? buildBuildingClassification(values) : {}),
  }),
  interior: (values) => ({
    ...sharedBodyFields(values),
    kind: 'interior',
    ...(values.interiorType ? { interiorType: values.interiorType } : {}),
    ...buildInteriorClassification(values),
  }),
}

function buildLocationBodyFields(values: LocationFormValues): Record<string, unknown> {
  if (!values.kind) {
    return {
      name: values.name,
      description: values.description || undefined,
    }
  }

  return kindBodyFieldBuilders[values.kind](values)
}

const kindFormValueExtractors: Partial<
  Record<LocationKind, (entity: Location) => Partial<LocationFormValues>>
> = {
  plane: (entity) => (entity.kind === 'plane' ? { planeType: entity.planeType } : {}),
  region: (entity) =>
    entity.kind === 'region' && entity.classification
      ? {
          classification: {
            kind: entity.classification.kind,
            type: entity.classification.type,
          },
        }
      : {},
  settlement: (entity) =>
    entity.kind === 'settlement' ? { settlementType: entity.settlementType } : {},
  site: (entity) => (entity.kind === 'site' ? { siteType: entity.siteType } : {}),
  structure: (entity) =>
    entity.kind === 'structure'
      ? {
          structureType: entity.structureType,
          ...(entity.classification
            ? {
                classification: {
                  type: entity.classification.type,
                  ...('subtype' in entity.classification &&
                  typeof entity.classification.subtype === 'string'
                    ? { subtype: entity.classification.subtype }
                    : {}),
                },
              }
            : {}),
        }
      : {},
  interior: (entity) =>
    entity.kind === 'interior'
      ? {
          interiorType: entity.interiorType,
          ...(entity.classification
            ? { classification: { type: entity.classification.type } }
            : {}),
        }
      : {},
}

export function locationToFormValues(entity: Location): Partial<LocationFormValues> {
  return {
    name: entity.name,
    slug: entity.slug,
    description: entity.description,
    kind: entity.kind,
    parentLocationId: entity.parentLocationId,
    ...kindFormValueExtractors[entity.kind]?.(entity),
  }
}

export function buildLocationCreateInput(
  values: LocationFormValues,
  ctx?: ContentFormInputCtx<Location>,
  validationIntent: ContentValidationIntent = 'publish',
): CreateLocationInput {
  const schema =
    validationIntent === 'draft' ? createLocationDraftInputSchema : createLocationInputSchema

  const input = schema.parse({
    slug: slugForInputParse(values.name, ctx),
    ...buildLocationBodyFields(values),
  })

  return finalizeContentInput(input, ctx) as CreateLocationInput
}
