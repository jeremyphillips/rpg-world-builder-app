import { useEffect, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import {
  acknowledgePendingOps,
  commitRelationshipPendingOps,
  failedSyncFormItems,
  mergeUnconfirmedDesiredItems,
  pendingOpsAfterFailedOp,
  reconcileDesiredChanges,
  relationshipSyncErrorMessage,
  shouldAdoptServerSnapshot,
  type RelationshipPendingOp,
} from './relationship-api-semantic-sync.lib'

export type UseRelationshipApiSemanticSyncOptions<
  TFormValues extends Record<string, unknown>,
  TServerSnapshot,
> = {
  serverSnapshot: readonly TServerSnapshot[]
  areServerEqual: (left: readonly TServerSnapshot[], right: readonly TServerSnapshot[]) => boolean
  toFormValues: (serverSnapshot: readonly TServerSnapshot[]) => TFormValues
  formFieldName: keyof TFormValues & string
  semanticIdKey: string
  getConfirmedIds: (serverSnapshot: readonly TServerSnapshot[]) => readonly string[]
  onAdd: (semanticId: string) => void | Promise<void>
  onRemove?: (semanticId: string) => void | Promise<void>
  addErrorFallback: string
  removeErrorFallback?: string
}

/** Reconciles desired relationship form edits against confirmed server snapshots. */
export function useRelationshipApiSemanticSync<
  TFormValues extends Record<string, unknown>,
  TServerSnapshot,
>({
  serverSnapshot,
  areServerEqual,
  toFormValues,
  formFieldName,
  semanticIdKey,
  getConfirmedIds,
  onAdd,
  onRemove,
  addErrorFallback,
  removeErrorFallback = 'Could not update this relationship.',
}: UseRelationshipApiSemanticSyncOptions<TFormValues, TServerSnapshot>): string | undefined {
  const { control, reset, getValues } = useFormContext<TFormValues>()
  const formItems = useWatch({ control, name: formFieldName as never }) as
    | Record<string, unknown>[]
    | undefined
  const onAddRef = useRef(onAdd)
  const onRemoveRef = useRef(onRemove)
  const serverSnapshotRef = useRef(serverSnapshot)
  const getConfirmedIdsRef = useRef(getConfirmedIds)
  const toFormValuesRef = useRef(toFormValues)
  const priorServerRef = useRef(serverSnapshot)
  const lastAdoptedConfirmedIdsRef = useRef<readonly string[]>(getConfirmedIds(serverSnapshot))
  const pendingOpsRef = useRef<RelationshipPendingOp[]>([])
  const syncInFlightRef = useRef(false)
  const [syncError, setSyncError] = useState<string>()
  const [syncEpoch, setSyncEpoch] = useState(0)

  useEffect(() => {
    onAddRef.current = onAdd
    onRemoveRef.current = onRemove
    serverSnapshotRef.current = serverSnapshot
    getConfirmedIdsRef.current = getConfirmedIds
    toFormValuesRef.current = toFormValues
  })

  useEffect(() => {
    if (syncInFlightRef.current) return

    const confirmedIds = getConfirmedIds(serverSnapshot)
    const serverChanged = !areServerEqual(priorServerRef.current, serverSnapshot)
    const pendingOps = pendingOpsRef.current
    const formValues = getValues()
    let items = (formItems ?? formValues[formFieldName] ?? []) as Record<string, unknown>[]

    if (serverChanged) {
      priorServerRef.current = serverSnapshot

      if (
        shouldAdoptServerSnapshot({
          confirmedIds,
          pendingOps,
          lastAdoptedConfirmedIds: lastAdoptedConfirmedIdsRef.current,
          serverChanged,
        })
      ) {
        pendingOpsRef.current = acknowledgePendingOps(confirmedIds, pendingOps)
        lastAdoptedConfirmedIdsRef.current = confirmedIds
        const adoptedFormValues = toFormValues(serverSnapshot)
        const serverItems = (adoptedFormValues[formFieldName] ?? []) as Record<string, unknown>[]
        items = mergeUnconfirmedDesiredItems(serverItems, items, semanticIdKey, confirmedIds)
        reset({
          ...adoptedFormValues,
          [formFieldName]: items,
        } as TFormValues)
        setSyncError(undefined)
      }
    }

    const desiredIds = items
      .map((item) => item[semanticIdKey])
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
    const serverFormValues = toFormValues(serverSnapshot)
    const serverItems = (serverFormValues[formFieldName] ?? []) as Record<string, unknown>[]

    if (
      JSON.stringify(items) === JSON.stringify(serverItems) &&
      pendingOpsRef.current.length === 0
    ) {
      return
    }

    const opsToEnqueue = reconcileDesiredChanges({
      confirmedIds,
      desiredIds,
      pendingOps: pendingOpsRef.current,
    })

    if (opsToEnqueue.length === 0) return

    pendingOpsRef.current = [...pendingOpsRef.current, ...opsToEnqueue]
    syncInFlightRef.current = true
    setSyncError(undefined)

    void (async () => {
      const { failedOp, error } = await commitRelationshipPendingOps(
        opsToEnqueue,
        (semanticId) => onAddRef.current(semanticId),
        onRemoveRef.current,
        removeErrorFallback,
      )
      try {
        if (!failedOp) return
        const snapshot = serverSnapshotRef.current
        const latestConfirmedIds = getConfirmedIdsRef.current(snapshot)
        const snapshotFormValues = toFormValuesRef.current(snapshot)
        pendingOpsRef.current = pendingOpsAfterFailedOp(
          pendingOpsRef.current,
          failedOp,
          latestConfirmedIds,
        )
        reset({
          ...snapshotFormValues,
          [formFieldName]: failedSyncFormItems(
            (snapshotFormValues[formFieldName] ?? []) as Record<string, unknown>[],
            (getValues()[formFieldName] ?? []) as Record<string, unknown>[],
            semanticIdKey,
            failedOp.semanticId,
            latestConfirmedIds,
          ),
        } as TFormValues)
        setSyncError(
          relationshipSyncErrorMessage(
            error,
            failedOp,
            opsToEnqueue,
            addErrorFallback,
            removeErrorFallback,
          ),
        )
      } finally {
        syncInFlightRef.current = false
        setSyncEpoch((epoch) => epoch + 1)
      }
    })()
  }, [
    addErrorFallback,
    areServerEqual,
    formFieldName,
    formItems,
    getConfirmedIds,
    getValues,
    removeErrorFallback,
    reset,
    semanticIdKey,
    serverSnapshot,
    syncEpoch,
    toFormValues,
  ])

  return syncError
}
