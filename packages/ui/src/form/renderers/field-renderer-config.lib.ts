/**
 * Pure helpers that prepare a `FieldConfig` for `FieldRenderer`.
 */
import type { FieldSize } from '../../components/ui/field.client'
import type { FieldConfig, FieldDerivedMeta, JoinedPairFieldConfig } from '../field-config'
import { resolveFieldConfigPrimaryName } from '../field-config'
import {
  applyOptionAvailabilityToFieldOptions,
  applyOptionAvailabilityToSelectOptions,
  resolveFieldHintPresentation,
  resolveSelectFieldConfigOptions,
} from '../field-config'
import type { FormDensity } from '../form-density'
import { resolveFieldControlSize } from '../resolve-field-control-size.lib'

export function buildFieldRendererIds(
  config: FieldConfig,
  idPrefix: string,
  namePrefix?: string,
): { fullName: string; id: string } {
  const primaryName = resolveFieldConfigPrimaryName(config)
  const fullName = namePrefix ? `${namePrefix}.${primaryName}` : primaryName
  return {
    fullName,
    id: `${idPrefix}-${fullName.replaceAll('.', '-')}`,
  }
}

/** Primary bound path and control ids for standalone joinedPair fields (no wrapper `name`). */
export function buildJoinedPairRendererIds(
  config: JoinedPairFieldConfig,
  idPrefix: string,
  namePrefix?: string,
): { fullName: string; id: string; boundNames: string[] } {
  const idSegment = config.controlId ?? config.start.name
  const boundNames =
    config.end.kind === 'select' ? [config.start.name, config.end.name] : [config.start.name]
  const primaryName = config.start.name
  const fullName = namePrefix ? `${namePrefix}.${primaryName}` : primaryName
  const id = namePrefix
    ? `${idPrefix}-${namePrefix.replaceAll('.', '-')}-${idSegment}`
    : `${idPrefix}-${idSegment}`

  return { fullName, id, boundNames }
}

export interface ResolvedFieldRenderConfig {
  config: FieldConfig
  controlSize: FieldSize
  hint?: string
  hintPosition: ReturnType<typeof resolveFieldHintPresentation>['position']
  derivedMeta?: FieldDerivedMeta
  derivedMetaReserveSpace?: boolean
}

function resolveDerivedMetaPresentation(
  config: FieldConfig,
  values: Record<string, unknown>,
): Pick<ResolvedFieldRenderConfig, 'derivedMeta' | 'derivedMetaReserveSpace'> {
  const derivedMetaConfig = config.derivedMeta
  if (!derivedMetaConfig) return {}

  return {
    derivedMeta: derivedMetaConfig.metaWhen(values),
    derivedMetaReserveSpace: derivedMetaConfig.reserveSpace,
  }
}

/** Applies inherited density, dynamic hints, derived metadata, and option availability to a field config. */
export function resolveFieldRenderConfig(
  config: FieldConfig,
  density: FormDensity,
  dynamicValues: Record<string, unknown>,
  optionValues: Record<string, unknown>,
): ResolvedFieldRenderConfig {
  const controlSize = resolveFieldControlSize({
    density,
    override: config.controlSizeOverride,
  })
  const hintPresentation = resolveFieldHintPresentation(config, dynamicValues)
  const derivedMetaPresentation = resolveDerivedMetaPresentation(config, dynamicValues)

  const basePresentation = {
    controlSize,
    hint: hintPresentation.text,
    hintPosition: hintPresentation.position,
    ...derivedMetaPresentation,
  }

  const optionAvailability =
    config.type === 'chips' || config.type === 'select' ? config.optionAvailability : undefined

  if (config.type === 'select') {
    const options = resolveSelectFieldConfigOptions(config, dynamicValues)
    const resolvedOptions = optionAvailability
      ? applyOptionAvailabilityToSelectOptions(options, optionAvailability, optionValues)
      : options

    return {
      config: {
        ...config,
        options: resolvedOptions,
      } as FieldConfig,
      ...basePresentation,
    }
  }

  if (!optionAvailability) {
    return {
      config,
      ...basePresentation,
    }
  }

  if (config.type === 'chips') {
    return {
      config: {
        ...config,
        options: applyOptionAvailabilityToFieldOptions(
          config.options,
          optionAvailability,
          optionValues,
        ),
      } as FieldConfig,
      ...basePresentation,
    }
  }

  return {
    config,
    ...basePresentation,
  }
}
