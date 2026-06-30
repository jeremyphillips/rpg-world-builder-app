import { useCallback, useEffect, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

import { isContentRowActive, resolveMasterDetailRowKey } from './content-campaign-availability'
import {
  isValidFieldArrayMove,
  resolveSelectedIndexAfterMove,
  resolveSelectedIndexAfterRemove,
} from './master-detail-reorder'
import {
  autoSelectFirstInvalid,
  resolveSelectedIndex,
  rowHasError,
} from './master-detail-selection'

export interface UseMasterDetailArrayResult {
  /** Field-array rows from RHF; each carries a stable `id` for React keys. */
  fields: Array<Record<'id', string>>
  /** Currently selected row index, or `null` when the array is empty. */
  selectedIndex: number | null
  select: (index: number) => void
  /** Appends a row built from `makeItemDefaults` and selects it. */
  handleAdd: () => void
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
  /** Local per-row campaign availability; default is active. Not persisted yet. */
  activeById: Record<string, boolean>
  /** Whether the row at `index` is active in the current campaign. */
  isRowActive: (index: number, row?: { id?: string }) => boolean
  /** Updates campaign availability for a row key. */
  setRowActive: (rowKey: string, active: boolean) => void
}

/**
 * Presentation-only master-detail state over a parent form field array. Binds
 * to the enclosing `FormProvider` via `useFieldArray`, so values, validation,
 * and global save are owned by the parent form — this hook only tracks which
 * row is selected and which is pending delete. The selection is derived
 * (clamped in range) so adding/removing rows never leaves a stale index.
 *
 * Shared content abstraction: reused by any tab that edits an embedded array as
 * a list + detail (e.g. class features; species traits/heritage next).
 */
export function useMasterDetailArray(
  name: string,
  makeItemDefaults: () => Record<string, unknown>,
): UseMasterDetailArrayResult {
  const {
    control,
    formState: { errors, submitCount },
  } = useFormContext()
  const { fields, append, remove, move: fieldArrayMove } = useFieldArray({ control, name })
  const [rawSelected, setRawSelected] = useState<number | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)
  const [activeById, setActiveById] = useState<Record<string, boolean>>({})

  const selectedIndex = resolveSelectedIndex(rawSelected, fields.length)

  const select = useCallback((index: number) => setRawSelected(index), [])

  const hasRowError = useCallback(
    (index: number) => rowHasError(errors, name, index),
    [errors, name],
  )

  const autoSelectFirstInvalidForField = useCallback(() => {
    autoSelectFirstInvalid(errors, name, setRawSelected)
  }, [errors, name])

  useEffect(() => {
    if (submitCount === 0) return
    autoSelectFirstInvalid(errors, name, setRawSelected)
  }, [errors, name, submitCount])

  const handleAdd = useCallback(() => {
    append(makeItemDefaults())
    setRawSelected(fields.length)
  }, [append, makeItemDefaults, fields.length])

  const requestRemove = useCallback((index: number) => setDeleteIndex(index), [])

  const cancelRemove = useCallback(() => setDeleteIndex(null), [])

  const confirmRemove = useCallback(() => {
    if (deleteIndex === null) return
    remove(deleteIndex)
    setRawSelected((current) => resolveSelectedIndexAfterRemove(current, deleteIndex))
    setDeleteIndex(null)
  }, [deleteIndex, remove])

  const move = useCallback(
    (from: number, to: number) => {
      if (!isValidFieldArrayMove(from, to, fields.length)) return
      fieldArrayMove(from, to)
      setRawSelected((current) => resolveSelectedIndexAfterMove(current, from, to))
    },
    [fieldArrayMove, fields.length],
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

  const setRowActive = useCallback((rowKey: string, active: boolean) => {
    setActiveById((current) => ({ ...current, [rowKey]: active }))
  }, [])

  const isRowActive = useCallback(
    (index: number, row?: { id?: string }) => {
      const field = fields[index]
      if (!field) return true
      return isContentRowActive(activeById, resolveMasterDetailRowKey(field.id, row))
    },
    [activeById, fields],
  )

  return {
    fields,
    selectedIndex,
    select,
    handleAdd,
    deleteIndex,
    requestRemove,
    cancelRemove,
    confirmRemove,
    hasRowError,
    autoSelectFirstInvalid: autoSelectFirstInvalidForField,
    move,
    moveUp,
    moveDown,
    activeById,
    isRowActive,
    setRowActive,
  }
}
