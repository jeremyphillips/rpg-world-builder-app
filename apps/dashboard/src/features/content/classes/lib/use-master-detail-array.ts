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
  /** Removes the row at `index`, clamping the selection to a valid row. */
  handleRemove: (index: number) => void
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
 * row is selected for editing. The selection is derived (clamped in range) so
 * adding/removing rows never leaves a stale index.
 */
export function useMasterDetailArray(
  name: string,
  makeItemDefaults: () => Record<string, unknown>,
): UseMasterDetailArrayResult {
  const { control } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })
  const [rawSelected, setRawSelected] = useState<number | null>(null)

  const selectedIndex = resolveSelectedIndex(rawSelected, fields.length)

  const select = useCallback((index: number) => setRawSelected(index), [])

  const handleAdd = useCallback(() => {
    append(makeItemDefaults())
    setRawSelected(fields.length)
  }, [append, makeItemDefaults, fields.length])

  const handleRemove = useCallback(
    (index: number) => {
      remove(index)
      setRawSelected((current) => {
        if (current === null) return null
        return index < current ? current - 1 : current
      })
    },
    [remove],
  )

  return { fields, selectedIndex, select, handleAdd, handleRemove }
}
