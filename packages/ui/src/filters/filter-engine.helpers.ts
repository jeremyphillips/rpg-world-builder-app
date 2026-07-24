import type {
  BooleanFilterFieldDef,
  ChipsFilterFieldDef,
  FilterFieldDef,
  FilterFieldId,
  FilterOption,
  FilterPlacement,
  PopoverFilterFieldDef,
  PopoverGroupDef,
  SelectFilterFieldDef,
  TextFilterFieldDef,
} from './filter-schema.types'

/** Shallow array equality for chip/multi-select filter state. */
export function shallowArrayEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (!Array.isArray(left) || !Array.isArray(right)) return false
  if (left.length !== right.length) return false
  return left.every((item, index) => Object.is(item, right[index]))
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.length > 0
}

/** True when any popover group has selected values. */
export function isPopoverFiltersConstraining(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  return Object.values(value).some(isNonEmptyStringArray)
}

/** Deep equality for popover group record state. */
export function popoverFiltersEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true
  if (!left || !right || typeof left !== 'object' || typeof right !== 'object') return false

  const leftRecord = left as Record<string, unknown>
  const rightRecord = right as Record<string, unknown>
  const keys = new Set([...Object.keys(leftRecord), ...Object.keys(rightRecord)])

  for (const key of keys) {
    const leftValue = leftRecord[key]
    const rightValue = rightRecord[key]
    if (!shallowArrayEqual(leftValue ?? [], rightValue ?? [])) return false
  }

  return true
}

/** Trims text; whitespace-only becomes unset. */
export function normalizeTextFilterValue(value: string | undefined): string | undefined {
  if (value === undefined) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed
}

function isTextValueConstraining(value: unknown): boolean {
  if (value === undefined) return false
  if (typeof value !== 'string') return true
  return value.trim().length > 0
}

type TextFilterConfig<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
> = {
  id: TId
  label: string
  placeholder?: string
  placement?: FilterPlacement
  defaultValue?: TState[TId]
  visible?: (state: TState) => boolean
  disabled?: (state: TState) => boolean
  getSearchText: (row: TData) => string | readonly string[]
  url?: TextFilterFieldDef<TData, TState, TId>['url']
}

export function createTextFilter<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
>(config: TextFilterConfig<TData, TState, TId>): FilterFieldDef<TData, TState> {
  return {
    type: 'text',
    id: config.id,
    label: config.label,
    placeholder: config.placeholder,
    placement: config.placement,
    defaultValue: config.defaultValue,
    visible: config.visible,
    disabled: config.disabled,
    url: config.url,
    isValueConstraining: isTextValueConstraining,
    matches: (row, value) => {
      const query = normalizeTextFilterValue(
        typeof value === 'string' ? value : undefined,
      )?.toLocaleLowerCase()
      if (!query) return true

      const searchText = config.getSearchText(row)
      const parts = Array.isArray(searchText) ? searchText : [searchText]
      return parts.some((part) => part.toLocaleLowerCase().includes(query))
    },
  } satisfies FilterFieldDef<TData, TState>
}

type EqualsFilterConfig<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
  TValue extends Extract<NonNullable<TState[TId]>, string>,
> = {
  id: TId
  label: string
  options: FilterOption<TValue>[]
  getValue: (row: TData) => TValue
  placement?: FilterPlacement
  defaultValue?: TState[TId]
  showAllOption?: boolean
  layout?: SelectFilterFieldDef<TData, TState, TId>['layout']
  ariaLabel?: string
  triggerAriaLabel?: string
  visible?: (state: TState) => boolean
  disabled?: (state: TState) => boolean
  isValueConstraining?: SelectFilterFieldDef<TData, TState, TId>['isValueConstraining']
  isValueEqual?: SelectFilterFieldDef<TData, TState, TId>['isValueEqual']
  url?: SelectFilterFieldDef<TData, TState, TId>['url']
}

export function createEqualsFilter<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
  TValue extends Extract<NonNullable<TState[TId]>, string>,
>(config: EqualsFilterConfig<TData, TState, TId, TValue>): FilterFieldDef<TData, TState> {
  return {
    type: 'select',
    id: config.id,
    label: config.label,
    options: config.options,
    placement: config.placement,
    defaultValue: config.defaultValue,
    showAllOption: config.showAllOption,
    layout: config.layout,
    ariaLabel: config.ariaLabel,
    triggerAriaLabel: config.triggerAriaLabel,
    visible: config.visible,
    disabled: config.disabled,
    isValueConstraining: config.isValueConstraining,
    isValueEqual: config.isValueEqual,
    url: config.url,
    matches: (row, value) => config.getValue(row) === value,
  } satisfies FilterFieldDef<TData, TState>
}

