import { cn } from '../lib/utils'
import {
  resolveFilterSelectSizerLabels,
  resolveFilterSelectValue,
  resolveSelectFieldOptions,
} from './filter-bar.lib'
import { FILTER_SELECT_ALL_VALUE, filterToolbarCappedSelectClasses } from './filter-bar.variants'
import type { FilterSelectFieldLayout } from './filter-select-field-chrome.client'
import type {
  FilterFieldId,
  FilterFieldOptionsContext,
  SelectFilterFieldDef,
} from './filter-schema.types'

export function resolveFilterSelectTriggerTitle(args: {
  showAllOption: boolean
  selectValue: string
  allLabel: string
  fallbackLabel: string
  options: readonly { value: string; label: string }[]
}): string {
  if (args.showAllOption && args.selectValue === FILTER_SELECT_ALL_VALUE) {
    return args.allLabel
  }

  return (
    args.options.find((option) => option.value === args.selectValue)?.label ?? args.fallbackLabel
  )
}

export function resolveFilterSelectTriggerClassName(
  layout: FilterSelectFieldLayout,
  widthClassName?: string,
): string {
  return cn(
    layout === 'inline' ? undefined : 'w-full',
    widthClassName,
    widthClassName ? filterToolbarCappedSelectClasses : undefined,
  )
}

export function resolveFilterSelectControlView<
  TData,
  TState extends Record<string, unknown>,
>(args: {
  field: SelectFilterFieldDef<TData, TState, FilterFieldId<TState>>
  state: TState
  optionsContext?: FilterFieldOptionsContext<TData, TState>
  widthClassName?: string
  effectiveValue: unknown
  layout: FilterSelectFieldLayout
}) {
  const { field } = args
  const resolvedContext = args.optionsContext ?? { state: args.state }
  const options = resolveSelectFieldOptions(field, resolvedContext)
  const fieldWithOptions = { ...field, options }
  const showAllOption = field.showAllOption ?? true
  const selectValue = resolveFilterSelectValue(
    fieldWithOptions,
    args.state[field.id],
    args.effectiveValue,
  )
  const allLabel = field.allOptionLabel ?? `All ${field.label}`

  return {
    options,
    fieldWithOptions,
    showAllOption,
    layout: args.layout,
    selectValue,
    triggerAriaLabel: field.triggerAriaLabel ?? field.label,
    sizingLabels: resolveFilterSelectSizerLabels({
      label: field.label,
      showAllOption,
      allOptionLabel: field.allOptionLabel,
      options,
    }),
    triggerTitle: resolveFilterSelectTriggerTitle({
      showAllOption,
      selectValue,
      allLabel,
      fallbackLabel: field.label,
      options,
    }),
    triggerClassName: resolveFilterSelectTriggerClassName(args.layout, args.widthClassName),
  }
}
