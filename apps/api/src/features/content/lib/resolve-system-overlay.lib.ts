import {
  applyStoredOverlay,
  overlayPolicyForParticipant,
  parseStoredOverlayInput,
  parseSystemOverlayIntent,
  pruneStoredOverlayForWire,
  reconcileOverlayUpdate,
  storedOverlaySchema,
  SYSTEM_OVERLAY_INTENT_FIELD,
  EXPECTED_OVERLAY_REVISION_FIELD,
  type ContentValidationIntent,
  type ObjectDelta,
  type OverlayApplyFailure,
  type OverlayPolicyNode,
  type SystemOverlayParticipantId,
} from '@rpg/contracts'

import { HttpError } from '../../../lib/http-error'

/** Body fields for overlay apply/reconcile (excludes catalog envelope). */
export function contentEntityBody(entity: Record<string, unknown>): Record<string, unknown> {
  const {
    id: _id,
    slug: _slug,
    rulesetId: _rulesetId,
    catalogLayer: _catalogLayer,
    status: _status,
    campaignId: _campaignId,
    provenance: _provenance,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    seedRowIdsByPath: _seedRowIdsByPath,
    overlayRevision: _overlayRevision,
    overlayReadDiagnostics: _overlayReadDiagnostics,
    ...body
  } = entity
  return body
}

export function overlayPolicyForValidationIntent(
  participantId: SystemOverlayParticipantId,
  validationIntent: ContentValidationIntent,
): OverlayPolicyNode {
  return overlayPolicyForParticipant(participantId, validationIntent)
}

export function throwOverlayFailure(failure: OverlayApplyFailure): never {
  if (failure.code === 'unsupported-overlay-version') {
    throw new HttpError(
      422,
      'unsupported_overlay_version',
      'System overlay patch is missing a supported version.',
    )
  }
  if (failure.code === 'unsupported-overlay-retention') {
    throw new HttpError(
      422,
      'unsupported_overlay_retention',
      'System overlay uses unsupported retention.',
      {
        path: failure.path,
        retention: failure.retention,
      },
    )
  }
  if (failure.code === 'overlay-validation') {
    throw new HttpError(422, 'overlay_validation', 'Stored system overlay is invalid.', {
      issues: failure.issues,
    })
  }
  throw new HttpError(
    422,
    'overlay_invalid_order',
    'Stored system overlay has invalid collection order.',
    {
      path: failure.path,
    },
  )
}

/** Catalog seed row plus overlay-resolved domain fields (matches `resolveCatalog` publish merge). */
export function resolveSystemCatalogRecord(
  seedRecord: Record<string, unknown>,
  stored: unknown,
  policy: OverlayPolicyNode,
): Record<string, unknown> {
  const seedBody = contentEntityBody(seedRecord)
  const mergedBody = resolveSystemBodyWithOverlay(seedBody, stored, policy)
  return { ...seedRecord, ...mergedBody }
}

export function resolveSystemBodyWithOverlay(
  seedBody: Record<string, unknown>,
  patch: unknown,
  policy: OverlayPolicyNode,
): Record<string, unknown> {
  const parsed = parseStoredOverlayInput(patch ?? null)
  if (!parsed.ok) throwOverlayFailure(parsed.failure)

  const applied = applyStoredOverlay(seedBody, parsed.overlay, policy)
  if (!applied.ok) throwOverlayFailure(applied.failure)

  return applied.result.body
}

export function readOverlayRevision(patch: unknown): number {
  const parsed = parseStoredOverlayInput(patch ?? null)
  if (!parsed.ok) throwOverlayFailure(parsed.failure)
  return parsed.overlay?.revision ?? 0
}

export function extractSystemOverlayWriteEnvelope(update: Record<string, unknown>): {
  intent: ObjectDelta
  expectedRevision: number
  remainder: Record<string, unknown>
} {
  const intentRaw = update[SYSTEM_OVERLAY_INTENT_FIELD]
  const expectedRevision = update[EXPECTED_OVERLAY_REVISION_FIELD]

  if (intentRaw === undefined) {
    throw new HttpError(400, 'bad_request', 'System content updates require overlay intent.')
  }
  if (expectedRevision === undefined) {
    throw new HttpError(
      400,
      'bad_request',
      'System content updates require expected overlay revision.',
    )
  }
  if (
    typeof expectedRevision !== 'number' ||
    !Number.isInteger(expectedRevision) ||
    expectedRevision < 0
  ) {
    throw new HttpError(
      400,
      'bad_request',
      'Expected overlay revision must be a non-negative integer.',
    )
  }

  const intent = parseSystemOverlayIntent(intentRaw)
  const {
    [SYSTEM_OVERLAY_INTENT_FIELD]: _intent,
    [EXPECTED_OVERLAY_REVISION_FIELD]: _revision,
    ...remainder
  } = update
  return { intent, expectedRevision, remainder }
}

export function reconcileSystemOverlayWrite(args: {
  seedBody: Record<string, unknown>
  storedInput: unknown
  intent: ObjectDelta
  policy: OverlayPolicyNode
  currentRevision: number
}): {
  body: Record<string, unknown>
  stored: ReturnType<typeof storedOverlaySchema.parse>
  unchanged: boolean
} {
  const reconciled = reconcileOverlayUpdate(
    args.seedBody,
    args.storedInput ?? null,
    args.intent,
    args.policy,
  )
  if (!reconciled.ok) throwOverlayFailure(reconciled.failure)

  const nextRevision = reconciled.result.unchanged ? args.currentRevision : args.currentRevision + 1

  const stored = pruneStoredOverlayForWire(
    storedOverlaySchema.parse({
      ...reconciled.result.stored,
      revision: nextRevision,
    }),
  )

  return {
    body: reconciled.result.body,
    stored,
    unchanged: reconciled.result.unchanged,
  }
}
