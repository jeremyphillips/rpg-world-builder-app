'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import { resolveFieldAnatomyWidth, type FieldChrome } from './field-chrome.variants'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import {
  COMBOBOX_TRIGGER_OVERLAP_OFFSET,
  comboboxContentVariants,
  comboboxTriggerOpenVariants,
} from './combobox-field.variants'
import { ListResultEmpty, ListResultList } from './list-result-list.client'
import { ListResultItem } from './list-result-item.client'
import { ListResultViewport } from './list-result-viewport.client'
import { ComboboxSearchField } from './combobox-field-parts.client'
import { JoinedPair } from './joined-pair-field.client'
import { PopoverLayerPortal } from './layer-portal-container.client'
import {
  filterInputSelectOptions,
  resolveInputSelectOption,
  type InputSelectOption,
} from './input-select-field.lib'
import {
  inputSelectSearchablePanelVariants,
  inputSelectSearchableUnitShellWidthVariants,
} from './input-select-field.variants'
import { groupedSelectSegmentShellClasses } from './select-compact-trigger.variants'
import { SelectLikeCaretSlot, SelectLikeValueSlot } from './select-like-trigger-slots.client'
import { type NumberInputDigits } from './number-input.client'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select.client'
import { FieldLabelContent } from './field-label-content'
import { shouldShowVisibleRequiredMarker } from './field-required.lib'

const EMPTY_UNIT_MESSAGE = 'No units match your search.'

export type { InputSelectOption }

export type InputSelectUnitMode = 'select' | 'label'

export interface InputSelectFieldProps {
  id: string
  label: string
  inputType: 'text' | 'number'
  value: string | number | undefined
  unit: string
  onValueChange: (value: string | number | undefined) => void
  /** When `unitMode` is `select`, lists unit choices. Ignored in `label` mode. */
  options?: InputSelectOption[]
  onUnitChange?: (unit: string) => void
  /** `select` (default) renders a unit dropdown; `label` renders a static unit suffix. */
  unitMode?: InputSelectUnitMode
  /** Display text for the unit segment when `unitMode` is `label`. */
  fixedUnit?: string
  searchable?: boolean
  unitPlaceholder?: string
  error?: string
  hint?: string
  hintPosition?: FieldHintPosition
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  /** When true, only the unit segment is disabled (value input stays editable). */
  unitDisabled?: boolean
  size?: FieldSize
  width?: FieldWidth
  chrome?: FieldChrome
  min?: number
  max?: number
  step?: number
  placeholder?: string
  /**
   * Maximum digit count the value input should accommodate. Sets a `min-w` floor
   * on the number input wrapper using `ch`-based sizing so the column never
   * collapses below the needed character width. Only affects the `number` input type.
   */
  valueDigits?: NumberInputDigits
  /** When true, formats the numeric value with en-US thousand separators. */
  formatGrouped?: boolean
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
  onUnitChange,
  onBlur,
}: Omit<UnitSelectSegmentProps, 'searchable' | 'label' | 'hasError' | 'describedBy'>) {
  const sizingLabels = options.map((option) => option.label)

  return (
    <Select value={unit} onValueChange={onUnitChange} disabled={disabled}>
      <SelectTrigger
        id={id}
        size={size}
        grouped
        groupedPosition="end"
        sizingLabels={sizingLabels}
        onBlur={onBlur}
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
  describedBy,
  onUnitChange,
  onBlur,
}: Omit<UnitSelectSegmentProps, 'searchable' | 'hasError'>) {
  const listboxId = `${id}-listbox`
  const searchId = `${id}-search`
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const searchInputRef = React.useRef<HTMLInputElement>(null)

  const selectedOption = resolveInputSelectOption(unit, options)
  const filteredOptions = filterInputSelectOptions(options, query)
  const triggerText = unit ? selectedOption.label : (unitPlaceholder ?? 'Choose unit')
  const sizingLabels = options.map((option) => option.label)

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
          aria-expanded={open}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          aria-describedby={describedBy}
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            groupedSelectSegmentShellClasses(size, 'end', { surfaceRole: 'unit' }),
            inputSelectSearchableUnitShellWidthVariants({ size }),
            !unit && 'text-muted-foreground',
            open && comboboxTriggerOpenVariants(),
          )}
        >
          <SelectLikeValueSlot
            size={size}
            position="end"
            trailingSlot
            sizingGhostLabels={sizingLabels}
          >
            <span className="truncate">{triggerText}</span>
          </SelectLikeValueSlot>
          <SelectLikeCaretSlot size={size} />
        </button>
      </PopoverPrimitive.Trigger>

      <PopoverLayerPortal>
        <PopoverPrimitive.Content
          align="start"
          side="bottom"
          avoidCollisions
          sideOffset={-COMBOBOX_TRIGGER_OVERLAP_OFFSET[size]}
          className={cn(comboboxContentVariants(), inputSelectSearchablePanelVariants())}
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            searchInputRef.current?.focus()
          }}
        >
          <ComboboxSearchField
            label={label}
            listboxId={listboxId}
            searchId={searchId}
            size={size}
            query={query}
            searchInputRef={searchInputRef}
            onQueryChange={setQuery}
          />

          <ListResultViewport>
            <ListResultList id={listboxId} role="listbox" aria-label={label}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = option.value === unit
                  return (
                    <ListResultItem
                      key={option.value}
                      name={option.label}
                      metadata={option.metadata}
                      selected={isSelected}
                      endSlot={
                        isSelected ? (
                          <Check className="size-4 shrink-0" aria-hidden />
                        ) : (
                          <span className="size-4 shrink-0" aria-hidden />
                        )
                      }
                      asChild
                    >
                      <button
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => handleSelect(option.value)}
                      />
                    </ListResultItem>
                  )
                })
              ) : (
                <ListResultEmpty>{EMPTY_UNIT_MESSAGE}</ListResultEmpty>
              )}
            </ListResultList>
          </ListResultViewport>
        </PopoverPrimitive.Content>
      </PopoverLayerPortal>
    </PopoverPrimitive.Root>
  )
}

