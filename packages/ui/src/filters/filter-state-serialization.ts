import { getEffectiveFilterValue } from './filter-engine'
import type { FilterFieldDef, FilterFieldId, FilterSchema } from './filter-schema.types'

function serializePrimitive(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NaN'
  }
  if (typeof value === 'string') {
    return JSON.stringify(value)
  }
  return JSON.stringify(value)
}

function serializeStringArray(values: readonly unknown[]): string {
  return `[${values.map((entry) => serializePrimitive(entry)).join(',')}]`
}

function serializePopoverValue(value: Record<string, unknown>): string {
  const parts = Object.keys(value)
    .sort((left, right) => left.localeCompare(right))
    .map((key) => {
      const entry = value[key]
      const serialized = Array.isArray(entry)
        ? serializeStringArray(entry)
        : serializePrimitive(entry)
      return `${key}:${serialized}`
    })

  return `{${parts.join(';')}}`
}

function serializeFilterFieldValue<TData, TState extends Record<string, unknown>>(
  field: FilterFieldDef<TData, TState>,
  value: unknown,
): string {
  if (value === undefined) return 'undefined'

  switch (field.type) {
    case 'text':
    case 'select':
    case 'boolean':
      return serializePrimitive(value)
    case 'chips':
      if (Array.isArray(value)) {
        return serializeStringArray(value)
      }
      return serializePrimitive(value)
    case 'popover':
      if (value && typeof value === 'object') {
        return serializePopoverValue(value as Record<string, unknown>)
      }
      return serializePrimitive(value)
    default:
      return serializePrimitive(value)
  }
}

/** Field-aware, order-stable serializer for filter memo keys and comparisons. */
export function stableSerializeFilterState<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
  state: TState,
): string {
  return schema.fields
    .map((field) => {
      const effective = getEffectiveFilterValue(schema, state, field.id as FilterFieldId<TState>)
      return `${String(field.id)}=${serializeFilterFieldValue(field, effective)}`
    })
    .join('\0')
}
