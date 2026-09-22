import { useEffect, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  acknowledgePendingEdgeOps,
  adoptCanonicalEdgeAfterConflict,
  commitRelationshipEdgePendingOps,
  extractStaleRelationshipFromError,
  mergeEdgeRowsPreservingLocalEdits,
  mergeUnconfirmedDesiredEdgeRows,
  pendingEdgeOpsAfterFailedOp,
  reconcileDesiredEdgeChanges,
  relationshipEdgeSyncErrorMessage,
  remapPendingEdgeOpRelationshipId,
  selectNextEdgeOpsForCommit,
  shouldAdoptEdgeServerSnapshot,
  type RelationshipEdgePendingOp,
  type RelationshipEdgeSnapshotRow,
} from './relationship-edge-api-sync.lib'

export type UseRelationshipEdgeApiSyncOptions<
  TFormValues extends Record<string, unknown>,
  TServerSnapshot extends RelationshipEdgeSnapshotRow,
  TFormRow extends RelationshipEdgeSnapshotRow,
> = {
  serverSnapshot: readonly TServerSnapshot[]
  areServerEqual: (left: readonly TServerSnapshot[], right: readonly TServerSnapshot[]) => boolean
  toFormValues: (serverSnapshot: readonly TServerSnapshot[]) => TFormValues
  toSnapshotRows: (serverSnapshot: readonly TServerSnapshot[]) => readonly TServerSnapshot[]
  formFieldName: keyof TFormValues & string
  getFormRows: (formValues: TFormValues) => readonly TFormRow[]
  isRowContentEqual: (confirmed: TServerSnapshot, desired: TFormRow) => boolean
  onAdd: (
    op: RelationshipEdgePendingOp,
    row: TFormRow,
  ) => Promise<{ relationshipId: string } | void>
  onUpdate: (op: RelationshipEdgePendingOp, row: TFormRow) => void | Promise<void>
  onRemove: (op: RelationshipEdgePendingOp, row: TFormRow) => void | Promise<void>
  addErrorFallback: string
  updateErrorFallback?: string
  removeErrorFallback?: string
}

/** Reconciles desired relationship edge form edits against confirmed server snapshots. */
export function useRelationshipEdgeApiSync<
  TFormValues extends Record<string, unknown>,
  TServerSnapshot extends RelationshipEdgeSnapshotRow,
  TFormRow extends RelationshipEdgeSnapshotRow,
