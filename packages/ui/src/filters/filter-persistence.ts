import { getEffectiveFilterValue } from './filter-engine'
import { createInitialFilterState } from './filter-engine'
import { normalizeTextFilterValue } from './filter-engine.helpers'
import type { FilterFieldDef, FilterSchema } from './filter-schema.types'

const INVALID = Symbol('filter-url-invalid')

export type FilterSearchParamsInput =
  | URLSearchParams
  | Readonly<Record<string, string | string[] | undefined | null>>

function readSearchParam(input: FilterSearchParamsInput, key: string): string | undefined {
  if (input instanceof URLSearchParams) {
    const value = input.get(key)
    return value === null ? undefined : value
  }

  const value = input[key]
  if (value == null) return undefined
  return Array.isArray(value) ? value[0] : value
}

function resolveFilterUrlKey<TData, TState extends Record<string, unknown>>(
  field: FilterFieldDef<TData, TState>,
): string {
  return field.url?.key ?? field.id
}

function defaultIsValueEqual(left: unknown, right: unknown): boolean {
  return Object.is(left, right)
}

function parseTextFieldValue(raw: string): string | undefined {
  return normalizeTextFilterValue(raw)
}

type SelectFieldLike = {
  options: ReadonlyArray<{ value: string; label: string }>
}

function parseSelectFieldValue(field: SelectFieldLike, raw: string): unknown {
  const match = field.options.find((option) => option.value === raw)
  return match ? match.value : INVALID
}

function parseBooleanFieldValue(raw: string): unknown {
  if (raw === 'true') return true
  if (raw === 'false') return false
  return INVALID
}

function parseFieldValueFromUrl<TData, TState extends Record<string, unknown>>(
  field: FilterFieldDef<TData, TState>,
  raw: string,
): unknown {
  if (field.url?.parse) {
    return field.url.parse(raw)
  }

  if (field.type === 'text') {
    return parseTextFieldValue(raw)
  }

  if (field.type === 'select') {
    return parseSelectFieldValue(field, raw)
  }

  return parseBooleanFieldValue(raw)
}

function serializeTextFieldValue(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  return normalizeTextFilterValue(value)
}

function serializeSelectFieldValue(field: SelectFieldLike, value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  return field.options.some((option) => option.value === value) ? value : undefined
}

function serializeBooleanFieldValue(value: unknown): string | undefined {
  if (value === true) return 'true'
  if (value === false) return 'false'
  return undefined
}

function serializeFieldValueToUrl<TData, TState extends Record<string, unknown>>(
  field: FilterFieldDef<TData, TState>,
  value: unknown,
): string | undefined {
  if (field.url?.serialize) {
    return field.url.serialize(value)
  }

  if (field.type === 'text') {
    return serializeTextFieldValue(value)
  }

  if (field.type === 'select') {
    return serializeSelectFieldValue(field, value)
  }

  return serializeBooleanFieldValue(value)
}

function shouldOmitDefault<TData, TState extends Record<string, unknown>>(
  field: FilterFieldDef<TData, TState>,
  value: unknown,
): boolean {
  if (field.url?.omitDefault === false) return false
  const isValueEqual = field.isValueEqual ?? defaultIsValueEqual
  return isValueEqual(value, field.defaultValue)
}

/** Parses filter fields from URL search params. Unknown keys are ignored. */
export function parseFilterSearchParams<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  searchParams: FilterSearchParamsInput,
): Partial<TState> {
  const partial = {} as Partial<TState>

  for (const field of schema.fields) {
    const raw = readSearchParam(searchParams, resolveFilterUrlKey(field))
    if (raw === undefined) continue

    const parsed = parseFieldValueFromUrl(field, raw)

    if (parsed === INVALID) {
      if (field.defaultValue !== undefined) {
        partial[field.id] = field.defaultValue
      }
      continue
    }

    if (parsed === undefined) {
      if (field.defaultValue !== undefined) {
        partial[field.id] = field.defaultValue
      }
      continue
    }

    partial[field.id] = parsed as TState[typeof field.id]
  }

  return partial
}

/** Serializes filter state into URL search params. Omits schema defaults by default. */
export function serializeFilterSearchParams<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  state: TState,
): URLSearchParams {
  const params = new URLSearchParams()

  for (const field of schema.fields) {
    const effective = getEffectiveFilterValue(schema, state, field.id)
    if (effective === undefined) continue
    if (shouldOmitDefault(field, effective)) continue

    const serialized = serializeFieldValueToUrl(field, effective)
    if (serialized === undefined) continue

    params.set(resolveFilterUrlKey(field), serialized)
  }

  return params
}

/** Merges schema defaults with URL-parsed filter overrides. */
export function hydrateFilterState<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  searchParams: FilterSearchParamsInput,
): TState {
  return {
    ...createInitialFilterState(schema),
    ...parseFilterSearchParams(schema, searchParams),
  }
}
