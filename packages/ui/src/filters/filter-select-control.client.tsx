'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.client'
import { getEffectiveFilterValue } from './filter-engine'
import { normalizeFilterSelectChange, resolveSelectCurrentValue } from './filter-bar.lib'
import { FILTER_SELECT_ALL_VALUE } from './filter-bar.variants'
import {
  FilterSelectFieldChrome,
  resolveFilterSelectFieldLayout,
} from './filter-select-field-chrome.client'
import { resolveFilterSelectControlView } from './filter-select-control.lib'
import type { FilterFieldPresentation } from './filter-presentation.lib'
import type {
  FilterFieldId,
  FilterFieldOptionsContext,
  FilterSchema,
  SelectFilterFieldDef,
} from './filter-schema.types'

type FilterSelectControlProps<TData, TState extends Record<string, unknown>> = {
  field: SelectFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  schema: FilterSchema<TData, TState>
  state: TState
  optionsContext?: FilterFieldOptionsContext<TData, TState>
  presentation: Extract<FilterFieldPresentation, { type: 'select' }>
  widthClassName?: string
  disabled?: boolean
  onValueChange: (
    id: FilterFieldId<TState>,
    value: TState[FilterFieldId<TState>] | undefined,
  ) => void
}

export function FilterSelectControl<TData, TState extends Record<string, unknown>>({
  field: selectField,
  controlId,
  schema,
  state,
  optionsContext,
  presentation,
  widthClassName,
  disabled,
  onValueChange,
}: FilterSelectControlProps<TData, TState>) {
  const rawValue = state[selectField.id]
  const effectiveValue = getEffectiveFilterValue(schema, state, selectField.id)
  const view = resolveFilterSelectControlView({
    field: selectField,
    state,
    optionsContext,
    widthClassName,
    effectiveValue,
    layout: resolveFilterSelectFieldLayout(selectField),
  })

  const handleValueChange = (nextValue: string) => {
    const normalized = normalizeFilterSelectChange(view.fieldWithOptions, nextValue) as
      | TState[typeof selectField.id]
      | undefined

    const currentValue = resolveSelectCurrentValue(rawValue, effectiveValue)
    if (Object.is(normalized, currentValue)) {
      return
    }

    onValueChange(selectField.id, normalized)
  }

  return (
    <FilterSelectFieldChrome
      layout={view.layout}
      presentation={presentation}
      controlId={controlId}
      label={selectField.label}
      ariaLabel={selectField.ariaLabel}
      widthClassName={widthClassName}
    >
      <Select value={view.selectValue} onValueChange={handleValueChange} disabled={disabled}>
        <SelectTrigger
          id={controlId}
          aria-label={view.triggerAriaLabel}
          title={view.triggerTitle}
          size={presentation.controlSize}
          sizingLabels={view.sizingLabels}
          className={view.triggerClassName}
        >
          <SelectValue placeholder={selectField.label} />
        </SelectTrigger>
        <SelectContent>
          {view.showAllOption ? (
            <SelectItem value={FILTER_SELECT_ALL_VALUE}>
              {selectField.allOptionLabel ?? `All ${selectField.label}`}
            </SelectItem>
          ) : null}
          {view.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterSelectFieldChrome>
  )
}
