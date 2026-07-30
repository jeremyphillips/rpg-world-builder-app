export type FilterFieldId<TState> = Extract<keyof TState, string>

export type FilterPlacement = 'primary' | 'advanced'

/** Intrinsic width tokens for inline filter select controls. */
export type FilterFieldWidth = 'md' | 'lg' | 'xl'

/** Filter control spacing and typography — mirrors form `rhythm`. */
export type FilterDensity = 'compact' | 'comfortable'

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

export type FilterFieldOptionsContext<TData, TState extends Record<string, unknown>> = {
  data?: readonly TData[]
  state: TState
}

export type FilterChangeContext<TState extends Record<string, unknown>> = {
  changedId: FilterFieldId<TState>
  previous: TState
}

export type FilterSanitizeContext<TData, TState extends Record<string, unknown>> = {
  data?: readonly TData[]
  state: TState
}

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

export type SelectFilterLayout = 'stacked' | 'inline'

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
  options:
    | FilterOption<Extract<NonNullable<TState[TId]>, string>>[]
    | ((ctx: FilterFieldOptionsContext<TData, TState>) => FilterOption<string>[])
  showAllOption?: boolean
  allOptionLabel?: string
  layout?: SelectFilterLayout
  width?: FilterFieldWidth
  ariaLabel?: string
  triggerAriaLabel?: string
}

export type BooleanFilterFieldDef<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
> = BaseFilterFieldDef<TData, TState, TId> & {
  type: 'boolean'
  hiddenCount?: (state: TState, ctx: FilterFieldOptionsContext<TData, TState>) => number | undefined
}

export type ChipsSelectionMode = 'multiple' | 'single-required'

export type ChipsFilterFieldDef<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
> = BaseFilterFieldDef<TData, TState, TId> & {
  type: 'chips'
  selectionMode: ChipsSelectionMode
  options:
    | FilterOption<string>[]
    | ((ctx: FilterFieldOptionsContext<TData, TState>) => FilterOption<string>[])
  /** Renderer-only sentinel for "All" chip in multiple mode — never stored in state. */
  allValue?: string
  toChipValues?: (value: TState[TId] | undefined) => string[]
  fromChipValues?: (
    current: TState[TId] | undefined,
    next: string[],
    ctx: FilterFieldOptionsContext<TData, TState>,
  ) => TState[TId] | undefined
}

export type PopoverGroupDef<TGroupId extends string = string> = {
  id: TGroupId
  label: string
  options: FilterOption<string>[]
}

export type PopoverFilterFieldDef<
  TData,
  TState extends Record<string, unknown>,
  TId extends FilterFieldId<TState>,
> = BaseFilterFieldDef<TData, TState, TId> & {
  type: 'popover'
  triggerLabel: (activeCount: number) => string
  triggerAriaLabel?: string
  groups: PopoverGroupDef[] | ((ctx: FilterFieldOptionsContext<TData, TState>) => PopoverGroupDef[])
}

export type FilterFieldDef<TData, TState extends Record<string, unknown>> =
  | TextFilterFieldDef<TData, TState, FilterFieldId<TState>>
  | SelectFilterFieldDef<TData, TState, FilterFieldId<TState>>
  | BooleanFilterFieldDef<TData, TState, FilterFieldId<TState>>
  | ChipsFilterFieldDef<TData, TState, FilterFieldId<TState>>
  | PopoverFilterFieldDef<TData, TState, FilterFieldId<TState>>

/** Explicit row availability predicate for overview hidden-count chrome. */
export type FilterAvailabilityConfig<TData> = {
  isAvailable: (row: TData) => boolean
}

export type FilterSchema<TData, TState extends Record<string, unknown>> = {
  fields: ReadonlyArray<FilterFieldDef<TData, TState>>
  /** When set, catalog overview shells can derive hidden unavailable counts. */
  availability?: FilterAvailabilityConfig<TData>
  sanitizeState?: (
    state: Partial<TState>,
    context?: FilterSanitizeContext<TData, TState>,
  ) => Partial<TState>
  normalizeChange?: (next: TState, context: FilterChangeContext<TState>) => TState
}

export type FilterCatalogLayoutConfig<TState extends Record<string, unknown>> = {
  primaryFieldIds?: FilterFieldId<TState>[]
  filterRowFieldIds?: FilterFieldId<TState>[]
  /** Dev-only: warn when schema fields are omitted from all layout groups */
  exhaustive?: boolean
}

type CreateFilterSchemaOptions<TData, TState extends Record<string, unknown>> = {
  availability?: FilterAvailabilityConfig<TData>
  sanitizeState?: FilterSchema<TData, TState>['sanitizeState']
  normalizeChange?: FilterSchema<TData, TState>['normalizeChange']
}

/** Builds a filter schema from field definitions. */
export function createFilterSchema<TData, TState extends Record<string, unknown>>(
  fields: ReadonlyArray<FilterFieldDef<TData, TState>>,
  options?: CreateFilterSchemaOptions<TData, TState>,
): FilterSchema<TData, TState> {
  return {
    fields,
    availability: options?.availability,
    sanitizeState: options?.sanitizeState,
    normalizeChange: options?.normalizeChange,
  }
}
