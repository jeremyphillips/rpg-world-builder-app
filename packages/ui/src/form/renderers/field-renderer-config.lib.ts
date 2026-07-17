/**
 * Pure helpers that prepare a `FieldConfig` for `FieldRenderer`.
 */
import type { FieldSize } from '../../components/ui/field.client'
import type { FieldConfig } from '../field-config'
import {
  applyOptionAvailabilityToFieldOptions,
  applyOptionAvailabilityToSelectOptions,
  resolveFieldHintPresentation,
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
}

/** Applies inherited size, dynamic hints, and option availability to a field config. */
export function resolveFieldRenderConfig(
  config: FieldConfig,
  inheritedSize: FieldSize,
  hintValues: Record<string, unknown>,
  optionValues: Record<string, unknown>,
): ResolvedFieldRenderConfig {
  const resolvedSize = resolveInheritedFieldSize({
    explicit: config.size,
    inherited: inheritedSize,
  })
  const hintPresentation = resolveFieldHintPresentation(config, hintValues)
  let renderConfig: FieldConfig = { ...config, size: resolvedSize }

  const optionAvailability =
    config.type === 'chips' || config.type === 'select' ? config.optionAvailability : undefined
  if (!optionAvailability) {
    return {
      config: renderConfig,
      hint: hintPresentation.text,
      hintPosition: hintPresentation.position,
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
      hint: hintPresentation.text,
      hintPosition: hintPresentation.position,
    }
  }

  if (config.type === 'select') {
    return {
      config: {
        ...renderConfig,
        options: applyOptionAvailabilityToSelectOptions(
          config.options,
          optionAvailability,
          optionValues,
        ),
      } as FieldConfig,
      hint: hintPresentation.text,
      hintPosition: hintPresentation.position,
    }
  }

  return {
    config: renderConfig,
    hint: hintPresentation.text,
    hintPosition: hintPresentation.position,
  }
}
