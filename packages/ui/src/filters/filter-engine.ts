import type {
  FilterFieldDef,
  FilterFieldId,
  FilterPlacement,
  FilterSchema,
} from './filter-schema.types'

function getFieldDef<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  id: FilterFieldId<TState>,
): FilterFieldDef<TData, TState> {
  const field = schema.fields.find((candidate) => candidate.id === id)
  if (!field) {
    throw new Error(`Unknown filter field id: ${id}`)
  }
  return field
}

/** Default placement: text/select → primary; boolean → advanced. */
export function resolveFilterFieldPlacement<TData, TState extends Record<string, unknown>>(
  field: FilterFieldDef<TData, TState>,
): FilterPlacement {
  if (field.placement) return field.placement
  return field.type === 'boolean' ? 'advanced' : 'primary'
}

function defaultIsValueConstraining(value: unknown): boolean {
  return value !== undefined
}

function defaultIsValueEqual(left: unknown, right: unknown): boolean {
  return Object.is(left, right)
}

/** Derives initial state from field `defaultValue`s. */
export function createInitialFilterState<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
): TState {
  const state = {} as TState

  for (const field of schema.fields) {
    if (field.defaultValue !== undefined) {
      state[field.id] = field.defaultValue
    }
  }

  return state
}

export function setFilterValue<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  state: TState,
  id: FilterFieldId<TState>,
  value: TState[FilterFieldId<TState>] | undefined,
): TState {
  getFieldDef(schema, id)

  if (value === undefined) {
    const { [id]: _removed, ...rest } = state
    return rest as TState
  }

  return { ...state, [id]: value }
}

/** Restores schema defaults ("Clear filters"). */
export function resetFilterState<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
): TState {
  return createInitialFilterState(schema)
}

export function getEffectiveFilterValue<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  state: TState,
  id: FilterFieldId<TState>,
): TState[FilterFieldId<TState>] | undefined {
  const field = getFieldDef(schema, id)
  const value = state[id]
  if (value !== undefined) return value
  return field.defaultValue
}

export function isFilterConstraining<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  state: TState,
  id: FilterFieldId<TState>,
): boolean {
  const field = getFieldDef(schema, id)
  const effective = getEffectiveFilterValue(schema, state, id)
  const isValueConstraining = field.isValueConstraining ?? defaultIsValueConstraining
  return isValueConstraining(effective)
}

export function isFilterModified<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  state: TState,
  id: FilterFieldId<TState>,
): boolean {
  const field = getFieldDef(schema, id)
  const effective = getEffectiveFilterValue(schema, state, id)
  const isValueEqual = field.isValueEqual ?? defaultIsValueEqual
  return !isValueEqual(effective, field.defaultValue)
}

export function countModifiedFilters<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  state: TState,
  placement?: FilterPlacement,
): number {
  return schema.fields.filter((field) => {
    if (placement && resolveFilterFieldPlacement(field) !== placement) return false
    return isFilterModified(schema, state, field.id)
  }).length
}

export function applyFilterSchema<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  state: TState,
  rows: TData[],
): TData[] {
  return rows.filter((row) =>
    schema.fields.every((field) => {
      const effective = getEffectiveFilterValue(schema, state, field.id)
      if (effective === undefined) return true
      if (!isFilterConstraining(schema, state, field.id)) return true
      return field.matches(row, effective, state)
    }),
  )
}
