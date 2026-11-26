import {
  buildSystemOverlayIntent,
  overlayPolicyForParticipant,
  type ContentValidationIntent,
  type SystemOverlayParticipantId,
} from '@rpg/contracts'

export function overlayUpdateFromBodies(args: {
  participantId: SystemOverlayParticipantId
  catalogSeed: Record<string, unknown>
  baseline: Record<string, unknown>
  draft: Record<string, unknown>
  validationIntent?: ContentValidationIntent
  expectedOverlayRevision?: number
}) {
  const intent = buildSystemOverlayIntent({
    policy: overlayPolicyForParticipant(args.participantId, args.validationIntent ?? 'publish'),
    catalogSeed: args.catalogSeed,
    baseline: args.baseline,
    draft: args.draft,
  })
  return {
    systemOverlayIntent: intent,
    expectedOverlayRevision: args.expectedOverlayRevision ?? 0,
  }
}

export function overlayNameOnlyUpdate(args: {
  participantId: SystemOverlayParticipantId
  catalogSeed: Record<string, unknown>
  baseline: Record<string, unknown>
  name: string
  expectedOverlayRevision?: number
}) {
  return overlayUpdateFromBodies({
    ...args,
    draft: { ...args.baseline, name: args.name },
  })
}
