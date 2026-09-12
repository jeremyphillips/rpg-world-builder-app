import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import {
  applyFieldIndexPermutation,
  computeNormalizedFieldOrder,
  type NormalizeFieldOrderOptions,
} from './master-detail-normalize-order'
import { isValidFieldArrayMove } from './master-detail-reorder'
import {
  autoSelectFirstInvalid,
  findIndexByFieldId,
  resolveSelectedIndex,
  rowHasError,
} from './master-detail-selection'

export interface UseMasterDetailArrayResult {
  /** Field-array rows from RHF; each carries a stable `id` for React keys. */
  fields: Array<Record<'id', string>>
  /** Stable RHF field id for the selected row, or `null` when none. */
  selectedFieldId: string | null
  /** Currently selected row index derived from `selectedFieldId`, or `null` when empty. */
  selectedIndex: number | null
  select: (index: number) => void
  /** Appends a row built from `makeItemDefaults` and selects it by field id. */
  handleAdd: () => void
  /** Field id of the most recently appended row until consumed by the detail panel. */
  lastAddedFieldId: string | null
  clearLastAddedFieldId: () => void
  /** Row index pending delete confirmation, or `null` when no dialog is open. */
  deleteIndex: number | null
  /** Opens the delete-confirmation flow for a row. */
  requestRemove: (index: number) => void
  /** Dismisses the delete-confirmation flow without removing anything. */
  cancelRemove: () => void
  /** Removes the row pending confirmation and clamps the selection. */
  confirmRemove: () => void
  /** Whether the row at `index` has validation errors in the parent form. */
  hasRowError: (index: number) => boolean
  /** Selects the first row with validation errors for `name`, if any. */
  autoSelectFirstInvalid: () => void
  /** Moves a row from one index to another via `useFieldArray().move`. */
  move: (from: number, to: number) => void
  /** Moves a row up one position; no-op at the first row. */
  moveUp: (index: number) => void
  /** Moves a row down one position; no-op at the last row. */
  moveDown: (index: number) => void
  /**
   * Reorders the field array with a stable equal-key policy. Selection follows
   * the stable field id across moves.
   */
  normalizeOrder: (
    compareRows: (left: unknown, right: unknown) => number,
    options?: NormalizeFieldOrderOptions,
  ) => void
}

/**
 * Presentation-only master-detail state over a parent form field array. Binds
 * to the enclosing `FormProvider` via `useFieldArray`, so values, validation,
 * and global save are owned by the parent form — this hook only tracks which
 * row is selected and which is pending delete. Selection is keyed by stable
 * RHF field id so reordering never loses the active row.
 */
export function useMasterDetailArray(
  name: string,
  makeItemDefaults: () => Record<string, unknown>,
): UseMasterDetailArrayResult {
  const {
    control,
    getValues,
    formState: { errors, submitCount },
  } = useFormContext()
  const { fields, append, remove, move: fieldArrayMove } = useFieldArray({ control, name })
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [pendingSelectIndex, setPendingSelectIndex] = useState<number | null>(null)
  const [consumedAddedFieldId, setConsumedAddedFieldId] = useState<string | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const selectedIndex = useMemo(() => {
    if (fields.length === 0) return null
    if (pendingSelectIndex !== null) {
      return resolveSelectedIndex(pendingSelectIndex, fields.length)
    }
    const byId = findIndexByFieldId(fields, selectedFieldId)
    if (byId !== null) return byId
    return resolveSelectedIndex(0, fields.length)
  }, [fields, pendingSelectIndex, selectedFieldId])

  const resolvedSelectedFieldId = useMemo(() => {
    if (selectedIndex === null) return null
    return fields[selectedIndex]?.id ?? null
  }, [fields, selectedIndex])

  const lastAddedFieldId = useMemo(() => {
    if (pendingSelectIndex === null || selectedIndex === null) return null
    const fieldId = fields[selectedIndex]?.id ?? null
    if (!fieldId || fieldId === consumedAddedFieldId) return null
    return fieldId
  }, [consumedAddedFieldId, fields, pendingSelectIndex, selectedIndex])

  const select = useCallback(
    (index: number) => {
      setPendingSelectIndex(null)
      const field = fields[index]
      if (field) setSelectedFieldId(field.id)
    },
    [fields],
  )

  const hasRowError = useCallback(
    (index: number) => rowHasError(errors, name, index),
    [errors, name],
  )

  const autoSelectFirstInvalidForField = useCallback(() => {
    autoSelectFirstInvalid(errors, name, fields, setSelectedFieldId)
  }, [errors, fields, name])

  useEffect(() => {
    if (submitCount === 0) return
    autoSelectFirstInvalid(errors, name, fields, setSelectedFieldId)
  }, [errors, fields, name, submitCount])

  const handleAdd = useCallback(() => {
    setPendingSelectIndex(fields.length)
    append(makeItemDefaults())
  }, [append, fields.length, makeItemDefaults])

  const clearLastAddedFieldId = useCallback(() => {
    if (lastAddedFieldId) setConsumedAddedFieldId(lastAddedFieldId)
    setPendingSelectIndex(null)
    if (resolvedSelectedFieldId) setSelectedFieldId(resolvedSelectedFieldId)
  }, [lastAddedFieldId, resolvedSelectedFieldId])

  const requestRemove = useCallback((index: number) => setDeleteIndex(index), [])

  const cancelRemove = useCallback(() => setDeleteIndex(null), [])

  const confirmRemove = useCallback(() => {
    if (deleteIndex === null) return
    const removedFieldId = fields[deleteIndex]?.id
    remove(deleteIndex)
    setSelectedFieldId((current) => {
      if (current !== removedFieldId) return current
      if (fields.length <= 1) return null
      if (deleteIndex > 0) return fields[deleteIndex - 1]?.id ?? null
      return fields[1]?.id ?? null
    })
    setDeleteIndex(null)
  }, [deleteIndex, fields, remove])

  const move = useCallback(
    (from: number, to: number) => {
      if (!isValidFieldArrayMove(from, to, fields.length)) return
      fieldArrayMove(from, to)
    },
    [fieldArrayMove, fields.length],
  )

  const normalizeOrder = useCallback(
    (
      compareRows: (left: unknown, right: unknown) => number,
      options?: NormalizeFieldOrderOptions,
    ) => {
      const values = getValues(name) as unknown[] | undefined
      if (!values || values.length <= 1) return

      const targetOrder = computeNormalizedFieldOrder(
        values.length,
        (leftIndex, rightIndex) => compareRows(values[leftIndex], values[rightIndex]),
        (index) => fields[index]?.id ?? String(index),
        options,
      )

      applyFieldIndexPermutation(fieldArrayMove, values.length, targetOrder)
    },
    [fieldArrayMove, fields, getValues, name],
  )

  const moveUp = useCallback(
    (index: number) => {
      if (index > 0) move(index, index - 1)
    },
    [move],
  )

  const moveDown = useCallback(
    (index: number) => {
      if (index < fields.length - 1) move(index, index + 1)
    },
    [fields.length, move],
  )

  return {
    fields,
    selectedFieldId: resolvedSelectedFieldId,
    selectedIndex,
    select,
    handleAdd,
    lastAddedFieldId,
    clearLastAddedFieldId,
    deleteIndex,
    requestRemove,
    cancelRemove,
    confirmRemove,
    hasRowError,
    autoSelectFirstInvalid: autoSelectFirstInvalidForField,
    move,
    moveUp,
    moveDown,
    normalizeOrder,
  }
}
