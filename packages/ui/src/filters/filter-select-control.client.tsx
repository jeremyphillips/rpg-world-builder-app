'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.client'
import { getEffectiveFilterValue } from './filter-engine'
import {
  normalizeFilterSelectChange,
  resolveFilterSelectValue,
  resolveSelectCurrentValue,
  resolveSelectFieldOptions,
} from './filter-bar.lib'
import { FILTER_SELECT_ALL_VALUE } from './filter-bar.variants'
import {
  FilterSelectFieldChrome,
  resolveFilterSelectFieldLayout,
} from './filter-select-field-chrome.client'
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
  const resolvedContext = optionsContext ?? { state }
  const options = resolveSelectFieldOptions(selectField, resolvedContext)
  const fieldWithOptions = { ...selectField, options }
  const showAllOption = selectField.showAllOption ?? true
  const triggerAriaLabel = selectField.triggerAriaLabel ?? selectField.label
  const layout = resolveFilterSelectFieldLayout(selectField)

  const handleValueChange = (nextValue: string) => {
    const normalized = normalizeFilterSelectChange(fieldWithOptions, nextValue) as
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
      layout={layout}
      presentation={presentation}
      controlId={controlId}
      label={selectField.label}
      ariaLabel={selectField.ariaLabel}
      widthClassName={widthClassName}
    >
      <Select
        value={resolveFilterSelectValue(fieldWithOptions, rawValue, effectiveValue)}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={controlId}
          aria-label={triggerAriaLabel}
          size={presentation.controlSize}
          className="w-full"
        >
          <SelectValue placeholder={selectField.label} />
        </SelectTrigger>
        <SelectContent>
          {showAllOption ? (
            <SelectItem value={FILTER_SELECT_ALL_VALUE}>
              {selectField.allOptionLabel ?? `All ${selectField.label}`}
            </SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterSelectFieldChrome>
  )
}