>({
  serverSnapshot,
  areServerEqual,
  toFormValues,
  toSnapshotRows,
  formFieldName,
  getFormRows,
  isRowContentEqual,
  onAdd,
  onUpdate,
  onRemove,
  addErrorFallback,
  updateErrorFallback = 'Could not update this relationship.',
  removeErrorFallback = 'Could not remove this relationship.',
}: UseRelationshipEdgeApiSyncOptions<TFormValues, TServerSnapshot, TFormRow>): string | undefined {
  const { control, reset, getValues } = useFormContext<TFormValues>()
  const formItems = useWatch({ control, name: formFieldName as never }) as TFormRow[] | undefined
  const onAddRef = useRef(onAdd)
  const onUpdateRef = useRef(onUpdate)
  const onRemoveRef = useRef(onRemove)
  const serverSnapshotRef = useRef(serverSnapshot)
  const toFormValuesRef = useRef(toFormValues)
  const toSnapshotRowsRef = useRef(toSnapshotRows)
  const getFormRowsRef = useRef(getFormRows)
  const isRowContentEqualRef = useRef(isRowContentEqual)
  const priorServerRef = useRef(serverSnapshot)
  const lastAdoptedServerRowsRef = useRef(toSnapshotRows(serverSnapshot))
  const pendingOpsRef = useRef<RelationshipEdgePendingOp[]>([])
  const inFlightRelationshipIdsRef = useRef<Set<string>>(new Set())
  const syncInFlightRef = useRef(false)
  const [syncError, setSyncError] = useState<string>()
  const [syncEpoch, setSyncEpoch] = useState(0)

  useEffect(() => {
    onAddRef.current = onAdd
    onUpdateRef.current = onUpdate
    onRemoveRef.current = onRemove
    serverSnapshotRef.current = serverSnapshot
    toFormValuesRef.current = toFormValues
    toSnapshotRowsRef.current = toSnapshotRows
    getFormRowsRef.current = getFormRows
    isRowContentEqualRef.current = isRowContentEqual
  })

  useEffect(() => {
    if (syncInFlightRef.current) return

    const confirmedRows = toSnapshotRows(serverSnapshot)
    const serverChanged = !areServerEqual(priorServerRef.current, serverSnapshot)
    const pendingOps = pendingOpsRef.current
    const formValues = getValues()
    let rows = getFormRows(formValues)
    if (formItems) {
      rows = formItems
    }

    if (serverChanged) {
      priorServerRef.current = serverSnapshot

      if (
        shouldAdoptEdgeServerSnapshot({
          serverRows: confirmedRows,
          pendingOps,
          lastAdoptedServerRows: lastAdoptedServerRowsRef.current,
          serverChanged,
        })
      ) {
        pendingOpsRef.current = acknowledgePendingEdgeOps(confirmedRows, pendingOps)
        lastAdoptedServerRowsRef.current = confirmedRows
        const adoptedFormValues = toFormValues(serverSnapshot)
        const serverRows = getFormRows(adoptedFormValues)
        const mergedRows = mergeEdgeRowsPreservingLocalEdits({
          serverRows,
          localRows: rows,
          pendingOps: pendingOpsRef.current,
          isRowContentEqual: (left, right) => JSON.stringify(left) === JSON.stringify(right),
        })
        const items = mergeUnconfirmedDesiredEdgeRows(mergedRows, rows, confirmedRows)
        reset({
          ...adoptedFormValues,
          [formFieldName]: items,
        } as TFormValues)
        setSyncError(undefined)
        rows = items
      }
    }

    const adoptedFormValues = toFormValues(serverSnapshot)
    const serverRows = getFormRows(adoptedFormValues)

    if (JSON.stringify(rows) === JSON.stringify(serverRows) && pendingOpsRef.current.length === 0) {
      return
    }

    const opsToEnqueue = reconcileDesiredEdgeChanges({
      confirmedRows,
      desiredRows: rows,
      pendingOps: pendingOpsRef.current,
      isRowContentEqual: (confirmed, desired) => isRowContentEqual(confirmed, desired),
    })

    const nextOps = selectNextEdgeOpsForCommit(opsToEnqueue, inFlightRelationshipIdsRef.current)
    if (nextOps.length === 0) return

    pendingOpsRef.current = [...pendingOpsRef.current, ...opsToEnqueue]
    syncInFlightRef.current = true
    setSyncError(undefined)

    for (const op of nextOps) {
      inFlightRelationshipIdsRef.current.add(op.relationshipId)
    }

    void (async () => {
      const rowById = new Map(rows.map((row) => [row.relationshipId, row] as const))
      const { failedOp, error } = await commitRelationshipEdgePendingOps(nextOps, {
        onAdd: async (op) => {
          const row = rowById.get(op.relationshipId)
          if (!row) {
            throw new Error(addErrorFallback)
          }
          const result = await onAddRef.current(op, row)
          if (!result?.relationshipId) return
          pendingOpsRef.current = remapPendingEdgeOpRelationshipId(
            pendingOpsRef.current,
            op.relationshipId,
            result.relationshipId,
          )
          const currentValues = getValues()
          const currentRows = getFormRowsRef
            .current(currentValues)
            .map((currentRow) =>
              currentRow.relationshipId === op.relationshipId
                ? { ...currentRow, relationshipId: result.relationshipId }
                : currentRow,
            )
          reset({
            ...currentValues,
            [formFieldName]: currentRows,
          } as TFormValues)
        },
        onUpdate: async (op) => {
          const row = rowById.get(op.relationshipId)
          if (!row) {
            throw new Error(updateErrorFallback)
          }
          await onUpdateRef.current(op, row)
        },
        onRemove: async (op) => {
          const row = rowById.get(op.relationshipId)
          if (!row) {
            throw new Error(removeErrorFallback)
          }
          await onRemoveRef.current(op, row)
        },
      })

      try {
        if (failedOp) {
          const snapshot = serverSnapshotRef.current
          const latestConfirmedRows = toSnapshotRowsRef.current(snapshot)
          const staleRelationship = extractStaleRelationshipFromError(error)
          pendingOpsRef.current = pendingEdgeOpsAfterFailedOp(
            pendingOpsRef.current,
            failedOp,
            latestConfirmedRows,
          )

          const snapshotFormValues = toFormValuesRef.current(snapshot)
          const snapshotRows = getFormRowsRef.current(snapshotFormValues)
          const currentRows = getFormRowsRef.current(getValues())
          const failedRowId = failedOp.relationshipId
          const reconciledRows = currentRows
            .filter((row) => row.relationshipId !== failedRowId)
            .map((row) => {
              if (!staleRelationship || row.relationshipId !== staleRelationship.id) {
                return row
              }
              const canonicalRow = {
                ...row,
                relationshipId: staleRelationship.id,
                revision: staleRelationship.revision,
              }
              return adoptCanonicalEdgeAfterConflict(
                row,
                canonicalRow,
                (left, right) => JSON.stringify(left) === JSON.stringify(right),
              )
            })

          reset({
            ...snapshotFormValues,
            [formFieldName]: mergeUnconfirmedDesiredEdgeRows(
              snapshotRows,
              reconciledRows,
              latestConfirmedRows,
            ),
          } as TFormValues)
          setSyncError(
            relationshipEdgeSyncErrorMessage(
              error,
              failedOp,
              nextOps,
              addErrorFallback,
              updateErrorFallback,
              removeErrorFallback,
            ),
          )
        }
      } finally {
        for (const op of nextOps) {
          inFlightRelationshipIdsRef.current.delete(op.relationshipId)
        }
        syncInFlightRef.current = false
        setSyncEpoch((epoch) => epoch + 1)
      }
    })()
  }, [
    addErrorFallback,
    areServerEqual,
    formFieldName,
    formItems,
    getFormRows,
    getValues,
    isRowContentEqual,
    removeErrorFallback,
    reset,
    serverSnapshot,
    syncEpoch,
    toFormValues,
    toSnapshotRows,
    updateErrorFallback,
  ])

  return syncError
}
