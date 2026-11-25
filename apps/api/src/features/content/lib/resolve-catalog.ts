import {
  reconcileContentProvenance,
  type ApiContentTypeKey,
  type SystemOverlayParticipantId,
  type SystemRulesetId,
} from '@rpg/contracts'

import {
  contentEntityBody,
  overlayPolicyForValidationIntent,
  resolveSystemBodyWithOverlay,
} from './resolve-system-overlay.lib'

/** Any stored content record is referenced by its opaque `id`. */
interface Identified {
  id: string
}

/** A per-campaign overlay patch: versioned stored overlay keyed by the base record id. */
export interface OverlayPatch {
  targetId: string
  patch: Record<string, unknown>
}

export type ResolveCatalogOptions = {
  contentTypeKey?: ApiContentTypeKey
  overlayParticipantId?: SystemOverlayParticipantId
  validationIntent?: 'publish' | 'draft'
}

/**
 * Resolve a campaign's effective catalog for one content type (type-agnostic):
 *
 * 1. apply each versioned overlay onto its base system record (by `targetId`),
 * 2. append the campaign's homebrew records.
 *
 * Patches whose `targetId` matches no system record are ignored. Unversioned
 * patch documents fail closed when an overlay participant is configured.
 */
export function resolveCatalog<T extends Identified>(
  system: readonly T[],
  patches: readonly OverlayPatch[],
  homebrew: readonly T[],
  options?: ResolveCatalogOptions,
): T[] {
  const patchByTarget = new Map(patches.map((p) => [p.targetId, p]))
  const participantId = options?.overlayParticipantId
  const policy = participantId
    ? overlayPolicyForValidationIntent(participantId, options?.validationIntent ?? 'publish')
    : undefined

  const resolvedSystem = system.map((record) => {
    const overlay = patchByTarget.get(record.id)
    const recordRecord = record as unknown as Record<string, unknown>
    const seedBody = contentEntityBody(recordRecord)

    let mergedBody: Record<string, unknown>
    if (!overlay) {
      mergedBody = seedBody
    } else if (!policy) {
      throw new Error(
        'System overlay patch present but overlayParticipantId is not configured for this content type.',
      )
    } else {
      mergedBody = resolveSystemBodyWithOverlay(seedBody, overlay.patch, policy)
    }

    const published = {
      ...recordRecord,
      ...mergedBody,
      status: 'published' as const,
    }
    const rulesetId = recordRecord.rulesetId as SystemRulesetId | undefined
    if (!rulesetId) return published as T
    return reconcileContentProvenance({
      authority: 'preserve',
      catalogLayer: 'system',
      rulesetId,
      contentTypeKey: options?.contentTypeKey,
      normalized: published,
      existing: recordRecord,
    }) as unknown as T
  })

  return [...resolvedSystem, ...homebrew]
}
