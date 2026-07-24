'use client'

import { useId } from 'react'

import { CatalogFilterChips } from '../components/ui/catalog-filter-chips.client'
import { Checkbox } from '../components/ui/checkbox.client'
import { FilterPopover } from '../components/ui/filter-popover.client'
import { Text } from '../components/ui/text'
import { cn } from '../lib/utils'
import { getEffectiveFilterValue } from './filter-engine'
import {
  getFilterFieldById,
  resolveChipsFieldOptions,
  resolveFilterFieldOptions,
  resolvePopoverFieldGroups,
} from './filter-field-options.lib'
import {
  isFilterFieldDisabled,
  isFilterFieldVisible,
  normalizeFilterSelectChange,
  resolveFilterSelectValue,
} from './filter-bar.lib'
import {
  FILTER_SELECT_ALL_VALUE,
  filterBarControlVariants,
  filterBarInlineFieldGroupClasses,
  filterBarInlineFieldLabelClasses,
} from './filter-bar.variants'
import type {
  BooleanFilterFieldDef,
  ChipsFilterFieldDef,
  FilterFieldDef,
  FilterFieldId,
  FilterFieldOptionsContext,
  FilterSchema,
  PopoverFilterFieldDef,
  SelectFilterFieldDef,
} from './filter-schema.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.client'

type CatalogFilterFieldRendererProps<TData, TState extends Record<string, unknown>> = {
  field: FilterFieldDef<TData, TState>
  controlId: string
  schema: FilterSchema<TData, TState>
  state: TState
  optionsContext: FilterFieldOptionsContext<TData, TState>
  disabled?: boolean
  onValueChange: (
    id: FilterFieldId<TState>,
    value: TState[FilterFieldId<TState>] | undefined,
  ) => void
}

