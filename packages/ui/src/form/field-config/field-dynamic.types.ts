import type { FieldLayoutRecommendation } from '../../components/ui/field-recommendation.types'

import type { FieldOption, SelectFieldOptionListItem } from './field-options'

export interface FieldDynamicHint {
  dependsOn: string[]
  hintWhen: (values: Record<string, unknown>) => string | undefined
}

/** Resolves suggestion strings from watched form values (e.g. archetype-driven vocab). */
export interface FieldDynamicSuggestions {
  dependsOn: readonly string[]
  suggestionsWhen: (values: Record<string, unknown>) => readonly string[]
}

/** Resolves option lists from watched form values. */
export interface FieldDynamicOptionSource<TOption> {
  dependsOn: readonly string[]
  optionsWhen: (values: Record<string, unknown>) => readonly TOption[]
}

/** Dynamic select options. Groups are preserved through the schema select renderer. */
export type FieldDynamicSelectOptions = FieldDynamicOptionSource<SelectFieldOptionListItem>

/** Dynamic combobox options. Combobox panels stay flat. */
export type FieldDynamicComboboxOptions = FieldDynamicOptionSource<FieldOption>

/** Unrestricted dimension — resolver skips undefined or absent keys. */
export type FilterDimensionValue = string | undefined

export type ActiveDimensionFilters = Readonly<Record<string, FilterDimensionValue>>

export interface ComboboxFilterDimensionConfig {
  /** Unique within the field; stable across `filterSelectsWhen` resolves. */
  filterKey: string
  ariaLabel: string
  /** Concrete dimension slugs only — the renderer injects the All menu item. */
  options: FieldOption[]
  defaultValue?: FilterDimensionValue
  allOptionLabel?: string
}

/** Resolves combobox panel dimension filter configs from watched form values. */
export interface FieldDynamicComboboxFilterSelects {
  dependsOn: readonly string[]
  filterSelectsWhen: (values: Record<string, unknown>) => readonly ComboboxFilterDimensionConfig[]
}

/** RHF helpers for schema-driven recommendation actions (append grants, etc.). */
export interface FieldRecommendationResolveContext {
  setValue: (
    name: string,
    value: unknown,
    options?: { shouldDirty?: boolean; shouldValidate?: boolean },
  ) => void
  getValues: (fieldName?: string) => unknown
}

/** Resolves field recommendations from watched form values. */
export interface FieldDynamicRecommendation {
  dependsOn: readonly string[]
  recommendationWhen: (
    values: Record<string, unknown>,
    ctx: FieldRecommendationResolveContext,
  ) => FieldLayoutRecommendation | null
}
