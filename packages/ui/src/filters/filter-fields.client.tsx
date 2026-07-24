'use client'

import { useId } from 'react'

import { Checkbox } from '../components/ui/checkbox.client'
import { Input } from '../components/ui/input.client'
import { cn } from '../lib/utils'
import {
  isFilterFieldDisabled,
  isFilterFieldVisible,
  resolveFilterControlSize,
} from './filter-bar.lib'
import {
  filterBarControlVariants,
  filterFieldLabelVariants,
  FILTER_DENSITY_DEFAULT,
} from './filter-bar.variants'
import { FilterSelectControl } from './filter-select-control.client'
import type {
  BooleanFilterFieldDef,
  FilterDensity,
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
  density?: FilterDensity
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
  density = FILTER_DENSITY_DEFAULT,
  disabled,
  onValueChange,
}: {
  field: TextFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  state: TState
  density?: FilterDensity
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
        size={resolveFilterControlSize(density)}
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
  density = FILTER_DENSITY_DEFAULT,
  disabled,
  onValueChange,
}: {
  field: SelectFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  schema: FilterSchema<TData, TState>
  state: TState
  density?: FilterDensity
  disabled?: boolean
  onValueChange: FilterFieldRendererProps<TData, TState>['onValueChange']
}) {
  return (
    <FilterSelectControl
      field={field}
      controlId={controlId}
      schema={schema}
      state={state}
      density={density}
      disabled={disabled}
      onValueChange={onValueChange}
      guardDuplicateChanges
    />
  )
}

function FilterBooleanField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  state,
  density = FILTER_DENSITY_DEFAULT,
  disabled,
  onValueChange,
}: {
  field: BooleanFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  state: TState
  density?: FilterDensity
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
      <label
        htmlFor={controlId}
        className={cn(
          filterFieldLabelVariants({ density }),
          'cursor-pointer font-medium leading-none',
        )}
      >
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
  density = FILTER_DENSITY_DEFAULT,
  disabled,
  onValueChange,
}: FilterFieldRendererProps<TData, TState>) {
  if (field.type === 'text') {
    return (
      <FilterTextField
        field={field}
        controlId={controlId}
        state={state}
        density={density}
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
        density={density}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    )
  }

  if (field.type === 'boolean') {
    return (
      <FilterBooleanField
        field={field}
        controlId={controlId}
        state={state}
        density={density}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    )
  }

  return null
}

export function FilterFieldList<TData, TState extends Record<string, unknown>>({
  schema,
  fields,
  state,
  density = FILTER_DENSITY_DEFAULT,
  disabled,
  idPrefix,
  onValueChange,
}: {
  schema: FilterSchema<TData, TState>
  fields: FilterFieldDef<TData, TState>[]
  state: TState
  density?: FilterDensity
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
            density={density}
            disabled={isFilterFieldDisabled(field, state, disabled)}
            onValueChange={onValueChange}
          />
        )
      })}
    </>
  )
}
