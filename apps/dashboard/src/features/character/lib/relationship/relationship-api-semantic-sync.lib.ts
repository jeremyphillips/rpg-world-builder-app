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

/** Whether the server snapshot should replace current form values. */
export function shouldAdoptServerSnapshot(input: {
  confirmedIds: readonly string[]
  pendingOps: readonly RelationshipPendingOp[]
  lastAdoptedConfirmedIds: readonly string[]
}): boolean {
  const { confirmedIds, pendingOps, lastAdoptedConfirmedIds } = input
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
    return !areSemanticIdSetsEqual(confirmedIds, lastAdoptedConfirmedIds)
  }

  return false
}

/** Finds add/remove ops to enqueue when desired diverges from confirmed. */
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

  for (const semanticId of desiredIds) {
    if (!confirmedSet.has(semanticId) && !pendingIds.has(semanticId)) {
      opsToEnqueue.push({ kind: 'add', semanticId })
    }
  }

  for (const semanticId of confirmedIds) {
    if (!desiredSet.has(semanticId) && !pendingIds.has(semanticId)) {
      opsToEnqueue.push({ kind: 'remove', semanticId })
    }
  }

  return opsToEnqueue
}

/** Rolls back a failed optimistic add while preserving confirmed rows. */
export function rollbackFailedAdd<TItem extends Record<string, unknown>>(
  items: readonly TItem[],
  semanticIdKey: keyof TItem & string,
  failedSemanticId: string,
): TItem[] {
  return items.filter((item) => item[semanticIdKey] !== failedSemanticId)
}
