import {
  characterRelationshipRevisionConflictSchema,
  isApiError,
  type CharacterRelationshipEdge,
} from '@rpg/contracts'

export const LOCAL_RELATIONSHIP_ID_PREFIX = 'local:' as const

export type RelationshipEdgePendingOpKind = 'add' | 'update' | 'remove'

export type RelationshipEdgeSnapshotRow = {
  relationshipId: string
  revision: number
}

export type RelationshipEdgePendingOp = {
  kind: RelationshipEdgePendingOpKind
  relationshipId: string
  requestId: string
  expectedRevision?: number
  idempotencyKey?: string
  /** Set after a successful create maps a local row id to the persisted edge id. */
  serverRelationshipId?: string
}

export function isLocalRelationshipId(relationshipId: string): boolean {
  return relationshipId.startsWith(LOCAL_RELATIONSHIP_ID_PREFIX)
}

export function createLocalRelationshipId(): string {
  return `${LOCAL_RELATIONSHIP_ID_PREFIX}${crypto.randomUUID()}`
}

export function createRelationshipEdgeRequestId(): string {
  return crypto.randomUUID()
}

export function buildEdgeRevisionMap(
  rows: readonly RelationshipEdgeSnapshotRow[],
): Map<string, number> {
  return new Map(rows.map((row) => [row.relationshipId, row.revision]))
}

function resolvePendingEdgeId(op: RelationshipEdgePendingOp): string {
  return op.serverRelationshipId ?? op.relationshipId
}

/** Returns pending ops cleared because the server snapshot acknowledges them. */
export function acknowledgePendingEdgeOps(
  serverRows: readonly RelationshipEdgeSnapshotRow[],
  pendingOps: readonly RelationshipEdgePendingOp[],
): RelationshipEdgePendingOp[] {
  const serverById = buildEdgeRevisionMap(serverRows)

  return pendingOps.filter((op) => {
    const edgeId = resolvePendingEdgeId(op)

    if (op.kind === 'add') {
      return !serverById.has(edgeId)
    }

    if (op.kind === 'remove') {
      return serverById.has(edgeId)
    }

    const serverRevision = serverById.get(edgeId)
    if (serverRevision === undefined) {
      return true
    }

    if (op.expectedRevision === undefined) {
      return true
    }

    return serverRevision <= op.expectedRevision
  })
}

function isPendingEdgeOpAcknowledgedByServer(
  op: RelationshipEdgePendingOp,
  serverById: ReadonlyMap<string, number>,
): boolean {
  const edgeId = resolvePendingEdgeId(op)

  if (op.kind === 'add') {
    return serverById.has(edgeId)
  }

  if (op.kind === 'remove') {
    return !serverById.has(edgeId)
  }

  const serverRevision = serverById.get(edgeId)
  return (
    serverRevision !== undefined &&
    op.expectedRevision !== undefined &&
    serverRevision > op.expectedRevision
  )
}

/** Whether the server snapshot should replace confirmed form rows. */
export function shouldAdoptEdgeServerSnapshot(input: {
  serverRows: readonly RelationshipEdgeSnapshotRow[]
  pendingOps: readonly RelationshipEdgePendingOp[]
  lastAdoptedServerRows: readonly RelationshipEdgeSnapshotRow[]
  serverChanged: boolean
}): boolean {
  const { serverRows, pendingOps, lastAdoptedServerRows, serverChanged } = input
  const serverById = buildEdgeRevisionMap(serverRows)

  if (pendingOps.some((op) => isPendingEdgeOpAcknowledgedByServer(op, serverById))) {
    return true
  }

  if (pendingOps.length === 0) {
    return serverChanged || !areEdgeSnapshotsEqual(serverRows, lastAdoptedServerRows)
  }

  return false
}

export function areEdgeSnapshotsEqual(
  left: readonly RelationshipEdgeSnapshotRow[],
  right: readonly RelationshipEdgeSnapshotRow[],
): boolean {
  if (left.length !== right.length) return false
  const rightById = buildEdgeRevisionMap(right)
  return left.every((row) => rightById.get(row.relationshipId) === row.revision)
}

