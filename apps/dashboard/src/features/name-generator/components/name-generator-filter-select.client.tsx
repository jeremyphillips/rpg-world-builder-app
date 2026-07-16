'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@rpg/ui'

import { ANY_FILTER_VALUE } from './name-generator-toolbar.variants'
import type { FilterOption } from '../model/name-generator-filters'
import {
  nameGeneratorFilterGroupClasses,
  nameGeneratorFilterLabelClasses,
} from './name-generator-toolbar.variants'

export type NameGeneratorFilterSelectProps = {
  id: string
  label: string
  value: string | undefined
  options: FilterOption[]
  onValueChange: (value: string | undefined) => void
  allowAny?: boolean
  anyLabel?: string
}

export function NameGeneratorFilterSelect({
  id,
  label,
  value,
  options,
  onValueChange,
  allowAny = false,
  anyLabel = 'Any',
}: NameGeneratorFilterSelectProps) {
  const selectValue = value ?? (allowAny ? ANY_FILTER_VALUE : (options[0]?.id ?? ''))

  return (
    <div className={nameGeneratorFilterGroupClasses}>
      <label htmlFor={id} className={nameGeneratorFilterLabelClasses}>
        {label}
      </label>
      <Select
        value={selectValue}
        onValueChange={(nextValue) => {
          onValueChange(nextValue === ANY_FILTER_VALUE ? undefined : nextValue)
        }}
      >
        <SelectTrigger id={id} size="sm" aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allowAny ? <SelectItem value={ANY_FILTER_VALUE}>{anyLabel}</SelectItem> : null}
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
