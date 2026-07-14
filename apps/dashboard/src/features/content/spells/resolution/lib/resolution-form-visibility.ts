import type { FieldVisibility } from '@rpg/ui/form'

import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

const RESOLUTION_METHOD_KIND_PATH = `${RESOLUTION_FIELD_NAME}.methodKind` as const

/** True when the spell form currently has a resolution slice (hydrated or added). */
export function isResolutionFormConfigured(values: Record<string, unknown>): boolean {
  const resolution = values[RESOLUTION_FIELD_NAME]
  if (resolution != null && typeof resolution === 'object') return true

  return values[RESOLUTION_METHOD_KIND_PATH] != null
}

export function visibleWhenResolutionConfigured(): FieldVisibility {
  return {
    dependsOn: [RESOLUTION_FIELD_NAME, RESOLUTION_METHOD_KIND_PATH],
    visibleWhen: isResolutionFormConfigured,
  }
}

export function visibleWhenNoResolution(): FieldVisibility {
  return {
    dependsOn: [RESOLUTION_FIELD_NAME, RESOLUTION_METHOD_KIND_PATH],
    visibleWhen: (values) => !isResolutionFormConfigured(values),
  }
}
