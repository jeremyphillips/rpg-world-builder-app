'use client'

import * as React from 'react'

import type { ArrayConfig, FieldOption } from '../field-config'

export interface ArrayFieldContextValue {
  /** Current array item values from RHF. */
  items: unknown[]
  /** 0-based index of the item being rendered. */
  rowIndex: number
  /** Removes the current row via the parent field array. */
  removeItem?: () => void
  /** Resolved RHF path for the parent array when cascade editing is enabled. */
  fullArrayName?: string
  /** Level-range key names for cascade edits inside level-range tier arrays. */
  levelRangeKeys?: { min: string; max: string }
  /** Optional cross-row select filtering from the parent array config. */
  filterSelectOptions?: ArrayConfig['filterSelectOptions']
  /** Watched form values for `filterSelectDependsOn` keys. */
  watchedValues: Record<string, unknown>
}

export const ArrayFieldContext = React.createContext<ArrayFieldContextValue | null>(null)

export function useArrayFieldContext(): ArrayFieldContextValue | null {
  return React.useContext(ArrayFieldContext)
}

export type FilterSelectOptionsContext = {
  arrayItems: unknown[]
  rowIndex: number
  fieldName: string
  options: FieldOption[]
  watchedValues: Record<string, unknown>
}

/** Applies array-level select filtering when configured. */
export function applyArrayFilterSelectOptions(
  options: readonly FieldOption[],
  fieldName: string,
  context: ArrayFieldContextValue | null,
): FieldOption[] {
  if (!context?.filterSelectOptions) return [...options]

  return context.filterSelectOptions({
    arrayItems: context.items,
    rowIndex: context.rowIndex,
    fieldName,
    options: [...options],
    watchedValues: context.watchedValues,
  })
}
