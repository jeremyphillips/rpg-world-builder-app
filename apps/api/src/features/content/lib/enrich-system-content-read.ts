import {
  buildSeedRowIdsByPath,
  overlayPolicyForParticipant,
  parseStoredOverlayInput,
  type SystemOverlayParticipantId,
} from '@rpg/contracts'

import type { OverlayPatch } from './resolve-catalog'

type PatchModelParticipant = SystemOverlayParticipantId

const RESPONSE_TYPE_TO_PARTICIPANT: Partial<Record<string, PatchModelParticipant>> = {
  monsters: 'monsters',
  species: 'species',
  classes: 'classes',
  subclasses: 'subclasses',
  spells: 'spells',
  equipment: 'equipment',
  feats: 'feats',
  'skill-proficiencies': 'skill-proficiencies',
}

export function enrichResolvedSystemRecords<T extends { id: string; catalogLayer?: string }>(
  records: readonly T[],
  systemSeedById: ReadonlyMap<string, Record<string, unknown>>,
  patches: readonly OverlayPatch[],
  contentType: string,
): T[] {
  const participantId = RESPONSE_TYPE_TO_PARTICIPANT[contentType]
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