/**
 * Enqueues removes before adds/updates so cardinality-one replacement does not
 * create a second edge before the confirmed one is deleted.
 */
export function reconcileDesiredEdgeChanges<
  TConfirmed extends RelationshipEdgeSnapshotRow,
  TDesired extends RelationshipEdgeSnapshotRow,
>(input: {
  confirmedRows: readonly TConfirmed[]
  desiredRows: readonly TDesired[]
  pendingOps: readonly RelationshipEdgePendingOp[]
  isRowContentEqual: (confirmed: TConfirmed, desired: TDesired) => boolean
}): RelationshipEdgePendingOp[] {
  const { confirmedRows, desiredRows, pendingOps, isRowContentEqual } = input
  const confirmedById = new Map(confirmedRows.map((row) => [row.relationshipId, row] as const))
  const desiredById = new Map(desiredRows.map((row) => [row.relationshipId, row] as const))
  const pendingEdgeIds = new Set(pendingOps.map((op) => op.relationshipId))
  const opsToEnqueue: RelationshipEdgePendingOp[] = []

  for (const confirmed of confirmedRows) {
    if (
      !desiredById.has(confirmed.relationshipId) &&
      !pendingEdgeIds.has(confirmed.relationshipId)
    ) {
      opsToEnqueue.push({
        kind: 'remove',
        relationshipId: confirmed.relationshipId,
        requestId: createRelationshipEdgeRequestId(),
        expectedRevision: confirmed.revision,
      })
    }
  }

  for (const desired of desiredRows) {
    if (pendingEdgeIds.has(desired.relationshipId)) {
      continue
    }

    if (isLocalRelationshipId(desired.relationshipId)) {
      opsToEnqueue.push({
        kind: 'add',
        relationshipId: desired.relationshipId,
        requestId: createRelationshipEdgeRequestId(),
        idempotencyKey: createRelationshipEdgeRequestId(),
      })
      continue
    }

    const confirmed = confirmedById.get(desired.relationshipId)
    if (!confirmed) {
      continue
    }

    if (!isRowContentEqual(confirmed, desired)) {
      opsToEnqueue.push({
        kind: 'update',
        relationshipId: desired.relationshipId,
        requestId: createRelationshipEdgeRequestId(),
        expectedRevision: confirmed.revision,
      })
    }
  }

  return opsToEnqueue
}

/** Keeps optimistic rows the server has not confirmed yet when adopting a snapshot. */
export function mergeUnconfirmedDesiredEdgeRows<TRow extends RelationshipEdgeSnapshotRow>(
  serverRows: readonly TRow[],
  desiredRows: readonly TRow[],
  confirmedRows: readonly RelationshipEdgeSnapshotRow[],
): TRow[] {
  const confirmedIds = new Set(confirmedRows.map((row) => row.relationshipId))
  const extras = desiredRows.filter(
    (row) => !confirmedIds.has(row.relationshipId) || isLocalRelationshipId(row.relationshipId),
  )
  return [...serverRows, ...extras]
}

/** Preserves newer local edits when adopting canonical server rows. */
export function mergeEdgeRowsPreservingLocalEdits<TRow extends RelationshipEdgeSnapshotRow>(input: {
  serverRows: readonly TRow[]
  localRows: readonly TRow[]
  pendingOps: readonly RelationshipEdgePendingOp[]
  isRowContentEqual: (left: TRow, right: TRow) => boolean
}): TRow[] {
  const { serverRows, localRows, pendingOps, isRowContentEqual } = input
  const pendingEdgeIds = new Set(pendingOps.map((op) => op.relationshipId))
  const localById = new Map(localRows.map((row) => [row.relationshipId, row] as const))
  const serverIds = new Set(serverRows.map((row) => row.relationshipId))

  const merged = serverRows.map((serverRow) => {
    const localRow = localById.get(serverRow.relationshipId)
    if (!localRow) return serverRow
    if (pendingEdgeIds.has(serverRow.relationshipId)) return localRow
    if (isRowContentEqual(serverRow, localRow)) return serverRow
    return localRow
  })

  const extras = localRows.filter((row) => {
    if (serverIds.has(row.relationshipId)) return false
    return isLocalRelationshipId(row.relationshipId) || pendingEdgeIds.has(row.relationshipId)
  })

  return [...merged, ...extras]
}

