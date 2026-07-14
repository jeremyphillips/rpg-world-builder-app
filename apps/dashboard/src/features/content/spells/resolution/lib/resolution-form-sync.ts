import { applyResolutionStructuralCleanup } from '@rpg/contracts'
import type { FormValueSync } from '@rpg/ui/form'

import { resolutionFormToSelectionContext } from './resolution-selection-context.lib'
import type { ResolutionFormValues } from './resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

const RESOLUTION_SYNC_DEPENDS_ON = [`${RESOLUTION_FIELD_NAME}.proximityKind`] as const

function resolutionSlice(values: Record<string, unknown>): ResolutionFormValues | undefined {
  const resolution = values[RESOLUTION_FIELD_NAME]
  if (!resolution || typeof resolution !== 'object') return undefined
  return resolution as ResolutionFormValues
}

/** Structural cleanup for hidden dependent resolution fields — no semantic substitution. */
export function applyResolutionFormStructuralCleanup(
  values: Record<string, unknown>,
): Partial<Record<string, unknown>> | undefined {
  const resolution = resolutionSlice(values)
  const context = resolutionFormToSelectionContext(resolution)
  if (!context) return undefined

  const patch = applyResolutionStructuralCleanup(context)
  if (Object.keys(patch).length === 0) return undefined

  return {
    [RESOLUTION_FIELD_NAME]: {
      ...resolution,
      ...patch,
    },
  }
}

/** Pass to `<Form valueSyncs={…}>` on spell create/edit routes. */
export const resolutionFormValueSyncs: FormValueSync[] = [
  {
    dependsOn: [
      `${RESOLUTION_FIELD_NAME}.proximityKind`,
      `${RESOLUTION_FIELD_NAME}.methodKind`,
      `${RESOLUTION_FIELD_NAME}.attackType`,
      `${RESOLUTION_FIELD_NAME}.applicationPatternKind`,
    ],
    apply: (values, changedKeys) => {
      const resolutionKeys = [
        `${RESOLUTION_FIELD_NAME}.proximityKind`,
        `${RESOLUTION_FIELD_NAME}.methodKind`,
        `${RESOLUTION_FIELD_NAME}.attackType`,
        `${RESOLUTION_FIELD_NAME}.applicationPatternKind`,
      ]
      if (!changedKeys.some((key) => resolutionKeys.includes(key))) return undefined
      return applyResolutionFormStructuralCleanup(values)
    },
  },
]

export { RESOLUTION_SYNC_DEPENDS_ON }
