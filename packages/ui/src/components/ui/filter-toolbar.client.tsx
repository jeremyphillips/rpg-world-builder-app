'use client'

import { RotateCcw } from 'lucide-react'
import { useId } from 'react'

import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { filterToolbarClasses, filterToolbarResetButtonClasses } from './filter-toolbar.variants'
import { FilterToolbarSelectField } from './filter-toolbar-select-field.client'
import type { FilterFieldConfig, FilterToolbarProps } from './filter-toolbar.types'

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
  FilterToolbarLabelLayout,
  FilterToolbarOption,
  FilterToolbarProps,
  SelectFilterFieldConfig,
} from './filter-toolbar.types'