function UnitSelectSegment({ searchable, hasError: _hasError, ...rest }: UnitSelectSegmentProps) {
  if (searchable) {
    return <SearchableUnitSelect {...rest} />
  }
  const { describedBy: _describedBy, label: _label, ...radixProps } = rest
  return <RadixUnitSelect {...radixProps} />
}

/** Labelled field combining a value input (text or number) with a unit select in one control. */
// fallow-ignore-next-line complexity
export function InputSelectField({
  id,
  label,
  inputType,
  value,
  unit,
  options = [],
  onValueChange,
  onUnitChange,
  unitMode = 'select',
  fixedUnit,
  searchable = false,
  unitPlaceholder,
  error,
  hint,
  hintPosition,
  info,
  required = false,
  disabled = false,
  unitDisabled = false,
  size = 'md',
  width = 'full',
  chrome,
  min,
  max,
  step,
  placeholder,
  valueDigits,
  formatGrouped = false,
  onBlur,
}: InputSelectFieldProps) {
  if (unitMode === 'label' && !fixedUnit) {
    throw new Error('InputSelectField: fixedUnit is required when unitMode is "label".')
  }

  const valueId = `${id}-value`
  const unitId = `${id}-unit`
  const hasError = Boolean(error)
  const describedBy = hasError ? `${id}-error` : hint ? `${id}-hint` : undefined
  const layout = inputType === 'number' && valueDigits != null ? 'intrinsic' : 'stretch'
  const isLabelUnit = unitMode === 'label'
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)

  return (
    <Field.Root
      id={id}
      error={error}
      hint={hint}
      required={required}
      size={size}
      width={rootWidth}
      anatomy
    >
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        chrome={chrome}
        size={size}
        label={
          <Field.Label id={`${id}-label`} htmlFor={valueId}>
            <FieldLabelContent
              label={label}
              required={required}
              showRequiredMarker={shouldShowVisibleRequiredMarker(required)}
              info={info}
            />
          </Field.Label>
        }
        control={
          <JoinedPair.Root
            layout={layout}
            invalid={hasError}
            disabled={disabled}
            aria-labelledby={`${id}-label`}
          >
            {inputType === 'number' ? (
              <JoinedPair.NumberOccupant
                id={valueId}
                ariaLabel={`${label} value`}
                value={typeof value === 'number' ? value : undefined}
                size={size}
                disabled={disabled}
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                digits={valueDigits}
                formatGrouped={formatGrouped}
                required={required}
                hasError={hasError}
                describedBy={describedBy}
                onValueChange={onValueChange}
                onBlur={onBlur}
              />
            ) : (
              <JoinedPair.TextStartOccupant
                id={valueId}
                ariaLabel={`${label} value`}
                value={value != null ? String(value) : undefined}
                size={size}
                disabled={disabled}
                placeholder={placeholder}
                required={required}
                hasError={hasError}
                describedBy={describedBy}
                onValueChange={onValueChange}
                onBlur={onBlur}
              />
            )}

            <JoinedPair.Divider />

            {isLabelUnit ? (
              <JoinedPair.LabelOccupant text={fixedUnit!} ariaLabel={`${label} unit`} size={size} />
            ) : (
              <>
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
                  disabled={disabled || unitDisabled}
                  size={size}
                  hasError={hasError}
                  describedBy={describedBy}
                  onUnitChange={onUnitChange ?? (() => {})}
                  onBlur={onBlur}
                />
              </>
            )}
          </JoinedPair.Root>
        }
      />
    </Field.Root>
  )
}

export type InputUnitFieldProps = Omit<
  InputSelectFieldProps,
  | 'unitMode'
  | 'fixedUnit'
  | 'options'
  | 'onUnitChange'
  | 'unit'
  | 'searchable'
  | 'unitPlaceholder'
  | 'unitDisabled'
> & {
  /** Display text for the fixed unit suffix (e.g. `ft.`, `lb.`). */
  unit: string
}

/** Grouped number/text input with a static unit label — shares InputSelectField tokens. */
export function InputUnitField({ unit, ...props }: InputUnitFieldProps) {
  return <InputSelectField {...props} unit="" unitMode="label" fixedUnit={unit} options={[]} />
}
