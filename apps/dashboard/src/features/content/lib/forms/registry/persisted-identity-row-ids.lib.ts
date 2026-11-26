import {
  buildPersistedIdentityRowIdsByPath,
  overlayPolicyForParticipant,
  type SystemOverlayParticipantId,
} from '@rpg/contracts'

export function persistedIdentityRowIdsByPathForParticipant(
  entity: Record<string, unknown>,
  participantId: SystemOverlayParticipantId,
): Readonly<Record<string, readonly string[]>> {
  return buildPersistedIdentityRowIdsByPath(entity, overlayPolicyForParticipant(participantId))
}
