export type FilterFieldId<TState> = Extract<keyof TState, string>

export type FilterPlacement = 'primary' | 'advanced'

export type FilterOption<TValue extends string = string> = {
  value: TValue
  label: string
}

export type FilterMatchFn<TData, TState extends Record<string, unknown>> = (
  row: TData,
  value: unknown,
  state: TState,
) => boolean

export type FilterValuePredicate = (value: unknown) => boolean

export type FilterValueEquality = (left: unknown, right: unknown) => boolean

type BaseFilterFieldDef<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
> = {
  id: TId
  label: string
  placement?: FilterPlacement
  defaultValue?: TState[TId]
  visible?: (state: TState) => boolean
  disabled?: (state: TState) => boolean

  matches: FilterMatchFn<TData, TState>

  /** Default: value !== undefined */
  isValueConstraining?: FilterValuePredicate

  /** Default: Object.is — needed for M2 arrays/chips without API break */
  isValueEqual?: FilterValueEquality

  url?: {
    key?: string
    omitDefault?: boolean
    parse?: (raw: string) => unknown
    serialize?: (value: unknown) => string | undefined
  }
}

export type TextFilterFieldDef<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
> = BaseFilterFieldDef<TData, TState, TId> & {
  type: 'text'
  placeholder?: string
}

export type SelectFilterFieldDef<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
> = BaseFilterFieldDef<TData, TState, TId> & {
  type: 'select'
  options: FilterOption<Extract<NonNullable<TState[TId]>, string>>[]
  showAllOption?: boolean
}

export type BooleanFilterFieldDef<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
> = BaseFilterFieldDef<TData, TState, TId> & {
  type: 'boolean'
}

export type FilterFieldDef<TData, TState extends Record<string, unknown>> =
  | TextFilterFieldDef<TData, TState, FilterFieldId<TState>>
  | SelectFilterFieldDef<TData, TState, FilterFieldId<TState>>
  | BooleanFilterFieldDef<TData, TState, FilterFieldId<TState>>

export type FilterSchema<TData, TState extends Record<string, unknown>> = {
  fields: ReadonlyArray<FilterFieldDef<TData, TState>>
}

/** Builds a filter schema from field definitions. */
export function createFilterSchema<TData, TState extends Record<string, unknown>>(
  fields: ReadonlyArray<FilterFieldDef<TData, TState>>,
): FilterSchema<TData, TState> {
  return { fields }
}
