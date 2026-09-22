export type RelationshipPendingOpKind = 'add' | 'remove'

export type RelationshipPendingOp = {
  kind: RelationshipPendingOpKind
  semanticId: string
}

export function areSemanticIdSetsEqual(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false
  const rightSet = new Set(right)
  return left.every((id) => rightSet.has(id))
}

/** Returns pending ops cleared because the server snapshot acknowledges them. */
export function acknowledgePendingOps(
  confirmedIds: readonly string[],
  pendingOps: readonly RelationshipPendingOp[],
): RelationshipPendingOp[] {
  const confirmedSet = new Set(confirmedIds)

  return pendingOps.filter((op) => {
    if (op.kind === 'add') {
      return !confirmedSet.has(op.semanticId)
    }
    return confirmedSet.has(op.semanticId)
  })
}

/** Whether the server snapshot should replace confirmed form rows. */
export function shouldAdoptServerSnapshot(input: {
  confirmedIds: readonly string[]
  pendingOps: readonly RelationshipPendingOp[]
  lastAdoptedConfirmedIds: readonly string[]
  serverChanged: boolean
}): boolean {
  const { confirmedIds, pendingOps, lastAdoptedConfirmedIds, serverChanged } = input
  const confirmedSet = new Set(confirmedIds)

  for (const op of pendingOps) {
    if (op.kind === 'add' && confirmedSet.has(op.semanticId)) {
      return true
    }
    if (op.kind === 'remove' && !confirmedSet.has(op.semanticId)) {
      return true
    }
  }

  if (pendingOps.length === 0) {
    return serverChanged || !areSemanticIdSetsEqual(confirmedIds, lastAdoptedConfirmedIds)
  }

  return false
}

/**
 * Enqueues removes before adds so cardinality-one replace does not create a
 * second edge before the confirmed one is deleted.
 */
export function reconcileDesiredChanges(input: {
  confirmedIds: readonly string[]
  desiredIds: readonly string[]
  pendingOps: readonly RelationshipPendingOp[]
}): RelationshipPendingOp[] {
  const { confirmedIds, desiredIds, pendingOps } = input
  const confirmedSet = new Set(confirmedIds)
  const desiredSet = new Set(desiredIds)
  const pendingIds = new Set(pendingOps.map((op) => op.semanticId))
  const opsToEnqueue: RelationshipPendingOp[] = []

  for (const semanticId of confirmedIds) {
    if (!desiredSet.has(semanticId) && !pendingIds.has(semanticId)) {
      opsToEnqueue.push({ kind: 'remove', semanticId })
    }
  }

  for (const semanticId of desiredIds) {
    if (!confirmedSet.has(semanticId) && !pendingIds.has(semanticId)) {
      opsToEnqueue.push({ kind: 'add', semanticId })
    }
  }

  return opsToEnqueue
}

/** Keeps optimistic rows the server has not confirmed yet when adopting a snapshot. */
export function mergeUnconfirmedDesiredItems<TItem extends Record<string, unknown>>(
  serverItems: readonly TItem[],
  desiredItems: readonly TItem[],
  semanticIdKey: keyof TItem & string,
  confirmedIds: readonly string[],
): TItem[] {
  const confirmedSet = new Set(confirmedIds)
  const extras = desiredItems.filter((item) => {
    const id = item[semanticIdKey]
    return typeof id === 'string' && id.length > 0 && !confirmedSet.has(id)
  })
  return [...serverItems, ...extras]
}

export function pendingOpsAfterFailedOp(
  pendingOps: readonly RelationshipPendingOp[],
  failedOp: RelationshipPendingOp,
  confirmedIds: readonly string[],
): RelationshipPendingOp[] {
  return acknowledgePendingOps(
    confirmedIds,
    pendingOps.filter((op) => op.semanticId !== failedOp.semanticId),
  )
}

export function failedSyncFormItems(
  snapshotItems: readonly Record<string, unknown>[],
  currentItems: readonly Record<string, unknown>[],
  semanticIdKey: string,
  failedSemanticId: string,
  confirmedIds: readonly string[],
): Record<string, unknown>[] {
  return mergeUnconfirmedDesiredItems(
    snapshotItems,
    currentItems.filter((item) => item[semanticIdKey] !== failedSemanticId),
    semanticIdKey,
    confirmedIds,
  )
}

export function relationshipSyncErrorMessage(
  error: unknown,
  failedOp: RelationshipPendingOp | undefined,
  opsToEnqueue: readonly RelationshipPendingOp[],
  addErrorFallback: string,
  removeErrorFallback: string,
): string {
  const fallback =
    failedOp?.kind === 'remove' || opsToEnqueue.some((op) => op.kind === 'remove')
      ? removeErrorFallback
      : addErrorFallback
  return error instanceof Error && error.message.trim().length > 0 ? error.message : fallback
}

export async function commitRelationshipPendingOps(
  ops: readonly RelationshipPendingOp[],
  onAdd: (semanticId: string) => void | Promise<void>,
  onRemove: ((semanticId: string) => void | Promise<void>) | undefined,
  removeErrorFallback: string,
): Promise<{ failedOp?: RelationshipPendingOp; error?: unknown }> {
  for (const op of ops) {
    try {
      if (op.kind === 'add') {
        await onAdd(op.semanticId)
        continue
      }
      if (!onRemove) {
        throw new Error(removeErrorFallback)
      }
      await onRemove(op.semanticId)
    } catch (error) {
      return { failedOp: op, error }
    }
  }
  return {}
}
