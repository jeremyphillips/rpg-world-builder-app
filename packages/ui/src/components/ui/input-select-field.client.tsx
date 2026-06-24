'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, ChevronDown, Search } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Field, type FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { fieldLabelVariants } from './field.variants'
import {
  comboboxContentVariants,
  comboboxEmptyVariants,
  comboboxListVariants,
  comboboxOptionVariants,
  comboboxSearchRowVariants,
} from './combobox-field.variants'
import { Input } from './input.client'
import {
  filterInputSelectOptions,
  resolveInputSelectOption,
  type InputSelectOption,
} from './input-select-field.lib'
import {
  inputSelectDividerVariants,
  inputSelectGroupVariants,
  inputSelectSearchablePanelVariants,
  inputSelectUnitSegmentVariants,
  inputSelectValueSegmentVariants,
  inputSelectValueWrapperVariants,
} from './input-select-field.variants'
import { NumberInput } from './number-input.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import { InfoTooltip } from './tooltip.client'

const EMPTY_UNIT_MESSAGE = 'No units match your search.'

export type { InputSelectOption }

export interface InputSelectFieldProps {
  id: string
  label: string
  inputType: 'text' | 'number'
  value: string | number | undefined
  unit: string
  options: InputSelectOption[]
  onValueChange: (value: string | number | undefined) => void
  onUnitChange: (unit: string) => void
  searchable?: boolean
  unitPlaceholder?: string
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  size?: FieldSize
  width?: FieldWidth
  min?: number
  max?: number
  step?: number
  placeholder?: string
  onBlur?: () => void
}

interface UnitSelectSegmentProps {
  id: string
  label: string
  unit: string
  options: InputSelectOption[]
  searchable: boolean
  unitPlaceholder?: string
  disabled?: boolean
  size: FieldSize
  hasError: boolean
  describedBy?: string
  onUnitChange: (unit: string) => void
  onBlur?: () => void
}

