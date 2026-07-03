/**
 * Pure helpers that prepare a `FieldConfig` for `FieldRenderer`.
 *
 * Builds stable RHF field names and DOM ids (including nested array prefixes),
 * then resolves inherited size, dynamic hints, and option-availability filters
 * before the renderer chooses a specialized or standard field path.
 */
import type { FieldSize } from '../../components/ui/field.client'
import type { FieldConfig } from '../field-config'
import {
  applyOptionAvailabilityToFieldOptions,
  applyOptionAvailabilityToSelectOptions,
  resolveFieldHint,
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

/** Applies inherited size, dynamic hints, and option availability to a field config. */
export function resolveFieldRenderConfig(
  config: FieldConfig,
  inheritedSize: FieldSize,
  hintValues: Record<string, unknown>,
  optionValues: Record<string, unknown>,
): FieldConfig {
  const resolvedSize = resolveInheritedFieldSize({
    explicit: config.size,
    inherited: inheritedSize,
  })
  let renderConfig: FieldConfig = { ...config, size: resolvedSize }
  const resolvedHint = resolveFieldHint(config, hintValues)

  if (resolvedHint !== config.hint) {
    renderConfig = { ...renderConfig, hint: resolvedHint }
  }

  const optionAvailability =
    config.type === 'chips' || config.type === 'select' ? config.optionAvailability : undefined
  if (!optionAvailability) return renderConfig

  if (config.type === 'chips') {
    return {
      ...renderConfig,
      options: applyOptionAvailabilityToFieldOptions(
        config.options,
        optionAvailability,
        optionValues,
      ),
    } as FieldConfig
  }

  if (config.type === 'select') {
    return {
      ...renderConfig,
      options: applyOptionAvailabilityToSelectOptions(
        config.options,
        optionAvailability,
        optionValues,
      ),
    } as FieldConfig
  }

  return renderConfig
}
