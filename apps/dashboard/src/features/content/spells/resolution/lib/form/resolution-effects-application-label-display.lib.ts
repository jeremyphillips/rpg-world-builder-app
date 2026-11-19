import { formatResolutionEffectsApplicationLabel } from '@rpg/contracts'
import type { DisplayConfig } from '@rpg/ui/form'

import { applicationPatternFromForm } from '../application-pattern/resolution-application-pattern.lib'
import type { ResolutionFormValues } from './resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from './resolution-form-constants'

const RESOLUTION_APPLICATION_PATTERN_DEPS = [
  `${RESOLUTION_FIELD_NAME}.applicationPatternKind`,
  `${RESOLUTION_FIELD_NAME}.projectileCount`,
  `${RESOLUTION_FIELD_NAME}.projectileUnitLabelSingular`,
  `${RESOLUTION_FIELD_NAME}.projectileUnitLabelPlural`,
] as const

function resolutionSliceFromDependsOn(
  values: Record<string, unknown>,
): ResolutionFormValues | undefined {
  const patternKind = values[`${RESOLUTION_FIELD_NAME}.applicationPatternKind`]
  if (patternKind === undefined) return undefined
  return {
    applicationPatternKind: patternKind as ResolutionFormValues['applicationPatternKind'],
    projectileCount: values[`${RESOLUTION_FIELD_NAME}.projectileCount`] as number | undefined,
    projectileUnitLabelSingular: values[`${RESOLUTION_FIELD_NAME}.projectileUnitLabelSingular`] as
      | string
      | undefined,
    projectileUnitLabelPlural: values[`${RESOLUTION_FIELD_NAME}.projectileUnitLabelPlural`] as
      | string
      | undefined,
  } as ResolutionFormValues
}

export function resolutionEffectsApplicationLabelDisplay(): DisplayConfig {
  return {
    kind: 'display',
    id: 'resolution-effects-application-label',
    resolve: {
      dependsOn: RESOLUTION_APPLICATION_PATTERN_DEPS,
      contentWhen: (values) => {
        const resolution = resolutionSliceFromDependsOn(values)
        if (!resolution) return undefined
        return {
          variant: 'text',
          text: formatResolutionEffectsApplicationLabel({
            applicationPattern: applicationPatternFromForm(resolution),
          }),
          role: 'supporting',
        }
      },
    },
  }
}
