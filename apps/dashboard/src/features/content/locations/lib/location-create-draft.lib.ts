import type { LocationFixedCreateContext } from './location-form-ctx'
import type { LocationFormValues } from './location-form-fields'
import { locationFormDef } from './location-form-def'
import { fixedCreateToInitialValues } from './location-create-shortcuts'

/** Stable signature for fixed-create form composition (fields + settlement districts). */
export function resolveLocationFixedCreateCompositionKey(
  fixedCreate: LocationFixedCreateContext,
): string {
  const classification = fixedCreate.classification
    ? `${fixedCreate.classification.kind}:${fixedCreate.classification.type}`
    : 'none'
  return [
    fixedCreate.authoringType,
    fixedCreate.parent?.locationId ?? 'overview',
    fixedCreate.settlementType ?? 'none',
    fixedCreate.siteType ?? 'none',
    classification,
  ].join('|')
}

const PRESERVED_DRAFT_FIELD_NAMES = ['name', 'description'] as const

/**
 * When setup changes alter composition, keep compatible authoring fields and
 * re-apply fixed/hidden values. Do not wipe the whole draft solely for reopening setup.
 */
export function mergeLocationCreateDraftForFixedCreate({
  currentValues,
  fixedCreate,
}: {
  currentValues: Partial<LocationFormValues>
  fixedCreate: LocationFixedCreateContext
}): LocationFormValues {
  const nextDefaults = {
    ...locationFormDef.createDefaultValues,
    ...fixedCreateToInitialValues(fixedCreate),
  } as LocationFormValues

  for (const fieldName of PRESERVED_DRAFT_FIELD_NAMES) {
    const value = currentValues[fieldName]
    if (value !== undefined) {
      ;(nextDefaults as Record<string, unknown>)[fieldName] = value
    }
  }

  return nextDefaults
}
