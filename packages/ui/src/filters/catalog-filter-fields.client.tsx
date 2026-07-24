'use client'

import { useId } from 'react'

import { getFilterFieldById } from './filter-field-options.lib'
import { FilterFieldList } from './filter-fields.client'
import type { FilterFieldId, FilterSchema } from './filter-schema.types'
import type { FilterRenderContext } from './filter-field-renderer.client'

type CatalogFilterFieldListProps<TData, TState extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TState>
  fieldIds: FilterFieldId<TState>[]
  state: TState
  data?: readonly TData[]
  disabled?: boolean
  idPrefix: string
  onValueChange: FilterRenderContext<TData, TState>['onValueChange']
}

export function CatalogFilterFieldList<TData, TState extends Record<string, unknown>>({
  schema,
  fieldIds,
  state,
  data,
  disabled,
  idPrefix,
  onValueChange,
}: CatalogFilterFieldListProps<TData, TState>) {
  const reactId = useId()
  const resolvedIdPrefix = idPrefix || reactId.replace(/:/g, '')
  const fields = fieldIds
    .map((fieldId) => getFilterFieldById(schema.fields, fieldId))
    .filter((field): field is NonNullable<typeof field> => field != null)

  return (
    <FilterFieldList
      schema={schema}
      fields={fields}
      state={state}
      data={data}
      disabled={disabled}
      idPrefix={resolvedIdPrefix}
      onValueChange={onValueChange}
    />
  )
}

/**
 * @deprecated Use `FilterFieldRenderer` with a `FilterRenderContext` instead.
 */
export { FilterFieldRenderer as CatalogFilterField } from './filter-field-renderer.client'
