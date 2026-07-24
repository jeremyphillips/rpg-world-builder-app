'use client'

import { useId } from 'react'

import { isFilterFieldDisabled, isFilterFieldVisible } from './filter-bar.lib'
import { FilterFieldRenderer, type FilterRenderContext } from './filter-field-renderer.client'
import type { FilterFieldDef, FilterSchema } from './filter-schema.types'

type FilterFieldListProps<TData, TState extends Record<string, unknown>> = {
  schema: FilterSchema<TData, TState>
  fields: FilterFieldDef<TData, TState>[]
  state: TState
  data?: readonly TData[]
  disabled?: boolean
  idPrefix: string
  onValueChange: FilterRenderContext<TData, TState>['onValueChange']
}

export function FilterFieldList<TData, TState extends Record<string, unknown>>({
  schema,
  fields,
  state,
  data,
  disabled,
  idPrefix,
  onValueChange,
}: FilterFieldListProps<TData, TState>) {
  const reactId = useId()
  const resolvedIdPrefix = idPrefix || reactId.replace(/:/g, '')
  const context: FilterRenderContext<TData, TState> = {
    schema,
    state,
    data,
    disabled,
    idPrefix: resolvedIdPrefix,
    onValueChange,
  }

  return (
    <>
      {fields.map((field) => {
        if (!isFilterFieldVisible(field, state)) {
          return null
        }

        return (
          <FilterFieldRenderer
            key={field.id}
            field={field}
            controlId={`${resolvedIdPrefix}-${field.id}`}
            context={{
              ...context,
              disabled: isFilterFieldDisabled(field, state, disabled),
            }}
          />
        )
      })}
    </>
  )
}
