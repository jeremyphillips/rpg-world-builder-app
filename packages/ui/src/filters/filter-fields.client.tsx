'use client'

import { useId } from 'react'

import { Checkbox } from '../components/ui/checkbox.client'
import { Input } from '../components/ui/input.client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.client'
import { getEffectiveFilterValue } from './filter-engine'
import {
  isFilterFieldDisabled,
  isFilterFieldVisible,
  normalizeFilterSelectChange,
  resolveFilterSelectValue,
} from './filter-bar.lib'
import { FILTER_SELECT_ALL_VALUE, filterBarControlVariants } from './filter-bar.variants'
import type {
  BooleanFilterFieldDef,
  FilterFieldDef,
  FilterFieldId,
  FilterSchema,
  SelectFilterFieldDef,
  TextFilterFieldDef,
} from './filter-schema.types'

type FilterFieldRendererProps<TData, TState extends Record<string, unknown>> = {
  field: FilterFieldDef<TData, TState>
  controlId: string
  schema: FilterSchema<TData, TState>
  state: TState
  disabled?: boolean
  onValueChange: (
    id: FilterFieldId<TState>,
    value: TState[FilterFieldId<TState>] | undefined,
  ) => void
}

function FilterTextField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  state,
  disabled,
  onValueChange,
}: {
  field: TextFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  state: TState
  disabled?: boolean
  onValueChange: FilterFieldRendererProps<TData, TState>['onValueChange']
}) {
  const textField = field
  const rawValue = state[textField.id]
  const textValue = typeof rawValue === 'string' ? rawValue : ''

  return (
    <div className={filterBarControlVariants({ type: 'text' })}>
      <Input
        id={controlId}
        placeholder={textField.placeholder ?? `Filter ${textField.label}…`}
        value={textValue}
        onChange={(event) => {
          onValueChange(
            textField.id,
            (event.target.value ? event.target.value : undefined) as
              | TState[typeof textField.id]
              | undefined,
          )
        }}
        aria-label={textField.label}
        size="sm"
        disabled={disabled}
      />
    </div>
  )
}

function FilterSelectField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  schema,
  state,
  disabled,
  onValueChange,
}: {
  field: SelectFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  schema: FilterSchema<TData, TState>
  state: TState
  disabled?: boolean
  onValueChange: FilterFieldRendererProps<TData, TState>['onValueChange']
}) {
  const selectField = field
  const rawValue = state[selectField.id]
  const effectiveValue = getEffectiveFilterValue(schema, state, selectField.id)
  const showAllOption = selectField.showAllOption ?? true

  return (
    <div className={filterBarControlVariants({ type: 'select' })}>
      <Select
        value={resolveFilterSelectValue(selectField, rawValue, effectiveValue)}
        onValueChange={(nextValue) => {
          const normalized = normalizeFilterSelectChange(selectField, nextValue) as
            | TState[typeof selectField.id]
            | undefined
          const currentValue =
            rawValue !== undefined && rawValue !== ''
              ? rawValue
              : effectiveValue !== undefined && effectiveValue !== ''
                ? effectiveValue
                : undefined
          if (Object.is(normalized, currentValue)) return

          onValueChange(selectField.id, normalized)
        }}
        disabled={disabled}
      >
        <SelectTrigger id={controlId} aria-label={selectField.label} size="sm">
          <SelectValue placeholder={selectField.label} />
        </SelectTrigger>
        <SelectContent>
          {showAllOption ? (
            <SelectItem value={FILTER_SELECT_ALL_VALUE}>All {selectField.label}</SelectItem>
          ) : null}
          {selectField.options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function FilterBooleanField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  state,
  disabled,
  onValueChange,
}: {
  field: BooleanFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  state: TState
  disabled?: boolean
  onValueChange: FilterFieldRendererProps<TData, TState>['onValueChange']
}) {
  const booleanField = field
  const isChecked = state[booleanField.id] === true

  return (
    <div className={filterBarControlVariants({ type: 'boolean' })}>
      <Checkbox
        id={controlId}
        checked={isChecked}
        disabled={disabled}
        onCheckedChange={(checked) => {
          onValueChange(
            booleanField.id,
            (checked === true ? true : undefined) as TState[typeof booleanField.id] | undefined,
          )
        }}
      />
      <label htmlFor={controlId} className="cursor-pointer text-sm font-medium leading-none">
        {booleanField.label}
      </label>
    </div>
  )
}

export function FilterField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  schema,
  state,
  disabled,
  onValueChange,
}: FilterFieldRendererProps<TData, TState>) {
  if (field.type === 'text') {
    return (
      <FilterTextField
        field={field}
        controlId={controlId}
        state={state}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    )
  }

  if (field.type === 'select') {
    return (
      <FilterSelectField
        field={field}
        controlId={controlId}
        schema={schema}
        state={state}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    )
  }

  return (
    <FilterBooleanField
      field={field}
      controlId={controlId}
      state={state}
      disabled={disabled}
      onValueChange={onValueChange}
    />
  )
}

export function FilterFieldList<TData, TState extends Record<string, unknown>>({
  schema,
  fields,
  state,
  disabled,
  idPrefix,
  onValueChange,
}: {
  schema: FilterSchema<TData, TState>
  fields: FilterFieldDef<TData, TState>[]
  state: TState
  disabled?: boolean
  idPrefix: string
  onValueChange: FilterFieldRendererProps<TData, TState>['onValueChange']
}) {
  const reactId = useId()
  const resolvedIdPrefix = idPrefix || reactId.replace(/:/g, '')

  return (
    <>
      {fields.map((field) => {
        if (!isFilterFieldVisible(field, state)) {
          return null
        }

        return (
          <FilterField
            key={field.id}
            field={field}
            controlId={`${resolvedIdPrefix}-${field.id}`}
            schema={schema}
            state={state}
            disabled={isFilterFieldDisabled(field, state, disabled)}
            onValueChange={onValueChange}
          />
        )
      })}
    </>
  )
}
