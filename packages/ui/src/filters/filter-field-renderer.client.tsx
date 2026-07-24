'use client'

import { CatalogFilterChips } from '../components/ui/catalog-filter-chips.client'
import { Checkbox } from '../components/ui/checkbox.client'
import { FilterPopover } from '../components/ui/filter-popover.client'
import { Input } from '../components/ui/input.client'
import { Text } from '../components/ui/text'
import { cn } from '../lib/utils'
import { useFilterChrome } from './filter-chrome.context'
import { isFilterFieldDisabled } from './filter-bar.lib'
import { resolveChipsFieldOptions, resolvePopoverFieldGroups } from './filter-field-options.lib'
import {
  resolveFilterFieldPresentation,
  resolveFilterFieldWidthClasses,
  type FilterFieldPresentation,
} from './filter-presentation.lib'
import { FILTER_SELECT_ALL_VALUE } from './filter-bar.variants'
import { FilterSelectControl } from './filter-select-control.client'
import type {
  BooleanFilterFieldDef,
  ChipsFilterFieldDef,
  FilterFieldDef,
  FilterFieldId,
  FilterFieldOptionsContext,
  FilterSchema,
  PopoverFilterFieldDef,
  TextFilterFieldDef,
} from './filter-schema.types'

export type FilterRenderContext<TData, TState extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TState>
  state: TState
  data?: readonly TData[]
  disabled?: boolean
  idPrefix: string
  onValueChange: (
    id: FilterFieldId<TState>,
    value: TState[FilterFieldId<TState>] | undefined,
  ) => void
}

type FilterFieldRendererProps<TData, TState extends Record<string, unknown>> = {
  field: FilterFieldDef<TData, TState>
  controlId: string
  context: FilterRenderContext<TData, TState>
}

function countPopoverActiveFilters(value: unknown): number {
  if (!value || typeof value !== 'object') return 0
  return Object.values(value).reduce<number>((count, entry) => {
    if (Array.isArray(entry)) return count + entry.length
    return count
  }, 0)
}

function FilterTextField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  presentation,
  disabled,
  state,
  onValueChange,
}: {
  field: TextFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  presentation: Extract<FilterFieldPresentation, { type: 'text' }>
  disabled?: boolean
  state: TState
  onValueChange: FilterFieldRendererProps<TData, TState>['context']['onValueChange']
}) {
  const textField = field
  const rawValue = state[textField.id]
  const textValue = typeof rawValue === 'string' ? rawValue : ''

  return (
    <div className={presentation.groupClassName}>
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
        size={presentation.controlSize}
        disabled={disabled}
      />
    </div>
  )
}

function FilterChipsField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  presentation,
  optionsContext,
  state,
  onValueChange,
}: {
  field: ChipsFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  presentation: Extract<FilterFieldPresentation, { type: 'chips' }>
  optionsContext: FilterFieldOptionsContext<TData, TState>
  state: TState
  onValueChange: FilterFieldRendererProps<TData, TState>['context']['onValueChange']
}) {
  const chipsField = field
  const rawValue = state[chipsField.id]
  const options = resolveChipsFieldOptions(chipsField, optionsContext)
  const allValue = chipsField.allValue ?? FILTER_SELECT_ALL_VALUE

  if (chipsField.selectionMode === 'single-required') {
    const chipValue =
      rawValue !== undefined && rawValue !== ''
        ? String(rawValue)
        : String(chipsField.defaultValue ?? allValue)

    return (
      <div className={presentation.groupClassName}>
        <CatalogFilterChips
          id={controlId}
          label={chipsField.label}
          selectionMode="single-required"
          value={chipValue}
          options={options}
          presentation={presentation}
          onValueChange={(value) => {
            onValueChange(chipsField.id, value as TState[typeof chipsField.id])
          }}
        />
      </div>
    )
  }

  const chipValues = chipsField.toChipValues
    ? chipsField.toChipValues(rawValue)
    : Array.isArray(rawValue)
      ? rawValue.map(String)
      : []

  return (
    <div className={presentation.groupClassName}>
      <CatalogFilterChips
        id={controlId}
        label={chipsField.label}
        selectionMode="multiple"
        selectedValues={chipValues}
        options={options}
        presentation={presentation}
        onSelectedValuesChange={(nextValues) => {
          const nextValue = chipsField.fromChipValues
            ? chipsField.fromChipValues(rawValue, nextValues, optionsContext)
            : (nextValues as TState[typeof chipsField.id])
          onValueChange(chipsField.id, nextValue)
        }}
      />
    </div>
  )
}

