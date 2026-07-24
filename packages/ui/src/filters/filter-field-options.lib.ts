import type {
  ChipsFilterFieldDef,
  FilterFieldDef,
  FilterFieldId,
  FilterFieldOptionsContext,
  FilterOption,
  PopoverFilterFieldDef,
  PopoverGroupDef,
  SelectFilterFieldDef,
} from './filter-schema.types'

export function resolveFilterFieldOptions<TData, TState extends Record<string, unknown>>(
  field: SelectFilterFieldDef<TData, TState, FilterFieldId<TState>>,
  ctx: FilterFieldOptionsContext<TData, TState>,
): FilterOption<string>[] {
  return typeof field.options === 'function' ? field.options(ctx) : field.options
}

export function resolveChipsFieldOptions<TData, TState extends Record<string, unknown>>(
  field: ChipsFilterFieldDef<TData, TState, FilterFieldId<TState>>,
  ctx: FilterFieldOptionsContext<TData, TState>,
): FilterOption<string>[] {
  return typeof field.options === 'function' ? field.options(ctx) : field.options
}

export function resolvePopoverFieldGroups<TData, TState extends Record<string, unknown>>(
  field: PopoverFilterFieldDef<TData, TState, FilterFieldId<TState>>,
  ctx: FilterFieldOptionsContext<TData, TState>,
): PopoverGroupDef[] {
  return typeof field.groups === 'function' ? field.groups(ctx) : field.groups
}

export function getFilterFieldById<TData, TState extends Record<string, unknown>>(
  fields: ReadonlyArray<FilterFieldDef<TData, TState>>,
  id: FilterFieldId<TState>,
): FilterFieldDef<TData, TState> | undefined {
  return fields.find((field) => field.id === id)
}
