'use client'

import {
  FILTER_TOOLBAR_ANY_VALUE,
  filterToolbarFieldGroupClasses,
  filterToolbarFieldGroupInlineClasses,
  filterToolbarFieldLabelClasses,
} from './filter-toolbar.variants'
import {
  normalizeFilterToolbarSelectChange,
  resolveFilterToolbarPlaceholder,
  resolveFilterToolbarSelectValue,
} from './filter-toolbar.lib'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import type {
  FilterToolbarOption,
  FilterToolbarProps,
  SelectFilterFieldConfig,
} from './filter-toolbar.types'

function FilterToolbarFieldLabel({
  controlId,
  label,
  inline,
}: {
  controlId: string
  label: string
  inline: boolean
}) {
  if (inline) {
    return <span className={filterToolbarFieldLabelClasses}>{label}</span>
  }

  return (
    <label htmlFor={controlId} className={filterToolbarFieldLabelClasses}>
      {label}
    </label>
  )
}

function FilterToolbarSelectOptions({
  options,
  allowAny,
  anyLabel,
}: {
  options: FilterToolbarOption[]
  allowAny?: boolean
  anyLabel?: string
}) {
  return (
    <>
      {allowAny ? (
        <SelectItem value={FILTER_TOOLBAR_ANY_VALUE}>{anyLabel ?? 'Any'}</SelectItem>
      ) : null}
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </>
  )
}

export function FilterToolbarSelectField<TFilters extends Record<string, unknown>>({
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
  const inline = field.labelLayout === 'inline'
  const triggerAriaLabel = field.triggerAriaLabel ?? field.label

  return (
    <div
      className={inline ? filterToolbarFieldGroupInlineClasses : filterToolbarFieldGroupClasses}
      role={inline ? 'group' : undefined}
      aria-label={inline ? (field.ariaLabel ?? field.label) : undefined}
    >
      <FilterToolbarFieldLabel controlId={controlId} label={field.label} inline={inline} />
      <Select
        value={resolveFilterToolbarSelectValue(field, rawValue)}
        onValueChange={(nextValue) => {
          onValueChange(field.key, normalizeFilterToolbarSelectChange(field, nextValue))
        }}
        disabled={disabled || field.disabled}
      >
        <SelectTrigger id={controlId} size="sm" aria-label={triggerAriaLabel}>
          <SelectValue placeholder={resolveFilterToolbarPlaceholder(field)} />
        </SelectTrigger>
        <SelectContent>
          <FilterToolbarSelectOptions
            options={field.options}
            allowAny={field.allowAny}
            anyLabel={field.anyLabel}
          />
        </SelectContent>
      </Select>
    </div>
  )
}