function FilterPopoverField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  presentation,
  optionsContext,
  state,
  disabled,
  onValueChange,
}: {
  field: PopoverFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  presentation: Extract<FilterFieldPresentation, { type: 'popover' }>
  optionsContext: FilterFieldOptionsContext<TData, TState>
  state: TState
  disabled?: boolean
  onValueChange: FilterFieldRendererProps<TData, TState>['context']['onValueChange']
}) {
  const popoverField = field
  const rawValue = state[popoverField.id]
  const groups = resolvePopoverFieldGroups(popoverField, optionsContext)
  const recordValue =
    rawValue && typeof rawValue === 'object'
      ? (rawValue as Record<string, string[]>)
      : ((popoverField.defaultValue as Record<string, string[]> | undefined) ?? {})

  if (groups.length === 0 || disabled) {
    return null
  }

  const activeCount = countPopoverActiveFilters(recordValue)

  return (
    <div className={presentation.groupClassName}>
      <FilterPopover
        triggerLabel={popoverField.triggerLabel(activeCount)}
        triggerAriaLabel={popoverField.triggerAriaLabel ?? popoverField.label}
        triggerSize={presentation.triggerSize}
        groups={groups.map((group) => ({
          id: group.id,
          label: group.label,
          options: group.options,
          selectedValues: recordValue[group.id] ?? [],
          onSelectedValuesChange: (selectedValues) => {
            onValueChange(popoverField.id, {
              ...recordValue,
              [group.id]: selectedValues,
            } as TState[typeof popoverField.id])
          },
        }))}
      />
      <span id={controlId} className="sr-only">
        {popoverField.label}
      </span>
    </div>
  )
}

function FilterBooleanField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  presentation,
  optionsContext,
  disabled,
  state,
  onValueChange,
}: {
  field: BooleanFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  presentation: Extract<FilterFieldPresentation, { type: 'boolean' }>
  optionsContext: FilterFieldOptionsContext<TData, TState>
  disabled?: boolean
  state: TState
  onValueChange: FilterFieldRendererProps<TData, TState>['context']['onValueChange']
}) {
  const booleanField = field
  const isChecked = state[booleanField.id] === true
  const hiddenCount = booleanField.hiddenCount?.(state, optionsContext)

  return (
    <div className={presentation.groupClassName}>
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
        className={cn(presentation.labelClassName, 'cursor-pointer font-medium leading-none')}
      >
        {booleanField.label}
      </label>
      {isChecked && hiddenCount !== undefined && hiddenCount > 0 ? (
        <Text as="span" variant="muted" className="text-xs tabular-nums">
          {hiddenCount} hidden
        </Text>
      ) : null}
    </div>
  )
}

export function FilterFieldRenderer<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  context,
}: FilterFieldRendererProps<TData, TState>) {
  const chrome = useFilterChrome()
  const presentation = resolveFilterFieldPresentation(field, chrome)
  const widthClassName = resolveFilterFieldWidthClasses(
    field.type === 'select' ? field.width : undefined,
  )
  const disabled = isFilterFieldDisabled(field, context.state, context.disabled)
  const optionsContext: FilterFieldOptionsContext<TData, TState> = {
    state: context.state,
    data: context.data,
  }

  switch (field.type) {
    case 'text':
      return (
        <FilterTextField
          field={field}
          controlId={controlId}
          presentation={presentation as Extract<FilterFieldPresentation, { type: 'text' }>}
          disabled={disabled}
          state={context.state}
          onValueChange={context.onValueChange}
        />
      )

    case 'select':
      return (
        <FilterSelectControl
          field={field}
          controlId={controlId}
          schema={context.schema}
          state={context.state}
          optionsContext={optionsContext}
          presentation={presentation as Extract<FilterFieldPresentation, { type: 'select' }>}
          widthClassName={widthClassName}
          disabled={disabled}
          onValueChange={context.onValueChange}
        />
      )

    case 'chips':
      return (
        <FilterChipsField
          field={field}
          controlId={controlId}
          presentation={presentation as Extract<FilterFieldPresentation, { type: 'chips' }>}
          optionsContext={optionsContext}
          state={context.state}
          onValueChange={context.onValueChange}
        />
      )

    case 'popover':
      return (
        <FilterPopoverField
          field={field}
          controlId={controlId}
          presentation={presentation as Extract<FilterFieldPresentation, { type: 'popover' }>}
          optionsContext={optionsContext}
          state={context.state}
          disabled={disabled}
          onValueChange={context.onValueChange}
        />
      )

    case 'boolean':
      return (
        <FilterBooleanField
          field={field}
          controlId={controlId}
          presentation={presentation as Extract<FilterFieldPresentation, { type: 'boolean' }>}
          optionsContext={optionsContext}
          disabled={disabled}
          state={context.state}
          onValueChange={context.onValueChange}
        />
      )

    default:
      return null
  }
}