function RadixUnitSelect({
  id,
  unit,
  options,
  unitPlaceholder,
  disabled,
  size,
  hasError,
  describedBy,
  onUnitChange,
  onBlur,
}: Omit<UnitSelectSegmentProps, 'searchable' | 'label'>) {
  return (
    <Select value={unit} onValueChange={onUnitChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        size={size}
        data-input-select-segment
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        onBlur={onBlur}
        className={inputSelectUnitSegmentVariants({ size, searchable: false })}
      >
        <SelectValue placeholder={unitPlaceholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function SearchableUnitSelect({
  id,
  label,
  unit,
  options,
  unitPlaceholder,
  disabled,
  size,
  hasError,
  describedBy,
  onUnitChange,
  onBlur,
}: Omit<UnitSelectSegmentProps, 'searchable'>) {
  const listboxId = `${id}-listbox`
  const searchId = `${id}-search`
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const selectedOption = resolveInputSelectOption(unit, options)
  const filteredOptions = filterInputSelectOptions(options, query)
  const triggerText = unit ? selectedOption.label : (unitPlaceholder ?? 'Choose unit')

  function handleSelect(nextUnit: string) {
    onUnitChange(nextUnit)
    setOpen(false)
    setQuery('')
  }

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) setQuery('')
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          id={id}
          role="combobox"
          data-input-select-segment
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            inputSelectUnitSegmentVariants({ size, searchable: true }),
            !unit && 'text-muted-foreground',
          )}
        >
          <span className="truncate">{triggerText}</span>
          <ChevronDown className="size-4 shrink-0 opacity-50" aria-hidden />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={4}
          className={cn(comboboxContentVariants(), inputSelectSearchablePanelVariants())}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            searchInputRef.current?.focus()
          }}
        >
          <div className={comboboxSearchRowVariants()}>
            <Search className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
            <Input
              ref={searchInputRef}
              id={searchId}
              type="search"
              size="sm"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${label.toLowerCase()}…`}
              aria-label={`Search ${label}`}
              aria-controls={listboxId}
              className="h-8 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <div id={listboxId} role="listbox" aria-label={label} className={comboboxListVariants()}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = option.value === unit
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    className={comboboxOptionVariants()}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate">{option.label}</span>
                      {option.description ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    {isSelected ? (
                      <Check className="size-4 shrink-0" aria-hidden />
                    ) : (
                      <span className="size-4 shrink-0" aria-hidden />
                    )}
                  </button>
                )
              })
            ) : (
              <p className={comboboxEmptyVariants()}>{EMPTY_UNIT_MESSAGE}</p>
            )}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}

function UnitSelectSegment(props: UnitSelectSegmentProps) {
  if (props.searchable) {
    return <SearchableUnitSelect {...props} />
  }
  return <RadixUnitSelect {...props} />
}

function parseNumberValue(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const parsed = Number(raw)
  return Number.isNaN(parsed) ? undefined : parsed
}

interface ValueSegmentProps {
  id: string
  inputType: 'text' | 'number'
  value: string | number | undefined
  size: FieldSize
  disabled?: boolean
  placeholder?: string
  min?: number
  max?: number
  step?: number
  hasError: boolean
  describedBy?: string
  onValueChange: (value: string | number | undefined) => void
  onBlur?: () => void
}

function ValueSegment({
  id,
  inputType,
  value,
  size,
  disabled,
  placeholder,
  min,
  max,
  step,
  hasError,
  describedBy,
  onValueChange,
  onBlur,
}: ValueSegmentProps) {
  const displayValue = value ?? ''
  const segmentClassName = inputSelectValueSegmentVariants({ size })

  function handleValueChange(event: React.ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value
    if (inputType === 'number') {
      onValueChange(parseNumberValue(raw))
      return
    }
    onValueChange(raw)
  }

  if (inputType === 'number') {
    return (
      <div data-input-select-segment className={inputSelectValueWrapperVariants()}>
        <NumberInput
          id={id}
          grouped
          rootClassName="w-full"
          size={size}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          value={displayValue}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          onChange={handleValueChange}
          onBlur={onBlur}
          className={segmentClassName}
        />
      </div>
    )
  }

  return (
    <Input
      id={id}
      data-input-select-segment
      type="text"
      size={size}
      disabled={disabled}
      placeholder={placeholder}
      value={displayValue}
      aria-invalid={hasError || undefined}
      aria-describedby={describedBy}
      onChange={handleValueChange}
      onBlur={onBlur}
      className={segmentClassName}
    />
  )
}

/** Labelled field combining a value input (text or number) with a unit select in one control. */
export function InputSelectField({
  id,
  label,
  inputType,
  value,
  unit,
  options,
  onValueChange,
  onUnitChange,
  searchable = false,
  unitPlaceholder,
  error,
  hint,
  info,
  required = false,
  disabled = false,
  size = 'md',
  width = 'full',
  min,
  max,
  step,
  placeholder,
  onBlur,
}: InputSelectFieldProps) {
  const valueId = `${id}-value`
  const unitId = `${id}-unit`
  const hasError = Boolean(error)
  const describedBy = hasError ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} size={size} width={width}>
      <label
        id={`${id}-label`}
        htmlFor={valueId}
        data-required={required || undefined}
        className={fieldLabelVariants({ size })}
      >
        {label}
        {required ? (
          <span aria-hidden className="text-destructive">
            *
          </span>
        ) : null}
        {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
      </label>

      <div
        role="group"
        aria-labelledby={`${id}-label`}
        className={inputSelectGroupVariants({ invalid: hasError, disabled })}
      >
        <label htmlFor={valueId} className="sr-only">
          {label} value
        </label>
        <ValueSegment
          id={valueId}
          inputType={inputType}
          value={value}
          size={size}
          disabled={disabled}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          hasError={hasError}
          describedBy={describedBy}
          onValueChange={onValueChange}
          onBlur={onBlur}
        />

        <div aria-hidden className={inputSelectDividerVariants()} />

        <label htmlFor={unitId} className="sr-only">
          {label} unit
        </label>
        <UnitSelectSegment
          id={unitId}
          label={label}
          unit={unit}
          options={options}
          searchable={searchable}
          unitPlaceholder={unitPlaceholder}
          disabled={disabled}
          size={size}
          hasError={hasError}
          describedBy={describedBy}
          onUnitChange={onUnitChange}
          onBlur={onBlur}
        />
      </div>

      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
