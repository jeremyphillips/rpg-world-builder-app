import { useEffect, useRef, useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import { Text } from '@rpg/ui'

import {
  acknowledgePendingOps,
  reconcileDesiredChanges,
  rollbackFailedAdd,
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
}: UseRelationshipApiSemanticSyncOptions<TFormValues, TServerSnapshot>) {
  const { control, reset, getValues } = useFormContext<TFormValues>()
  const formItems = useWatch({ control, name: formFieldName as never }) as
    | Record<string, unknown>[]
    | undefined
  const onAddRef = useRef(onAdd)
  const onRemoveRef = useRef(onRemove)
  const priorServerRef = useRef(serverSnapshot)
  const lastAdoptedConfirmedIdsRef = useRef<readonly string[]>(getConfirmedIds(serverSnapshot))
  const pendingOpsRef = useRef<RelationshipPendingOp[]>([])
  const syncInFlightRef = useRef(false)
  const [syncError, setSyncError] = useState<string>()

  useEffect(() => {
    onAddRef.current = onAdd
    onRemoveRef.current = onRemove
  })

  useEffect(() => {
    if (syncInFlightRef.current) return

    const confirmedIds = getConfirmedIds(serverSnapshot)
    const serverChanged = !areServerEqual(priorServerRef.current, serverSnapshot)
    const pendingOps = pendingOpsRef.current

    if (serverChanged) {
      priorServerRef.current = serverSnapshot

      if (
        shouldAdoptServerSnapshot({
          confirmedIds,
          pendingOps,
          lastAdoptedConfirmedIds: lastAdoptedConfirmedIdsRef.current,
        })
      ) {
        pendingOpsRef.current = acknowledgePendingOps(confirmedIds, pendingOps)
        lastAdoptedConfirmedIdsRef.current = confirmedIds
        reset(toFormValues(serverSnapshot))
        setSyncError(undefined)
        return
      }
    }

    const formValues = getValues()
    const items = (formItems ?? formValues[formFieldName] ?? []) as Record<string, unknown>[]
    const desiredIds = items
      .map((item) => item[semanticIdKey])
      .filter((id): id is string => typeof id === 'string' && id.length > 0)
    const serverFormValues = toFormValues(serverSnapshot)
    const serverItems = (serverFormValues[formFieldName] ?? []) as Record<string, unknown>[]

    if (JSON.stringify(items) === JSON.stringify(serverItems) && pendingOps.length === 0) {
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
      try {
        for (const op of opsToEnqueue) {
          if (op.kind === 'add') {
            await onAddRef.current(op.semanticId)
            continue
          }
          if (!onRemoveRef.current) {
            throw new Error(removeErrorFallback)
          }
          await onRemoveRef.current(op.semanticId)
        }
      } catch (error) {
        const fallback = opsToEnqueue.some((op) => op.kind === 'remove')
          ? removeErrorFallback
          : addErrorFallback
        const message =
          error instanceof Error && error.message.trim().length > 0 ? error.message : fallback

        pendingOpsRef.current = pendingOpsRef.current.filter(
          (pendingOp) =>
            !opsToEnqueue.some((failedOp) => failedOp.semanticId === pendingOp.semanticId),
        )

        const failedAdd = opsToEnqueue.find((op) => op.kind === 'add')
        if (failedAdd) {
          const currentItems = (getValues()[formFieldName] ?? []) as Record<string, unknown>[]
          reset({
            ...getValues(),
            [formFieldName]: rollbackFailedAdd(currentItems, semanticIdKey, failedAdd.semanticId),
          } as TFormValues)
        } else {
          reset(toFormValues(priorServerRef.current))
        }

        setSyncError(message)
      } finally {
        syncInFlightRef.current = false
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
    toFormValues,
  ])

  return syncError ? (
    <Text variant="destructive" className="text-sm" aria-live="polite">
      {syncError}
    </Text>
  ) : null
}
