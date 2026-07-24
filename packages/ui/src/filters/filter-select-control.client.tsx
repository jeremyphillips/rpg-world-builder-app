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
  resolveFilterControlSize,
  resolveFilterSelectValue,
  resolveSelectFieldOptions,
  shouldSkipFilterSelectChange,
} from './filter-bar.lib'
import { FILTER_SELECT_ALL_VALUE, FILTER_DENSITY_DEFAULT } from './filter-bar.variants'
import {
  FilterSelectFieldChrome,
  resolveFilterSelectFieldLayout,
} from './filter-select-field-chrome.client'
import type {
  FilterDensity,
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
  density?: FilterDensity
  disabled?: boolean
  onValueChange: (
    id: FilterFieldId<TState>,
    value: TState[FilterFieldId<TState>] | undefined,
  ) => void
  /** Skips redundant onValueChange when normalized value is unchanged (overview filters). */
  guardDuplicateChanges?: boolean
}

export function FilterSelectControl<TData, TState extends Record<string, unknown>>({
  field: selectField,
  controlId,
  schema,
  state,
  optionsContext,
  density = FILTER_DENSITY_DEFAULT,
  disabled,
  onValueChange,
  guardDuplicateChanges = false,
}: FilterSelectControlProps<TData, TState>) {
  const rawValue = state[selectField.id]
  const effectiveValue = getEffectiveFilterValue(schema, state, selectField.id)
  const resolvedContext = optionsContext ?? { state }
  const options = resolveSelectFieldOptions(selectField, resolvedContext)
  const fieldWithOptions = { ...selectField, options }
  const showAllOption = selectField.showAllOption ?? true
  const triggerAriaLabel = selectField.triggerAriaLabel ?? selectField.label
  const controlSize = resolveFilterControlSize(density)

  const handleValueChange = (nextValue: string) => {
    const normalized = normalizeFilterSelectChange(fieldWithOptions, nextValue) as
      | TState[typeof selectField.id]
      | undefined

    if (
      guardDuplicateChanges &&
      shouldSkipFilterSelectChange(normalized, rawValue, effectiveValue)
    ) {
      return
    }

    onValueChange(selectField.id, normalized)
  }

  return (
    <FilterSelectFieldChrome
      layout={resolveFilterSelectFieldLayout(selectField)}
      density={density}
      controlId={controlId}
      label={selectField.label}
      ariaLabel={selectField.ariaLabel}
      width={selectField.width}
    >
      <Select
        value={resolveFilterSelectValue(fieldWithOptions, rawValue, effectiveValue)}
        onValueChange={handleValueChange}
        disabled={disabled}
      >
        <SelectTrigger
          id={controlId}
          aria-label={triggerAriaLabel}
          size={controlSize}
          className="w-full"
        >
          <SelectValue placeholder={selectField.label} />
        </SelectTrigger>
        <SelectContent>
          {showAllOption ? (
            <SelectItem value={FILTER_SELECT_ALL_VALUE}>All {selectField.label}</SelectItem>
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
