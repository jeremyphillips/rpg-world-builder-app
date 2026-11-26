import type { CatalogLayer, SystemOverlayParticipantId } from '@rpg/contracts'

export type SystemOverlayWriteNotReadyReason =
  | 'loading'
  | 'missing_catalog_seed'
  | 'missing_baseline'
  | 'missing_normalizer'
  | 'missing_provenance'
  | 'snapshot_mismatch'
  | 'unregistered_participant'
  | 'unresolved_overlay'

export type SystemOverlayWriteSnapshot = {
  entityId: string
  expectedOverlayRevision: number
  catalogSeed: Record<string, unknown>
  overlayBaseline: Record<string, unknown>
  participantId: SystemOverlayParticipantId
  seedRowIdsByPath: Readonly<Record<string, readonly string[]>>
}

export type SystemOverlayWriteReadiness =
  | { ready: true; snapshot: SystemOverlayWriteSnapshot }
  | { ready: false; reason: SystemOverlayWriteNotReadyReason; message: string }

export class SystemOverlayWriteNotReadyError extends Error {
  readonly reason: SystemOverlayWriteNotReadyReason

  constructor(reason: SystemOverlayWriteNotReadyReason, message: string) {
    super(message)
    this.name = 'SystemOverlayWriteNotReadyError'
    this.reason = reason
  }
}

const REASON_MESSAGES: Record<SystemOverlayWriteNotReadyReason, string> = {
  loading: 'Campaign ruleset is still loading. Try again in a moment.',
  missing_catalog_seed: 'Catalog seed for this system record is unavailable.',
  missing_baseline: 'The editor has not finished loading this record. Refresh and try again.',
  missing_normalizer: 'This content type is not configured for system overlay updates.',
  missing_provenance: 'Seed row locks for this record are missing from the catalog response.',
  snapshot_mismatch: 'This record changed since the form loaded. Refresh and try again.',
  unregistered_participant: 'This content type is not registered for system overlay updates.',
  unresolved_overlay:
    'This system record could not be loaded because its overlay is invalid. It cannot be edited until the overlay is fixed.',
}

export function systemOverlayWriteNotReadyMessage(
  reason: SystemOverlayWriteNotReadyReason,
): string {
  return REASON_MESSAGES[reason]
}

export type EvaluateSystemOverlayWriteReadinessInput = {
  operation: 'create' | 'update'
  catalogLayer?: CatalogLayer
  participantId?: SystemOverlayParticipantId
  entityId?: string
  rulesetId?: string
  hasNormalizer: boolean
  catalogSeed?: Record<string, unknown>
  overlayBaseline?: Record<string, unknown>
  expectedOverlayRevision?: number
  seedRowIdsByPath?: Readonly<Record<string, readonly string[]>>
}

function notReady(
  reason: SystemOverlayWriteNotReadyReason,
): Extract<SystemOverlayWriteReadiness, { ready: false }> {
  return { ready: false, reason, message: systemOverlayWriteNotReadyMessage(reason) }
}

/** Whether a system content update has every dependency for overlay intent on the wire. */
export function evaluateSystemOverlayWriteReadiness(
  input: EvaluateSystemOverlayWriteReadinessInput,
): SystemOverlayWriteReadiness {
  if (input.operation !== 'update' || input.catalogLayer !== 'system') {
    throw new Error('evaluateSystemOverlayWriteReadiness applies only to system content updates.')
  }

  if (!input.participantId) {
    return notReady('unregistered_participant')
  }

  if (!input.rulesetId) {
    return notReady('loading')
  }

  if (!input.hasNormalizer) {
    return notReady('missing_normalizer')
  }

  if (!input.catalogSeed) {
    return notReady('missing_catalog_seed')
  }

  if (!input.overlayBaseline) {
    return notReady('missing_baseline')
  }

  if (!input.entityId) {
    return notReady('snapshot_mismatch')
  }

  if (input.seedRowIdsByPath === undefined) {
    return notReady('missing_provenance')
  }

  const expectedOverlayRevision = input.expectedOverlayRevision ?? 0

  return {
    ready: true,
    snapshot: {
      entityId: input.entityId,
      expectedOverlayRevision,
      catalogSeed: input.catalogSeed,
      overlayBaseline: input.overlayBaseline,
      participantId: input.participantId,
      seedRowIdsByPath: input.seedRowIdsByPath,
    },
  }
}

export function assertSystemOverlayWriteReady(
  input: EvaluateSystemOverlayWriteReadinessInput,
): SystemOverlayWriteSnapshot {
  const result = evaluateSystemOverlayWriteReadiness(input)
  if (!result.ready) {
    throw new SystemOverlayWriteNotReadyError(result.reason, result.message)
  }
  return result.snapshot
}

export function assertSystemOverlayWriteSnapshotMatchesEntity(args: {
  snapshotEntityId: string
  snapshotRevision: number
  entityId?: string
  entityRevision?: number
}): void {
  const entityRevision = args.entityRevision ?? 0
  if (args.entityId !== args.snapshotEntityId || entityRevision !== args.snapshotRevision) {
    throw new SystemOverlayWriteNotReadyError(
      'snapshot_mismatch',
      systemOverlayWriteNotReadyMessage('snapshot_mismatch'),
    )
  }
}
