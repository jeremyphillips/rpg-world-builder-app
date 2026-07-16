'use client'

import { RotateCcw } from 'lucide-react'
import { useId } from 'react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import {
  FILTER_TOOLBAR_ANY_VALUE,
  filterToolbarClasses,
  filterToolbarFieldGroupClasses,
  filterToolbarFieldLabelClasses,
  filterToolbarResetButtonClasses,
} from './filter-toolbar.variants'
import type {
  FilterFieldConfig,
  FilterToolbarOption,
  FilterToolbarProps,
  SelectFilterFieldConfig,
} from './filter-toolbar.types'

import {
  normalizeFilterToolbarSelectChange,
  resolveFilterToolbarSelectValue,
} from './filter-toolbar.lib'

function FilterToolbarSelectField<TFilters extends Record<string, unknown>>({
  field,
  controlId,
  rawValue,
  disabled,
  onValueChange,
}: {
  field: SelectFilterFieldConfig<TFilters>
  controlId: string
  rawValue: TFilters[SelectFilterFieldConfig<TFilters>['key']] | undefined
  disabled: boolean
  onValueChange: FilterToolbarProps<TFilters>['onValueChange']
}) {
  const selectValue = resolveFilterToolbarSelectValue(field, rawValue)
  const placeholder = field.placeholder ?? (field.allowAny ? (field.anyLabel ?? 'Any') : undefined)

  return (
    <div className={filterToolbarFieldGroupClasses}>
      <label htmlFor={controlId} className={filterToolbarFieldLabelClasses}>
        {field.label}
      </label>
      <Select
        value={selectValue}
        onValueChange={(nextValue) => {
          onValueChange(field.key, normalizeFilterToolbarSelectChange(field, nextValue))
        }}
        disabled={disabled || field.disabled}
      >
        <SelectTrigger id={controlId} size="sm" aria-label={field.label}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {field.allowAny ? (
            <SelectItem value={FILTER_TOOLBAR_ANY_VALUE}>{field.anyLabel ?? 'Any'}</SelectItem>
          ) : null}
          {field.options.map((option: FilterToolbarOption) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function FilterToolbarField<TFilters extends Record<string, unknown>>({
  field,
  idPrefix,
  values,
  disabled,
  onValueChange,
}: {
  field: FilterFieldConfig<TFilters>
  idPrefix: string
  values: TFilters
  disabled: boolean
  onValueChange: FilterToolbarProps<TFilters>['onValueChange']
}) {
  if (field.visible === false) {
    return null
  }

  const controlId = `${idPrefix}-${String(field.key)}`

  if (field.type === 'select') {
    return (
      <FilterToolbarSelectField
        field={field}
        controlId={controlId}
        rawValue={values[field.key]}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    )
  }

  return null
}

export function FilterToolbar<TFilters extends Record<string, unknown>>({
  idPrefix,
  fields,
  values,
  onValueChange,
  onReset,
  resetLabel = 'Reset filters',
  disabled = false,
  className,
}: FilterToolbarProps<TFilters>) {
  const reactId = useId()
  const resolvedIdPrefix = idPrefix || reactId.replace(/:/g, '')

  return (
    <div className={cn(filterToolbarClasses, className)}>
      {fields.map((field) => (
        <FilterToolbarField
          key={String(field.key)}
          field={field}
          idPrefix={resolvedIdPrefix}
          values={values}
          disabled={disabled}
          onValueChange={onValueChange}
        />
      ))}

      {onReset ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={filterToolbarResetButtonClasses}
          disabled={disabled}
          onClick={onReset}
        >
          <RotateCcw aria-hidden className="size-3" />
          {resetLabel}
        </Button>
      ) : null}
    </div>
  )
}

export type {
  FilterFieldConfig,
  FilterToolbarOption,
  FilterToolbarProps,
  SelectFilterFieldConfig,
} from './filter-toolbar.types'