export function adoptCanonicalEdgeAfterConflict<TRow extends RelationshipEdgeSnapshotRow>(
  localRow: TRow,
  canonicalRow: TRow,
  isRowContentEqual: (left: TRow, right: TRow) => boolean,
): TRow {
  if (!isRowContentEqual(localRow, canonicalRow)) {
    return { ...localRow, revision: canonicalRow.revision }
  }
  return canonicalRow
}

export function pendingEdgeOpsAfterFailedOp(
  pendingOps: readonly RelationshipEdgePendingOp[],
  failedOp: RelationshipEdgePendingOp,
  serverRows: readonly RelationshipEdgeSnapshotRow[],
): RelationshipEdgePendingOp[] {
  return acknowledgePendingEdgeOps(
    serverRows,
    pendingOps.filter((op) => op.requestId !== failedOp.requestId),
  )
}

export function remapPendingEdgeOpRelationshipId(
  pendingOps: readonly RelationshipEdgePendingOp[],
  localRelationshipId: string,
  serverRelationshipId: string,
): RelationshipEdgePendingOp[] {
  return pendingOps.map((op) => {
    if (op.relationshipId !== localRelationshipId) return op
    return {
      ...op,
      relationshipId: serverRelationshipId,
      serverRelationshipId,
    }
  })
}

export function relationshipEdgeSyncErrorMessage(
  error: unknown,
  failedOp: RelationshipEdgePendingOp | undefined,
  opsToEnqueue: readonly RelationshipEdgePendingOp[],
  addErrorFallback: string,
  updateErrorFallback: string,
  removeErrorFallback: string,
): string {
  const fallback =
    failedOp?.kind === 'remove' || opsToEnqueue.some((op) => op.kind === 'remove')
      ? removeErrorFallback
      : failedOp?.kind === 'update' || opsToEnqueue.some((op) => op.kind === 'update')
        ? updateErrorFallback
        : addErrorFallback

  return error instanceof Error && error.message.trim().length > 0 ? error.message : fallback
}

export function extractStaleRelationshipFromError(
  error: unknown,
): CharacterRelationshipEdge | undefined {
  if (!isApiError(error) || error.code !== 'stale_revision') {
    return undefined
  }

  const relationship = (error.details as { relationship?: unknown } | undefined)?.relationship
  const parsed = characterRelationshipRevisionConflictSchema.safeParse({
    code: 'stale_revision',
    message: error.message,
    relationship,
  })

  return parsed.success ? parsed.data.relationship : undefined
}

export function selectNextEdgeOpsForCommit(
  ops: readonly RelationshipEdgePendingOp[],
  inFlightRelationshipIds: ReadonlySet<string>,
): RelationshipEdgePendingOp[] {
  const selected: RelationshipEdgePendingOp[] = []
  const edgesInBatch = new Set<string>()

  for (const op of ops) {
    if (inFlightRelationshipIds.has(op.relationshipId)) continue
    if (edgesInBatch.has(op.relationshipId)) continue
    selected.push(op)
    edgesInBatch.add(op.relationshipId)
  }

  return selected
}

export type RelationshipEdgeCommitHandlers = {
  onAdd: (op: RelationshipEdgePendingOp) => void | Promise<{ relationshipId: string } | void>
  onUpdate: (op: RelationshipEdgePendingOp) => void | Promise<void>
  onRemove: (op: RelationshipEdgePendingOp) => void | Promise<void>
}

export async function commitRelationshipEdgePendingOps(
  ops: readonly RelationshipEdgePendingOp[],
  handlers: RelationshipEdgeCommitHandlers,
): Promise<{ failedOp?: RelationshipEdgePendingOp; error?: unknown }> {
  for (const op of ops) {
    try {
      if (op.kind === 'add') {
        await handlers.onAdd(op)
        continue
      }
      if (op.kind === 'update') {
        await handlers.onUpdate(op)
        continue
      }
      await handlers.onRemove(op)
    } catch (error) {
      return { failedOp: op, error }
    }
  }

  return {}
}
