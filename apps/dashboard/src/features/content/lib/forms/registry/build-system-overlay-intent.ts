import {
  buildSystemOverlayIntent,
  EXPECTED_OVERLAY_REVISION_FIELD,
  overlayPolicyForParticipant,
  SYSTEM_OVERLAY_INTENT_FIELD,
  type ContentValidationIntent,
  type ObjectDelta,
  type SystemOverlayParticipantId,
} from '@rpg/contracts'

export type BuildSystemOverlayIntentFromFormsInput = {
  participantId: SystemOverlayParticipantId
  catalogSeed: Record<string, unknown>
  baseline: Record<string, unknown>
  draft: Record<string, unknown>
  validationIntent: ContentValidationIntent
}

export function buildSystemOverlayIntentFromForms(
  input: BuildSystemOverlayIntentFromFormsInput,
): ObjectDelta {
  return buildSystemOverlayIntent({
    policy: overlayPolicyForParticipant(input.participantId, input.validationIntent),
    catalogSeed: input.catalogSeed,
    baseline: input.baseline,
    draft: input.draft,
  })
}

export type SystemOverlayUpdatePayload = {
  [SYSTEM_OVERLAY_INTENT_FIELD]: ObjectDelta
  [EXPECTED_OVERLAY_REVISION_FIELD]?: number
}

export function buildSystemOverlayUpdatePayload(
  input: BuildSystemOverlayIntentFromFormsInput & { expectedOverlayRevision?: number },
): SystemOverlayUpdatePayload {
  return {
    [SYSTEM_OVERLAY_INTENT_FIELD]: buildSystemOverlayIntentFromForms(input),
    ...(input.expectedOverlayRevision !== undefined
      ? { [EXPECTED_OVERLAY_REVISION_FIELD]: input.expectedOverlayRevision }
      : {}),
  }
}
