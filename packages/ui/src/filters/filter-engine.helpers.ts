import type {
  BooleanFilterFieldDef,
  FilterFieldDef,
  FilterFieldId,
  FilterOption,
  FilterPlacement,
  SelectFilterFieldDef,
  TextFilterFieldDef,
} from './filter-schema.types'

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
      const query = normalizeTextFilterValue(typeof value === 'string' ? value : undefined)?.toLocaleLowerCase()
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
>(
  config: EqualsFilterConfig<TData, TState, TId, TValue>,
): FilterFieldDef<TData, TState> {
  return {
    type: 'select',
    id: config.id,
    label: config.label,
    options: config.options,
    placement: config.placement,
    defaultValue: config.defaultValue,
    showAllOption: config.showAllOption,
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
    url: config.url,
    matches: (row, value) => config.getValue(row) === value,
  } satisfies FilterFieldDef<TData, TState>
}
