'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { Field, type FieldSize } from './field.client'
import type { FieldWidth } from './field-control.variants'
import { InfoTooltip } from './tooltip.client'
import {
  ComboboxPanel,
  ComboboxSelectedChips,
  ComboboxTrigger,
} from './combobox-field-parts.client'
import { normalizeSelected } from './combobox-field.lib'
import type { ComboboxFieldControlProps, ComboboxFieldOption } from './combobox-field.types'
import { useComboboxControl } from './use-combobox-control.client'

export type { ComboboxFieldOption } from './combobox-field.types'

export interface ComboboxFieldProps {
  id: string
  label: string
  options: ComboboxFieldOption[]
  /**
   * `true` (default) — value is `string[]`; selected values render as removable chips.
   * `false` — value is `string`; picking an option closes the panel.
   */
  multiple?: boolean
  /** Maximum selections when `multiple` is true. */
  max?: number
  value?: string | number | Array<string | number>
  onChange?: (value: string | string[]) => void
  onBlur?: () => void
  error?: string
  hint?: string
  info?: React.ReactNode
  required?: boolean
  disabled?: boolean
  loading?: boolean
  width?: FieldWidth
  size?: FieldSize
  placeholder?: string
  emptyMessage?: string
}

function ComboboxFieldControl(props: ComboboxFieldControlProps) {
  const { label, selected, loading, size, emptyMessage, onBlur, multiple } = props
  const control = useComboboxControl(props)

  return (
    <div className="space-y-0">
      <PopoverPrimitive.Root open={control.open} onOpenChange={control.handleOpenChange}>
        <ComboboxTrigger
          listboxId={control.listboxId}
          open={control.open}
          size={size}
          triggerText={control.triggerText}
          loading={loading}
          disabled={control.isInteractionDisabled}
          muted={selected.length === 0 || Boolean(loading)}
          onBlur={onBlur}
        />
        <ComboboxPanel
          label={label}
          listboxId={control.listboxId}
          searchId={control.searchId}
          multiple={multiple}
          query={control.query}
          emptyMessage={emptyMessage}
          activeOptionId={control.activeOptionId}
          filteredOptions={control.filteredOptions}
          highlightedIndex={control.highlightedIndex}
          selected={selected}
          atMax={control.atMax}
          generatedId={control.generatedId}
          searchInputRef={control.searchInputRef}
          onQueryChange={control.handleQueryChange}
          onSearchKeyDown={control.handleSearchKeyDown}
          onOpenAutoFocus={control.focusSearchInput}
          onHighlight={control.setActiveIndex}
          onSelect={control.toggleOption}
        />
      </PopoverPrimitive.Root>

      {multiple ? (
        <ComboboxSelectedChips
          label={label}
          options={control.selectedOptions}
          disabled={control.isInteractionDisabled}
          onRemove={control.removeValue}
        />
      ) : null}
    </div>
  )
}

/** Searchable dropdown for picking one or many values from a large option list. */
export function ComboboxField({
  id,
  label,
  options,
  multiple = true,
  max,
  value,
  onChange,
  onBlur,
  error,
  hint,
  info,
  required,
  disabled,
  loading,
  width,
  size = 'md',
  placeholder = 'Select…',
  emptyMessage = 'No options found.',
}: ComboboxFieldProps) {
  const selected = React.useMemo(() => normalizeSelected(multiple, value), [multiple, value])

  return (
    <Field.Root id={id} error={error} hint={hint} required={required} width={width} size={size}>
      <Field.Label>
        {label}
        {info ? <InfoTooltip aria-label={`About ${label}`}>{info}</InfoTooltip> : null}
      </Field.Label>
      <ComboboxFieldControl
        label={label}
        options={options}
        multiple={multiple}
        max={max}
        selected={selected}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        loading={loading}
        size={size}
        placeholder={placeholder}
        emptyMessage={emptyMessage}
      />
      <Field.Hint />
      <Field.Error />
    </Field.Root>
  )
}
