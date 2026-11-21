/**
 * Pure helpers that prepare a `FieldConfig` for `FieldRenderer`.
 */
import type { FieldSize } from '../../components/ui/field.client'
import type {
  FieldConfig,
  FieldDerivedMeta,
  JoinedPairFieldConfig,
  TextSuggestionsFieldConfig,
} from '../field-config'
import { resolveFieldConfigPrimaryName } from '../field-config'
import { resolveFieldCopyContext } from '../config/field-copy-context.lib'
import { resolveFieldInstruction } from '../config/field-instruction.lib'
import { resolveRowAwareFieldHintPresentation } from '../config/resolve-row-field-hint.lib'
import {
  applyOptionAvailabilityToFieldOptions,
  applyOptionAvailabilityToSelectOptions,
  resolveFieldHintPresentation,
  resolveChipsFieldConfigOptions,
  resolveComboboxFieldConfig,
  resolveSelectFieldConfigOptions,
} from '../field-config'
import { resolveFormDensity, type FormDensity } from '../form-density'
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

export type FormSectionFieldSizing = {
  density: FormDensity
  defaultControlSize?: FieldSize
}

export interface ResolvedFieldRenderConfig {
  config: FieldConfig
  presentationSize: FieldSize
  controlSize: FieldSize
  hint?: string
  hintPosition: ReturnType<typeof resolveFieldHintPresentation>['position']
  hintIcon?: ReturnType<typeof resolveFieldHintPresentation>['icon']
  derivedMeta?: FieldDerivedMeta
  derivedMetaReserveSpace?: boolean
  /** Text-suggestion strings resolved from `suggestions.suggestionsWhen`. */
  resolvedSuggestions?: readonly string[]
}

function resolveTextSuggestions(
  config: TextSuggestionsFieldConfig,
  values: Record<string, unknown>,
): readonly string[] {
  return config.suggestions.suggestionsWhen(values)
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

export type ResolveFieldRenderConfigOptions = {
  inAnatomyRow?: boolean
}

/** Applies inherited density, dynamic hints, derived metadata, and option availability to a field config. */
// fallow-ignore-next-line complexity
export function resolveFieldRenderConfig(
  config: FieldConfig,
  sectionSizing: FormSectionFieldSizing,
  dynamicValues: Record<string, unknown>,
  optionValues: Record<string, unknown>,
  options: ResolveFieldRenderConfigOptions = {},
): ResolvedFieldRenderConfig {
  const presentationSize = resolveFormDensity(sectionSizing.density).size
  const controlSize = resolveFieldControlSize({
    density: sectionSizing.density,
    defaultControlSize: sectionSizing.defaultControlSize,
    override: config.controlSizeOverride,
  })
  const hintPresentation = options.inAnatomyRow
    ? resolveRowAwareFieldHintPresentation(config, dynamicValues, true)
    : resolveFieldHintPresentation(config, dynamicValues)
  const derivedMetaPresentation = resolveDerivedMetaPresentation(config, dynamicValues)
  const resolvedHint =
    hintPresentation.text ?? resolveFieldInstruction(resolveFieldCopyContext(config))

  const basePresentation = {
    presentationSize,
    controlSize,
    hint: resolvedHint,
    hintPosition: hintPresentation.position,
    hintIcon: hintPresentation.text ? hintPresentation.icon : undefined,
    ...derivedMetaPresentation,
  }

  const optionAvailability =
    config.type === 'chips' || config.type === 'select' || config.type === 'combobox'
      ? config.optionAvailability
      : undefined

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

  if (config.type === 'combobox') {
    const resolved = resolveComboboxFieldConfig(config, dynamicValues)
    const resolvedOptions = optionAvailability
      ? applyOptionAvailabilityToFieldOptions(
          resolved.options ?? [],
          optionAvailability,
          optionValues,
        )
      : resolved.options

    return {
      config: {
        ...resolved,
        ...(resolvedOptions !== undefined ? { options: resolvedOptions } : {}),
      } as FieldConfig,
      ...basePresentation,
    }
  }

  if (config.type === 'textSuggestions') {
    return {
      config,
      ...basePresentation,
      resolvedSuggestions: resolveTextSuggestions(config, dynamicValues),
    }
  }

  if (config.type === 'chips') {
    let options = resolveChipsFieldConfigOptions(config, dynamicValues)
    if (optionAvailability) {
      options = applyOptionAvailabilityToFieldOptions(options, optionAvailability, optionValues)
    }
    return {
      config: {
        ...config,
        options,
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

  return {
    config,
    ...basePresentation,
  }
}
