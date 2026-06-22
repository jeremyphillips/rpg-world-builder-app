import { useCallback, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

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
}

/** Resolves the effective selection: null when empty, else clamped in range. */
function resolveSelectedIndex(selected: number | null, length: number): number | null {
  if (length === 0) return null
  if (selected === null || selected < 0) return 0
  if (selected > length - 1) return length - 1
  return selected
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
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })
  const [rawSelected, setRawSelected] = useState<number | null>(null)
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null)

  const selectedIndex = resolveSelectedIndex(rawSelected, fields.length)

  const select = useCallback((index: number) => setRawSelected(index), [])

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
  }
}