function CatalogFilterInlineSelectField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  schema,
  state,
  optionsContext,
  disabled,
  onValueChange,
}: {
  field: SelectFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  schema: FilterSchema<TData, TState>
  state: TState
  optionsContext: FilterFieldOptionsContext<TData, TState>
  disabled?: boolean
  onValueChange: CatalogFilterFieldRendererProps<TData, TState>['onValueChange']
}) {
  const selectField = field
  const rawValue = state[selectField.id]
  const effectiveValue = getEffectiveFilterValue(schema, state, selectField.id)
  const showAllOption = selectField.showAllOption ?? true
  const options = resolveFilterFieldOptions(selectField, optionsContext)
  const inline = selectField.layout === 'inline'
  const triggerAriaLabel = selectField.triggerAriaLabel ?? selectField.label

  const selectControl = (
    <Select
      value={resolveFilterSelectValue({ ...selectField, options }, rawValue, effectiveValue)}
      onValueChange={(nextValue) => {
        const normalized = normalizeFilterSelectChange({ ...selectField, options }, nextValue) as
          | TState[typeof selectField.id]
          | undefined
        onValueChange(selectField.id, normalized)
      }}
      disabled={disabled}
    >
      <SelectTrigger id={controlId} aria-label={triggerAriaLabel} size="sm">
        <SelectValue placeholder={selectField.label} />
      </SelectTrigger>
      <SelectContent>
        {showAllOption ? (
          <SelectItem value={FILTER_SELECT_ALL_VALUE}>All {selectField.label}</SelectItem>
        ) : null}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  if (!inline) {
    return <div className={filterBarControlVariants({ type: 'select' })}>{selectControl}</div>
  }

  return (
    <div
      className={cn(
        filterBarControlVariants({ type: 'inlineSelect' }),
        filterBarInlineFieldGroupClasses,
      )}
      role="group"
      aria-label={selectField.ariaLabel ?? selectField.label}
    >
      <span className={filterBarInlineFieldLabelClasses}>{selectField.label}</span>
      {selectControl}
    </div>
  )
}

function CatalogFilterChipsField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  state,
  optionsContext,
  onValueChange,
}: {
  field: ChipsFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  state: TState
  optionsContext: FilterFieldOptionsContext<TData, TState>
  disabled?: boolean
  onValueChange: CatalogFilterFieldRendererProps<TData, TState>['onValueChange']
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
      <div className={filterBarControlVariants({ type: 'chips' })}>
        <CatalogFilterChips
          id={controlId}
          label={chipsField.label}
          selectionMode="single-required"
          value={chipValue}
          options={options}
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
    <div className={filterBarControlVariants({ type: 'chips' })}>
      <CatalogFilterChips
        id={controlId}
        label={chipsField.label}
        selectionMode="multiple"
        selectedValues={chipValues}
        options={options}
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

function countPopoverActiveFilters(value: unknown): number {
  if (!value || typeof value !== 'object') return 0
  return Object.values(value).reduce<number>((count, entry) => {
    if (Array.isArray(entry)) return count + entry.length
    return count
  }, 0)
}

function CatalogFilterPopoverField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  state,
  optionsContext,
  disabled,
  onValueChange,
}: {
  field: PopoverFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  state: TState
  optionsContext: FilterFieldOptionsContext<TData, TState>
  disabled?: boolean
  onValueChange: CatalogFilterFieldRendererProps<TData, TState>['onValueChange']
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
    <div className={filterBarControlVariants({ type: 'popover' })}>
      <FilterPopover
        triggerLabel={popoverField.triggerLabel(activeCount)}
        triggerAriaLabel={popoverField.triggerAriaLabel ?? popoverField.label}
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

function CatalogFilterBooleanField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  state,
  optionsContext,
  disabled,
  onValueChange,
}: {
  field: BooleanFilterFieldDef<TData, TState, FilterFieldId<TState>>
  controlId: string
  state: TState
  optionsContext: FilterFieldOptionsContext<TData, TState>
  disabled?: boolean
  onValueChange: CatalogFilterFieldRendererProps<TData, TState>['onValueChange']
}) {
  const booleanField = field
  const isChecked = state[booleanField.id] === true
  const hiddenCount = booleanField.hiddenCount?.(state, optionsContext)

  return (
    <div className={filterBarControlVariants({ type: 'boolean' })}>
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
      <label htmlFor={controlId} className="cursor-pointer text-sm font-medium leading-none">
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

export function CatalogFilterField<TData, TState extends Record<string, unknown>>({
  field,
  controlId,
  schema,
  state,
  optionsContext,
  disabled,
  onValueChange,
}: CatalogFilterFieldRendererProps<TData, TState>) {
  if (field.type === 'select') {
    return (
      <CatalogFilterInlineSelectField
        field={field}
        controlId={controlId}
        schema={schema}
        state={state}
        optionsContext={optionsContext}
        onValueChange={onValueChange}
      />
    )
  }

  if (field.type === 'chips') {
    return (
      <CatalogFilterChipsField
        field={field}
        controlId={controlId}
        state={state}
        optionsContext={optionsContext}
        onValueChange={onValueChange}
      />
    )
  }

  if (field.type === 'popover') {
    return (
      <CatalogFilterPopoverField
        field={field}
        controlId={controlId}
        state={state}
        optionsContext={optionsContext}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    )
  }

  if (field.type === 'boolean') {
    return (
      <CatalogFilterBooleanField
        field={field}
        controlId={controlId}
        state={state}
        optionsContext={optionsContext}
        disabled={disabled}
        onValueChange={onValueChange}
      />
    )
  }

  return null
}

export function CatalogFilterFieldList<TData, TState extends Record<string, unknown>>({
  schema,
  fieldIds,
  state,
  data,
  disabled,
  idPrefix,
  onValueChange,
}: {
  schema: FilterSchema<TData, TState>
  fieldIds: FilterFieldId<TState>[]
  state: TState
  data?: readonly TData[]
  disabled?: boolean
  idPrefix: string
  onValueChange: CatalogFilterFieldRendererProps<TData, TState>['onValueChange']
}) {
  const reactId = useId()
  const resolvedIdPrefix = idPrefix || reactId.replace(/:/g, '')
  const optionsContext: FilterFieldOptionsContext<TData, TState> = { data, state }

  return (
    <>
      {fieldIds.map((fieldId) => {
        const field = getFilterFieldById(schema.fields, fieldId)
        if (!field || !isFilterFieldVisible(field, state)) {
          return null
        }

        return (
          <CatalogFilterField
            key={field.id}
            field={field}
            controlId={`${resolvedIdPrefix}-${field.id}`}
            schema={schema}
            state={state}
            optionsContext={optionsContext}
            disabled={isFilterFieldDisabled(field, state, disabled)}
            onValueChange={onValueChange}
          />
        )
      })}
    </>
  )
}
