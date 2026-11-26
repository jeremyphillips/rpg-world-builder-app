import {
  buildSeedRowIdsByPath,
  overlayPolicyForParticipant,
  parseStoredOverlayInput,
  type SystemOverlayParticipantId,
} from '@rpg/contracts'

import type { OverlayPatch } from './resolve-catalog'

export function enrichResolvedSystemRecords<T extends { id: string; catalogLayer?: string }>(
  records: readonly T[],
  systemSeedById: ReadonlyMap<string, Record<string, unknown>>,
  patches: readonly OverlayPatch[],
  participantId: SystemOverlayParticipantId | undefined,
): T[] {
  if (!participantId) return [...records]

  const policy = overlayPolicyForParticipant(participantId)
  const patchByTarget = new Map(patches.map((patch) => [patch.targetId, patch.patch]))

  return records.map((record) => {
    if (record.catalogLayer !== 'system') return record
    const seedBody = systemSeedById.get(record.id)
    if (!seedBody) return record

    const patchRaw = patchByTarget.get(record.id)
    const parsedOverlay = patchRaw
      ? parseStoredOverlayInput(patchRaw)
      : { ok: true as const, overlay: null }

    return {
      ...record,
      seedRowIdsByPath: buildSeedRowIdsByPath(seedBody, policy),
      ...(parsedOverlay.ok && parsedOverlay.overlay
        ? { overlayRevision: parsedOverlay.overlay.revision }
        : {}),
    } as T
  })
}
