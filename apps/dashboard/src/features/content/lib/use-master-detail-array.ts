import { useCallback, useEffect, useState } from 'react'
import { useFieldArray, useFormContext, type FieldErrors } from 'react-hook-form'

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
}

/** Resolves the effective selection: null when empty, else clamped in range. */
function resolveSelectedIndex(selected: number | null, length: number): number | null {
  if (length === 0) return null
  if (selected === null || selected < 0) return 0
  if (selected > length - 1) return length - 1
  return selected
}

function rowHasError(errors: FieldErrors, name: string, index: number): boolean {
  const arrayErrors = errors[name]
  if (arrayErrors == null) return false

  if (Array.isArray(arrayErrors)) {
    const rowError = arrayErrors[index]
    return rowError != null && typeof rowError === 'object'
  }

  if (typeof arrayErrors === 'object') {
    const rowError = (arrayErrors as Record<number, unknown>)[index]
    return rowError != null && typeof rowError === 'object'
  }

  return false
}

/** Returns the first array index with row-level errors, or `null` when none. */
export function findFirstInvalidRowIndex(errors: FieldErrors, name: string): number | null {
  const arrayErrors = errors[name]
  if (arrayErrors == null) return null

  if (Array.isArray(arrayErrors)) {
    const index = arrayErrors.findIndex(
      (rowError) => rowError != null && typeof rowError === 'object',
    )
    return index >= 0 ? index : null
  }

  if (typeof arrayErrors === 'object') {
    const indices = Object.keys(arrayErrors)
      .map(Number)
      .filter((n) => !Number.isNaN(n))
      .sort((a, b) => a - b)

    for (const index of indices) {
      const rowError = (arrayErrors as Record<number, unknown>)[index]
      if (rowError != null && typeof rowError === 'object') return index
    }
  }

  return null
}

export function autoSelectFirstInvalid(
  errors: FieldErrors,
  name: string,
  select: (index: number) => void,
): void {
  const index = findFirstInvalidRowIndex(errors, name)
  if (index !== null) select(index)
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
  const { fields, append, remove } = useFieldArray({ control, name })
  const [rawSelected, setRawSelected] = useState<number | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

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
    setRawSelected((current) => {
      if (current === null) return null
      return deleteIndex < current ? current - 1 : current
    })
    setDeleteIndex(null)
  }, [deleteIndex, remove])

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
  }
}
