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
import {
  canonicalFieldsForAuthoringType,
  resolveLocationAuthoringType,
} from './location-authoring-type'
import type { LocationFormValues } from './location-form-fields'
import type { LocationFixedCreateContext } from './location-form-ctx'

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
  if (!classification?.archetype) return {}

  const result: {
    archetype: string
    specialization?: string
    functionOverride?: string
  } = {
    archetype: classification.archetype,
  }

  if (classification.specialization) {
    result.specialization = classification.specialization
  }
  if (classification.functionOverride) {
    result.functionOverride = classification.functionOverride
  }

  return { classification: result }
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
  structure: (values) => {
    const { structureType } = canonicalFieldsForAuthoringType(values.authoringType)
    return {
      ...sharedBodyFields(values),
      kind: 'structure',
      ...(structureType ? { structureType } : {}),
      ...(structureType === 'building' ? buildBuildingClassification(values) : {}),
    }
  },
  interior: (values) => ({
    ...sharedBodyFields(values),
    kind: 'interior',
    ...(values.interiorType ? { interiorType: values.interiorType } : {}),
    ...buildInteriorClassification(values),
  }),
}

function buildLocationBodyFields(values: LocationFormValues): Record<string, unknown> {
  if (!values.authoringType) {
    return {
      name: values.name,
      description: values.description || undefined,
    }
  }

  const { kind } = canonicalFieldsForAuthoringType(values.authoringType)
  return kindBodyFieldBuilders[kind](values)
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
    entity.kind === 'structure' && entity.classification
      ? {
          classification: {
            archetype: entity.classification.archetype,
            ...(entity.classification.specialization
              ? { specialization: entity.classification.specialization }
              : {}),
            ...(entity.classification.functionOverride
              ? { functionOverride: entity.classification.functionOverride }
              : {}),
          },
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
    authoringType: resolveLocationAuthoringType(entity),
    parentLocationId: entity.parentLocationId,
    ...kindFormValueExtractors[entity.kind]?.(entity),
  }
}

/** Overlays fixed create context onto form values immediately before serialization. */
export function applyLocationFixedCreateContext(
  values: LocationFormValues,
  fixedCreate: LocationFixedCreateContext,
): LocationFormValues {
  return {
    ...values,
    authoringType: fixedCreate.authoringType,
    parentLocationId: fixedCreate.parentLocationId,
  }
}

export function buildLocationCreateInput(
  values: LocationFormValues,
  ctx?: ContentFormInputCtx<Location>,
  validationIntent: ContentValidationIntent = 'publish',
): CreateLocationInput {
  const body = buildLocationBodyFields(values)
  const payload = {
    slug: slugForInputParse(values.name, ctx),
    ...body,
  }

  if (validationIntent === 'draft' && !('kind' in body)) {
    return finalizeContentInput(payload, ctx) as CreateLocationInput
  }

  const schema =
    validationIntent === 'draft' ? createLocationDraftInputSchema : createLocationInputSchema

  const input = schema.parse(payload)

  return finalizeContentInput(input, ctx) as CreateLocationInput
}