type BooleanFilterConfig<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
> = {
  id: TId
  label: string
  getValue: (row: TData) => boolean
  placement?: FilterPlacement
  defaultValue?: TState[TId]
  visible?: (state: TState) => boolean
  disabled?: (state: TState) => boolean
  hiddenCount?: BooleanFilterFieldDef<TData, TState, TId>['hiddenCount']
  url?: BooleanFilterFieldDef<TData, TState, TId>['url']
}

export function createBooleanFilter<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
>(config: BooleanFilterConfig<TData, TState, TId>): FilterFieldDef<TData, TState> {
  return {
    type: 'boolean',
    id: config.id,
    label: config.label,
    placement: config.placement ?? 'advanced',
    defaultValue: config.defaultValue,
    visible: config.visible,
    disabled: config.disabled,
    hiddenCount: config.hiddenCount,
    url: config.url,
    matches: (row, value) => config.getValue(row) === value,
  } satisfies FilterFieldDef<TData, TState>
}

type ChipsFilterConfig<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
> = {
  id: TId
  label: string
  selectionMode: ChipsFilterFieldDef<TData, TState, TId>['selectionMode']
  options: FilterOption<string>[] | ChipsFilterFieldDef<TData, TState, TId>['options']
  placement?: FilterPlacement
  defaultValue?: TState[TId]
  allValue?: string
  visible?: (state: TState) => boolean
  disabled?: (state: TState) => boolean
  isValueConstraining?: ChipsFilterFieldDef<TData, TState, TId>['isValueConstraining']
  isValueEqual?: ChipsFilterFieldDef<TData, TState, TId>['isValueEqual']
  toChipValues?: ChipsFilterFieldDef<TData, TState, TId>['toChipValues']
  fromChipValues?: ChipsFilterFieldDef<TData, TState, TId>['fromChipValues']
  matches: ChipsFilterFieldDef<TData, TState, TId>['matches']
}

export function createChipsFilter<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
>(config: ChipsFilterConfig<TData, TState, TId>): FilterFieldDef<TData, TState> {
  return {
    type: 'chips',
    id: config.id,
    label: config.label,
    selectionMode: config.selectionMode,
    options: config.options,
    placement: config.placement,
    defaultValue: config.defaultValue,
    allValue: config.allValue,
    visible: config.visible,
    disabled: config.disabled,
    isValueConstraining: config.isValueConstraining,
    isValueEqual: config.isValueEqual,
    toChipValues: config.toChipValues as unknown as ChipsFilterFieldDef<
      TData,
      TState,
      FilterFieldId<TState>
    >['toChipValues'],
    fromChipValues: config.fromChipValues as unknown as ChipsFilterFieldDef<
      TData,
      TState,
      FilterFieldId<TState>
    >['fromChipValues'],
    matches: config.matches,
  } satisfies FilterFieldDef<TData, TState>
}

type PopoverFilterConfig<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
> = {
  id: TId
  label: string
  triggerLabel: PopoverFilterFieldDef<TData, TState, TId>['triggerLabel']
  triggerAriaLabel?: string
  groups: PopoverGroupDef[] | PopoverFilterFieldDef<TData, TState, TId>['groups']
  placement?: FilterPlacement
  defaultValue?: TState[TId]
  visible?: (state: TState) => boolean
  disabled?: (state: TState) => boolean
  isValueConstraining?: PopoverFilterFieldDef<TData, TState, TId>['isValueConstraining']
  isValueEqual?: PopoverFilterFieldDef<TData, TState, TId>['isValueEqual']
  matches: PopoverFilterFieldDef<TData, TState, TId>['matches']
}

export function createPopoverFilter<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
>(config: PopoverFilterConfig<TData, TState, TId>): FilterFieldDef<TData, TState> {
  return {
    type: 'popover',
    id: config.id,
    label: config.label,
    triggerLabel: config.triggerLabel,
    triggerAriaLabel: config.triggerAriaLabel,
    groups: config.groups,
    placement: config.placement,
    defaultValue: config.defaultValue,
    visible: config.visible,
    disabled: config.disabled,
    isValueConstraining: config.isValueConstraining ?? isPopoverFiltersConstraining,
    isValueEqual: config.isValueEqual ?? popoverFiltersEqual,
    matches: config.matches,
  } satisfies FilterFieldDef<TData, TState>
}
