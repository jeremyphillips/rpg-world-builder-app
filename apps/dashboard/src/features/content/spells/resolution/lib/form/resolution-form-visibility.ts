import type { FieldVisibility } from '@rpg/ui/form'

import { RESOLUTION_FIELD_NAME } from './resolution-form-constants'

const RESOLUTION_METHOD_KIND_PATH = `${RESOLUTION_FIELD_NAME}.methodKind` as const
const RESOLUTION_SELECTION_MODE_PATH = `${RESOLUTION_FIELD_NAME}.selectionMode` as const
const RESOLUTION_PREFIX = RESOLUTION_FIELD_NAME

/** True when the spell form currently has a resolution slice (hydrated or added). */
export function isResolutionFormConfigured(values: Record<string, unknown>): boolean {
  const resolution = values[RESOLUTION_FIELD_NAME]
  if (resolution != null && typeof resolution === 'object') return true

  return (
    values[RESOLUTION_METHOD_KIND_PATH] != null || values[RESOLUTION_SELECTION_MODE_PATH] != null
  )
}

export function visibleWhenResolutionConfigured(): FieldVisibility {
  return {
    dependsOn: [RESOLUTION_FIELD_NAME, RESOLUTION_METHOD_KIND_PATH, RESOLUTION_SELECTION_MODE_PATH],
    visibleWhen: isResolutionFormConfigured,
  }
}

export function visibleWhenNoResolution(): FieldVisibility {
  return {
    dependsOn: [RESOLUTION_FIELD_NAME, RESOLUTION_METHOD_KIND_PATH, RESOLUTION_SELECTION_MODE_PATH],
    visibleWhen: (values) => !isResolutionFormConfigured(values),
  }
}

function readSelectionMode(values: Record<string, unknown>): string | undefined {
  const resolution = values[RESOLUTION_FIELD_NAME]
  if (resolution != null && typeof resolution === 'object' && 'selectionMode' in resolution) {
    return resolution.selectionMode as string
  }
  return values[RESOLUTION_SELECTION_MODE_PATH] as string | undefined
}

/** All visibility predicates must pass for the field to render. */
export function combineFieldVisibility(...visibilities: FieldVisibility[]): FieldVisibility {
  const dependsOn = Array.from(new Set(visibilities.flatMap((visibility) => visibility.dependsOn)))

  return {
    dependsOn,
    visibleWhen: (values) => visibilities.every((visibility) => visibility.visibleWhen(values)),
  }
}

export function visibleWhenSelectionMode(
  mode: 'self' | 'targets' | 'point' | 'none',
): FieldVisibility {
  return {
    dependsOn: [RESOLUTION_SELECTION_MODE_PATH, `${RESOLUTION_FIELD_NAME}.selectionMode`],
    visibleWhen: (values) => readSelectionMode(values) === mode,
  }
}

export function visibleWhenSelectionModeIsOneOf(
  ...modes: Array<'self' | 'targets' | 'point' | 'none'>
): FieldVisibility {
  return {
    dependsOn: [RESOLUTION_SELECTION_MODE_PATH, `${RESOLUTION_FIELD_NAME}.selectionMode`],
    visibleWhen: (values) => {
      const current = readSelectionMode(values)
      return current !== undefined && modes.includes(current as (typeof modes)[number])
    },
  }
}

export function visibleWhenResolutionHasAreaOfEffect(): FieldVisibility {
  return {
    dependsOn: [
      `${RESOLUTION_FIELD_NAME}.areaOfEffect.shape`,
      `${RESOLUTION_PREFIX}.areaOfEffect.shape`,
    ],
    visibleWhen: (values) => {
      const shape =
        values[`${RESOLUTION_FIELD_NAME}.areaOfEffect.shape`] ??
        values['resolution.areaOfEffect.shape']
      return typeof shape === 'string' && shape !== '' && shape !== 'none'
    },
  }
}

export function visibleWhenSelfWithoutArea(): FieldVisibility {
  return combineFieldVisibility(visibleWhenSelectionMode('self'), {
    dependsOn: [`${RESOLUTION_FIELD_NAME}.areaOfEffect.shape`],
    visibleWhen: (values) => {
      const shape = values[`${RESOLUTION_FIELD_NAME}.areaOfEffect.shape`]
      return !shape || shape === 'none'
    },
  })
}

export function visibleWhenSelfWithArea(): FieldVisibility {
  return combineFieldVisibility(
    visibleWhenSelectionMode('self'),
    visibleWhenResolutionHasAreaOfEffect(),
  )
}

export function visibleWhenAreaSelectionMode(): FieldVisibility {
  return combineFieldVisibility(
    visibleWhenSelectionModeIsOneOf('self', 'point'),
    visibleWhenResolutionHasAreaOfEffect(),
  )
}

export function visibleWhenTargetCountEditable(): FieldVisibility {
  return {
    dependsOn: [`${RESOLUTION_PREFIX}.targetCount`, RESOLUTION_SELECTION_MODE_PATH],
    visibleWhen: (values) => {
      if (readSelectionMode(values) !== 'targets') return false
      const count = values[`${RESOLUTION_PREFIX}.targetCount`]
      return typeof count === 'number' && count !== 1
    },
  }
}

export function visibleWhenCountKindEditable(): FieldVisibility {
  return visibleWhenTargetCountEditable()
}

export function visibleWhenProximityKind(kind: 'touch' | 'reach' | 'distance'): FieldVisibility {
  return combineFieldVisibility(visibleWhenSelectionMode('targets'), {
    dependsOn: [`${RESOLUTION_PREFIX}.proximityKind`],
    visibleWhen: (values) => values[`${RESOLUTION_PREFIX}.proximityKind`] === kind,
  })
}

export function visibleWhenApplicationPatternKind(kind: 'projectiles'): FieldVisibility {
  return {
    dependsOn: [`${RESOLUTION_PREFIX}.applicationPatternKind`],
    visibleWhen: (values) => values[`${RESOLUTION_PREFIX}.applicationPatternKind`] === kind,
  }
}

export function visibleWhenAreaShape(shapes: string[]): FieldVisibility {
  return combineFieldVisibility(visibleWhenSelectionModeIsOneOf('self', 'point'), {
    dependsOn: [`${RESOLUTION_PREFIX}.areaOfEffect.shape`],
    visibleWhen: (values) => {
      const shape = values[`${RESOLUTION_PREFIX}.areaOfEffect.shape`]
      return typeof shape === 'string' && shapes.includes(shape)
    },
  })
}
