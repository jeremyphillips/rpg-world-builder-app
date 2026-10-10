import { withFloatingLabelSizingLabel } from '../components/ui/floating-label-field.lib'
import {
  UI_FIELD_CONTROL_TRIGGER_FILL_CLASS,
  UI_FIELD_CONTROL_TRIGGER_FIT_CLASS,
} from '../components/ui/field-control.styles'
import { cn } from '../lib/utils'
import {
  resolveFilterSelectSizerLabels,
  resolveFilterSelectValue,
  resolveSelectFieldOptions,
} from './filter-bar.lib'
import { FILTER_SELECT_ALL_TRIGGER_LABEL, FILTER_SELECT_ALL_VALUE } from './filter-bar.variants'
import type { FilterSelectFieldLayout } from './filter-select-field-chrome.client'
import type {
  FilterFieldId,
  FilterFieldOptionsContext,
  SelectFilterFieldDef,
} from './filter-schema.types'

export function resolveFilterSelectTriggerContent(args: {
  layout: FilterSelectFieldLayout
  showAllOption: boolean
  selectValue: string
}): string | undefined {
  if (
    args.layout === 'floating' &&
    args.showAllOption &&
    args.selectValue === FILTER_SELECT_ALL_VALUE
  ) {
    return FILTER_SELECT_ALL_TRIGGER_LABEL
  }
  return undefined
}

export function resolveFilterSelectSizingLabels(args: {
  layout: FilterSelectFieldLayout
  label: string
  showAllOption: boolean
  allOptionLabel?: string
  options: readonly { label: string }[]
}): string[] {
  if (args.layout !== 'floating') {
    return resolveFilterSelectSizerLabels({
      label: args.label,
      showAllOption: args.showAllOption,
      allOptionLabel: args.allOptionLabel,
      options: args.options,
    })
  }

  const labels = args.options.map((option) => option.label)
  if (args.showAllOption) labels.unshift(FILTER_SELECT_ALL_TRIGGER_LABEL)
  return withFloatingLabelSizingLabel(args.label, [...new Set(labels)])
}

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

/** Flow modifier only — width lives on the chrome width owner, not the trigger. */
export function resolveFilterSelectTriggerClassName(layout: FilterSelectFieldLayout): string {
  if (layout === 'inline' || layout === 'floating') {
    return UI_FIELD_CONTROL_TRIGGER_FIT_CLASS
  }

  return UI_FIELD_CONTROL_TRIGGER_FILL_CLASS
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
    triggerContent: resolveFilterSelectTriggerContent({
      layout: args.layout,
      showAllOption,
      selectValue,
    }),
    triggerAriaLabel:
      args.layout === 'floating' ? undefined : (field.triggerAriaLabel ?? field.label),
    sizingLabels: resolveFilterSelectSizingLabels({
      layout: args.layout,
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
    triggerClassName: cn(resolveFilterSelectTriggerClassName(args.layout)),
  }
}
