import type { FilterFieldDef, FilterSchema } from './filter-schema.types'

const DATATABLE_INVALID_SELECT_LAYOUTS = new Set(['stacked', 'inline'])

function isDevEnvironment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Datatable filter schemas must not pin select fields to stacked/inline layout.
 * Call from {@link DataTableFilterChrome} — dev throws so misconfiguration is obvious.
 */
export function validateDatatableFilterSchema<TData, TState extends Record<string, unknown>>(
  schema: FilterSchema<TData, TState>,
): void {
  for (const field of schema.fields) {
    if (field.type !== 'select') continue
    const layout = field.layout
    if (layout == null || !DATATABLE_INVALID_SELECT_LAYOUTS.has(layout)) continue

    const message = `[DataTableFilterChrome] Select field "${field.id}" uses layout "${layout}". Datatable filters use floating selects — omit layout or set layout: "floating".`

    if (isDevEnvironment()) {
      console.error(message)
      throw new Error(message)
    }
  }
}

/**
 * Strips select `layout` so region floating presentation applies even when legacy
 * schemas still declare stacked/inline (production policy).
 */
export function prepareDatatableFilterSchemaForRender<
  TData,
  TState extends Record<string, unknown>,
>(schema: FilterSchema<TData, TState>): FilterSchema<TData, TState> {
  let changed = false

  const fields = schema.fields.map((field) => {
    if (field.type !== 'select' || field.layout == null) return field
    changed = true
    const { layout: _layout, ...rest } = field
    return rest as FilterFieldDef<TData, TState>
  })

  if (!changed) return schema

  return {
    ...schema,
    fields,
  }
}
