'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'

import { Field, type FieldSize } from './field.client'
import { FieldLayout } from './field-layout'
import type { FieldWidth } from './field-control.variants'
import type { FieldHintPosition } from './field.variants'
import { FormFieldLabel } from '../../form/presentation/form-field-label.client'
import {
  ComboboxPanel,
  ComboboxSelectedItems,
  ComboboxTrigger,
} from './combobox-field-parts.client'
import { FieldClearAffordanceButton } from './field-clear-affordance.client'
import { JoinedPair } from './joined-pair-field.client'
import { normalizeSelected } from './combobox-field.lib'
import type {
  ComboboxFieldControlProps,
  ComboboxFieldOption,
  ComboboxRenderOption,
  ComboboxRenderSelectedItem,
  ResolveComboboxFilteredOptions,
} from './combobox-field.types'
import type { SelectFieldValueProps } from './select-field-value-props'
import type { FieldChromeProps } from './field-chrome.variants'
import { resolveFieldAnatomyWidth } from './field-chrome.variants'
import { resolveFieldPlaceholder } from '../../form/config/field-placeholder.lib'
import { useFormSectionContext } from '../../form/context/form-section.context'
import { resolveFormDensity } from '../../form/form-density'
import { useComboboxControl } from './use-combobox-control.client'
import type { FieldLabelPresentationProps } from './field-label-props'

export type {
  ComboboxFieldOption,
  ComboboxRenderOption,
  ComboboxRenderSelectedItem,
  ComboboxSelectedItemRenderContext,
  ResolveComboboxFilteredOptions,
} from './combobox-field.types'

export interface ComboboxFieldProps
  extends SelectFieldValueProps, FieldChromeProps, FieldLabelPresentationProps {
  id: string
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
  /** Custom interior for dropdown options; primitive retains label-only fallback and a11y name. */
  renderOption?: ComboboxRenderOption
  /** Custom filter/rank for panel options; selected values must remain visible when set. */
  resolveFilteredOptions?: ResolveComboboxFilteredOptions
  /** Optional filter row below search — hosts own filter UI and state. */
  filter?: React.ReactNode
  hintPosition?: FieldHintPosition
  /** Single-select only — inline clear paired with the trigger (see SelectField clearable). */
  clearable?: boolean
  clearAccessibleName?: string
  onClear?: () => void
  triggerRef?: React.Ref<HTMLButtonElement>
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
    renderOption,
    filter,
    clearable = false,
    clearAccessibleName,
    onClear,
    triggerRef: triggerRefProp,
  } = props
  const control = useComboboxControl(props)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const setTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node
      if (typeof triggerRefProp === 'function') {
        triggerRefProp(node)
      } else if (triggerRefProp) {
        ;(triggerRefProp as React.MutableRefObject<HTMLButtonElement | null>).current = node
      }
    },
    [triggerRefProp],
  )
  const showClear = clearable && !multiple && selected.length > 0 && !control.isInteractionDisabled
  const clearLabel = clearAccessibleName ?? `Clear ${label}`

  const combobox = (
    <PopoverPrimitive.Root open={control.open} onOpenChange={control.handleOpenChange}>
      <ComboboxTrigger
        ref={setTriggerRef}
        listboxId={control.listboxId}
        open={control.open}
        size={size}
        triggerText={control.triggerText}
        loading={loading}
        disabled={control.isInteractionDisabled}
        muted={selected.length === 0 || Boolean(loading)}
        hideWhenOpen={enableSearch}
        grouped={showClear}
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
        renderOption={renderOption}
        filter={filter}
        onQueryChange={control.handleQueryChange}
        onNavigationKeyDown={control.handleNavigationKeyDown}
        onOpenAutoFocus={control.focusPanelOnOpen}
        onHighlight={control.setActiveIndex}
        onSelect={control.toggleOption}
      />
    </PopoverPrimitive.Root>
  )

  return (
    <div className="w-full min-w-0 space-y-0">
      {showClear ? (
        <JoinedPair.Root layout="stretch" className="w-full">
          <div className="min-w-0">{combobox}</div>
          <JoinedPair.Divider />
          <FieldClearAffordanceButton
            size={size}
            accessibleName={clearLabel}
            onClear={() => {
              onClear?.()
              requestAnimationFrame(() => {
                triggerRef.current?.focus()
              })
            }}
          />
        </JoinedPair.Root>
      ) : (
        combobox
      )}

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
  labelVisibility = 'visible',
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
  size: sizeProp,
  placeholder,
  emptyMessage = 'No options found.',
  enableSearch = true,
  renderSelectedItem,
  renderOption,
  resolveFilteredOptions,
  filter,
  hintPosition,
  chrome,
  clearable,
  clearAccessibleName,
  onClear,
  triggerRef,
}: ComboboxFieldProps) {
  const { density } = useFormSectionContext()
  const size = sizeProp ?? resolveFormDensity(density).size
  const selected = React.useMemo(() => normalizeSelected(multiple, value), [multiple, value])
  const resolvedPlaceholder = resolveFieldPlaceholder(
    { label, category: multiple ? 'multi' : 'choice' },
    placeholder,
  )
  const rootWidth = resolveFieldAnatomyWidth(width, chrome)

  return (
    <Field.Root
      id={id}
      error={error}
      invalid={invalid}
      describedBy={describedBy}
      hint={hint}
      required={required}
      width={rootWidth}
      size={size}
      anatomy
    >
      <FieldLayout
        hintPosition={hintPosition}
        wrapControl={false}
        label={
          <FormFieldLabel
            label={label}
            labelVisibility={labelVisibility}
            info={info}
            required={required}
          />
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
            placeholder={resolvedPlaceholder ?? ''}
            emptyMessage={emptyMessage}
            enableSearch={enableSearch}
            renderSelectedItem={renderSelectedItem}
            renderOption={renderOption}
            resolveFilteredOptions={resolveFilteredOptions}
            filter={filter}
            clearable={clearable}
            clearAccessibleName={clearAccessibleName}
            onClear={onClear}
            triggerRef={triggerRef}
          />
        }
        chrome={chrome}
        size={size}
      />
    </Field.Root>
  )
}
