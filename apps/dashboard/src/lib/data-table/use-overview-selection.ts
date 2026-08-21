import { useCallback, useMemo, useState } from 'react'

export type OverviewRowSelectionState = Record<string, boolean>

export type UseOverviewSelectionOptions = {
  visibleRowIds: ReadonlySet<string>
  selectionLimit: number
}

export function useOverviewSelection<T extends { id: string }>({
  visibleRowIds,
  selectionLimit,
}: UseOverviewSelectionOptions) {
  const [selectionMode, setSelectionMode] = useState(false)
  const [rowSelection, setRowSelection] = useState<OverviewRowSelectionState>({})
  const [selectedRows, setSelectedRows] = useState<T[]>([])

  const effectiveRowSelection = useMemo(() => {
    const next = Object.fromEntries(
      Object.entries(rowSelection).filter(([id]) => visibleRowIds.has(id)),
    )
    return Object.keys(next).length === Object.keys(rowSelection).length ? rowSelection : next
  }, [rowSelection, visibleRowIds])

  const effectiveSelectedRows = useMemo(
    () => selectedRows.filter((row) => visibleRowIds.has(row.id)),
    [selectedRows, visibleRowIds],
  )

  const selectedCount = effectiveSelectedRows.length

  const getRowCanSelect = useCallback(
    (row: T) => {
      if (effectiveRowSelection[row.id]) return true
      return selectedCount < selectionLimit
    },
    [effectiveRowSelection, selectedCount, selectionLimit],
  )

  const enterSelectionMode = useCallback(() => {
    setSelectionMode(true)
  }, [])

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false)
    setRowSelection({})
    setSelectedRows([])
  }, [])

  const clearSelection = useCallback(() => {
    setRowSelection({})
    setSelectedRows([])
  }, [])

  const handleRowSelectionChange = useCallback((rows: T[]) => {
    setSelectedRows(rows)
  }, [])

  const handleRowSelectionStateChange = useCallback((state: OverviewRowSelectionState) => {
    setRowSelection(state)
  }, [])

  const removeFromSelection = useCallback((ids: ReadonlyArray<string>) => {
    const removeSet = new Set(ids)
    setRowSelection((current) => {
      const next = { ...current }
      for (const id of ids) {
        delete next[id]
      }
      return next
    })
    setSelectedRows((current) => current.filter((row) => !removeSet.has(row.id)))
  }, [])

  const selectionCapDescriptionId = useMemo(
    () => `overview-selection-cap-${selectionLimit}`,
    [selectionLimit],
  )

  return {
    selectionMode,
    rowSelection: effectiveRowSelection,
    selectedRows: effectiveSelectedRows,
    selectedCount,
    selectionLimit,
    selectionCapDescriptionId,
    getRowCanSelect,
    enterSelectionMode,
    exitSelectionMode,
    clearSelection,
    removeFromSelection,
    onRowSelectionChange: handleRowSelectionChange,
    onRowSelectionStateChange: handleRowSelectionStateChange,
  }
}
