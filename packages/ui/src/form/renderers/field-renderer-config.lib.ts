/**
 * Pure helpers that prepare a `FieldConfig` for `FieldRenderer`.
 */
import type { FieldSize } from '../../components/ui/field.client'
import type { FieldConfig, FieldDerivedMeta } from '../field-config'
import {
  applyOptionAvailabilityToFieldOptions,
  applyOptionAvailabilityToSelectOptions,
  resolveFieldHintPresentation,
  resolveSelectFieldConfigOptions,
} from '../field-config'
import { resolveInheritedFieldSize } from '../../components/ui/field.variants'

export function buildFieldRendererIds(
  config: FieldConfig,
  idPrefix: string,
  namePrefix?: string,
): { fullName: string; id: string } {
  const fullName = namePrefix ? `${namePrefix}.${config.name}` : config.name
  return {
    fullName,
    id: `${idPrefix}-${fullName.replaceAll('.', '-')}`,
  }
}

export interface ResolvedFieldRenderConfig {
  config: FieldConfig
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

/** Applies inherited size, dynamic hints, derived metadata, and option availability to a field config. */
export function resolveFieldRenderConfig(
  config: FieldConfig,
  inheritedSize: FieldSize,
  dynamicValues: Record<string, unknown>,
  optionValues: Record<string, unknown>,
): ResolvedFieldRenderConfig {
  const resolvedSize = resolveInheritedFieldSize({
    explicit: config.size,
    inherited: inheritedSize,
  })
  const hintPresentation = resolveFieldHintPresentation(config, dynamicValues)
  const derivedMetaPresentation = resolveDerivedMetaPresentation(config, dynamicValues)
  let renderConfig: FieldConfig = { ...config, size: resolvedSize }

  const basePresentation = {
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
        ...renderConfig,
        options: resolvedOptions,
      } as FieldConfig,
      ...basePresentation,
    }
  }

  if (!optionAvailability) {
    return {
      config: renderConfig,
      ...basePresentation,
    }
  }

  if (config.type === 'chips') {
    return {
      config: {
        ...renderConfig,
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
    config: renderConfig,
    ...basePresentation,
  }
}
