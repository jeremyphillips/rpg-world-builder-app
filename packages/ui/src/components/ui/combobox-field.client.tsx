'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import { FieldLabelContent } from './field-label-content'
import {
  ComboboxPanel,
  ComboboxSelectedItems,
  ComboboxTrigger,
} from './combobox-field-parts.client'
import { normalizeSelected } from './combobox-field.lib'
import type {
  ComboboxFieldControlProps,
  ComboboxFieldOption,
  ComboboxRenderSelectedItem,
} from './combobox-field.types'
import type { SelectFieldValueProps } from './select-field-value-props'
import type { FieldChromeProps } from './field-chrome.variants'
import { resolveSelectPlaceholder } from '../../form/config/field-placeholder.lib'
import { useComboboxControl } from './use-combobox-control.client'

export type {
  ComboboxFieldOption,
  ComboboxRenderSelectedItem,
  ComboboxSelectedItemRenderContext,
} from './combobox-field.types'

export interface ComboboxFieldProps extends SelectFieldValueProps, FieldChromeProps {
  id: string
  label: string
  options: ComboboxFieldOption[]
  /**
   * `true` (default) — value is `string[]`; selected values render as removable badges.
   * `false` — value is `string`; picking an option closes the panel.
   */
  multiple?: boolean
  loading?: boolean
  width?: FieldWidth
  size?: FieldSize
  placeholder?: string
  emptyMessage?: string
  /** When false, the panel omits the search row and keyboard nav targets the listbox. */
  enableSearch?: boolean
  /** Custom selected-value renderer in multi-select mode; defaults to `Chip mode="removable"`. */
  renderSelectedItem?: ComboboxRenderSelectedItem
  hintPosition?: FieldHintPosition
}

function ComboboxFieldControl(props: ComboboxFieldControlProps) {
  const {
    label,
    selected,
    loading,
    size,
    emptyMessage,
    onBlur,
    multiple,
    enableSearch = true,
    renderSelectedItem,
  } = props
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
          hideWhenOpen={enableSearch}
          onBlur={onBlur}
        />
        <ComboboxPanel
          label={label}
          listboxId={control.listboxId}
          searchId={control.searchId}
          size={size}
          multiple={multiple}
          enableSearch={enableSearch}
          query={control.query}
          emptyMessage={emptyMessage}
          activeOptionId={control.activeOptionId}
          filteredOptions={control.filteredOptions}
          highlightedIndex={control.highlightedIndex}
          selected={selected}
          atMax={control.atMax}
          generatedId={control.generatedId}
          searchInputRef={control.searchInputRef}
          listboxRef={control.listboxRef}
          onQueryChange={control.handleQueryChange}
          onNavigationKeyDown={control.handleNavigationKeyDown}
          onOpenAutoFocus={control.focusPanelOnOpen}
          onHighlight={control.setActiveIndex}
          onSelect={control.toggleOption}
        />
      </PopoverPrimitive.Root>

      {multiple ? (
        <ComboboxSelectedItems
          label={label}
          options={control.selectedOptions}
          size={size}
          disabled={control.isInteractionDisabled}
          onRemove={control.removeValue}
          renderSelectedItem={renderSelectedItem}
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
  invalid,
  describedBy,
  hint,
  info,
  required,
  disabled,
  loading,
  width,
  size = 'md',
  placeholder,
  emptyMessage = 'No options found.',
  enableSearch = true,
  renderSelectedItem,
  hintPosition,
  chrome,
}: ComboboxFieldProps) {
  const selected = React.useMemo(() => normalizeSelected(multiple, value), [multiple, value])
  const resolvedPlaceholder = resolveSelectPlaceholder(label, placeholder)

  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      required={required}
      width={width}
      size={size}
    >
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        label={
          <Field.Label>
            <FieldLabelContent label={label} info={info} />
          </Field.Label>
        }
        control={
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
            placeholder={resolvedPlaceholder}
            emptyMessage={emptyMessage}
            enableSearch={enableSearch}
            renderSelectedItem={renderSelectedItem}
          />
        }
        chrome={chrome}
        size={size}
      />
    </Field.Root>
  )
}
