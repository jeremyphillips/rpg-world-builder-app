import { normalizeFieldHint } from './field-hint.lib'
import type { BaseFieldConfig, OptionalDisclosureConfig } from './field-base.types'
import type { FieldConfig } from './field-config.types'
import type { ComboboxFieldConfig } from './choice-fields.types'
import type { InlineSentenceFieldConfig } from './composite-fields.types'
import type { EditableGridColumnConfig } from './composite-fields.types'
import type {
  FieldDynamicComboboxFilterSelects,
  FieldDynamicRecommendation,
} from './field-dynamic.types'
import type { FieldInteractivity } from './field-visibility'
import type { SelectFieldOptionListItem } from './field-options'
import type {
  JoinedPairEndOccupantConfig,
  JoinedPairStartOccupantConfig,
} from '../../components/ui/joined-pair-field.types'
import type { DependentConfig } from './form-item.types'
import type { FieldVisibility } from './field-visibility'

/** Names every column-level `useWatch` subscription for an editable grid field. */
export function editableGridDependsOn(columns: EditableGridColumnConfig[]): string[] {
  const deps = new Set<string>()
  for (const column of columns) {
    column.visibility?.dependsOn.forEach((name) => deps.add(name))
    if (typeof column.label === 'function') {
      const labelDeps = column.labelDependsOn ?? column.visibility?.dependsOn ?? []
      labelDeps.forEach((name) => deps.add(name))
    }
  }
  return [...deps]
}
function comboboxFilterDependsOn(field: {
  type?: FieldConfig['type']
  filterSelectsResolve?: FieldDynamicComboboxFilterSelects
}): readonly string[] {
  if (field.type !== 'combobox') return []
  return field.filterSelectsResolve?.dependsOn ?? []
}

function comboboxRecommendationDependsOn(field: {
  type?: FieldConfig['type']
  recommendationResolve?: FieldDynamicRecommendation
}): readonly string[] {
  if (field.type !== 'combobox') return []
  return field.recommendationResolve?.dependsOn ?? []
}

function joinedPairSelectOptionsResolveDependsOn(field: {
  type?: FieldConfig['type']
  start?: JoinedPairStartOccupantConfig
  end?: JoinedPairEndOccupantConfig
}): readonly string[] {
  if (field.type !== 'joinedPair') return []
  const names: string[] = []
  if (field.start?.kind === 'select' && field.start.optionsResolve) {
    names.push(...field.start.optionsResolve.dependsOn)
  }
  if (field.end?.kind === 'select' && field.end.optionsResolve) {
    names.push(...field.end.optionsResolve.dependsOn)
  }
  return names
}

function selectFieldOptionsResolveDependsOn(field: {
  type?: FieldConfig['type']
  optionsResolve?: { dependsOn: readonly string[] }
}): readonly string[] {
  if (
    (field.type === 'select' || field.type === 'inlineSentence' || field.type === 'combobox') &&
    field.optionsResolve
  ) {
    return field.optionsResolve.dependsOn
  }
  return []
}

/** Collects watched field names for dynamic hint, derived metadata, and select options resolution. */
export function collectFieldDynamicDependsOn(field: {
  hint?: BaseFieldConfig['hint']
  derivedMeta?: BaseFieldConfig['derivedMeta']
  interactivity?: FieldInteractivity
  type?: FieldConfig['type']
  optionsResolve?: { dependsOn: readonly string[] }
  start?: JoinedPairStartOccupantConfig
  end?: JoinedPairEndOccupantConfig
  optionalDisclosure?: OptionalDisclosureConfig
  filterSelectsResolve?: FieldDynamicComboboxFilterSelects
  recommendationResolve?: FieldDynamicRecommendation
}): readonly string[] {
  return [
    ...new Set([
      ...(normalizeFieldHint(field.hint).resolve?.dependsOn ?? []),
      ...(field.derivedMeta?.dependsOn ?? []),
      ...selectFieldOptionsResolveDependsOn(field),
      ...joinedPairSelectOptionsResolveDependsOn(field),
      ...(field.optionalDisclosure?.addGate?.dependsOn ?? []),
      ...comboboxFilterDependsOn(field),
      ...comboboxRecommendationDependsOn(field),
      ...(field.interactivity?.dependsOn ?? []),
    ]),
  ]
}

/** Resolves a combobox field's option list and category filter, applying dynamic resolution when configured. */
export function resolveComboboxFieldConfig(
  config: ComboboxFieldConfig,
  values: Record<string, unknown>,
): ComboboxFieldConfig {
  const options = config.optionsResolve
    ? [...config.optionsResolve.optionsWhen(values)]
    : (config.options ?? [])
  const filterSelects = config.filterSelectsResolve
    ? config.filterSelectsResolve.filterSelectsWhen(values)
    : config.filterSelects

  return {
    ...config,
    options,
    filterSelects,
  }
}

/** Resolves inline-sentence select options, applying dynamic resolution when configured. */
export function resolveInlineSentenceSelectSegmentOptions(
  config: InlineSentenceFieldConfig,
  segmentName: string,
  values: Record<string, unknown>,
  staticOptions: SelectFieldOptionListItem[],
): SelectFieldOptionListItem[] {
  if (config.optionsResolve && segmentName === config.name) {
    return [...config.optionsResolve.optionsWhen(values)]
  }
  return staticOptions
}
/**
 * Resolves the visibility gate for dependent fields.
 * Switch controllers auto-gate on truthy when `dependents.visibility` is omitted.
 */
export function resolveDependentsVisibility(
  dependent: Pick<DependentConfig, 'dependents'>,
  controller: FieldConfig | undefined,
): FieldVisibility | null {
  if (dependent.dependents.visibility) {
    return dependent.dependents.visibility
  }
  if (!controller) {
    return null
  }
  if (controller.type === 'switch') {
    return {
      dependsOn: [controller.name],
      visibleWhen: (values) => values[controller.name] === true,
    }
  }
  return null
}
