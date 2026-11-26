import {
  applyStoredOverlay,
  buildSeedRowIdsByPath,
  reconcileContentProvenance,
  overlayFailureToListEntry,
  parseStoredOverlayInput,
  type ApiContentTypeKey,
  type CatalogOverlayListFailure,
  type OverlayReadDiagnostics,
  type StoredOverlay,
  type SystemOverlayParticipantId,
  type SystemRulesetId,
} from '@rpg/contracts'

import { contentEntityBody, overlayPolicyForValidationIntent } from './resolve-system-overlay.lib'

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

export type ResolveCatalogResult<T> = {
  records: T[]
  overlayFailures: CatalogOverlayListFailure[]
}

function overlayReadDiagnosticsNonEmpty(
  diagnostics: OverlayReadDiagnostics,
): diagnostics is OverlayReadDiagnostics {
  return diagnostics.orphanedSeedOverrides.length > 0 || diagnostics.identityConflicts.length > 0
}

function catalogListFailureSeedRow(record: Record<string, unknown>): {
  id: string
  slug: string
  name: string
} {
  const { id, slug, name } = record
  if (typeof id !== 'string' || typeof slug !== 'string' || typeof name !== 'string') {
    throw new Error(`System catalog row is missing id, slug, or name for overlay failure.`)
  }
  return { id, slug, name }
}

/**
 * Resolve a campaign's effective catalog for one content type (type-agnostic):
 *
 * 1. apply each versioned overlay onto its base system record (by `targetId`),
 * 2. append the campaign's homebrew records.
 *
 * Patches whose `targetId` matches no system record are ignored. Unversioned
 * patch documents become `overlayFailures` when overlay wiring is present.
 */
export function resolveCatalog<T extends Identified>(
  system: readonly T[],
  patches: readonly OverlayPatch[],
  homebrew: readonly T[],
  options?: ResolveCatalogOptions,
): ResolveCatalogResult<T> {
  const patchByTarget = new Map(patches.map((p) => [p.targetId, p]))
  const participantId = options?.overlayParticipantId
  const policy = participantId
    ? overlayPolicyForValidationIntent(participantId, options?.validationIntent ?? 'publish')
    : undefined

  const overlayFailures: CatalogOverlayListFailure[] = []
  const resolvedSystem: T[] = []

  for (const record of system) {
    const overlay = patchByTarget.get(record.id)
    const recordRecord = record as unknown as Record<string, unknown>
    const seedBody = contentEntityBody(recordRecord)

    let mergedBody: Record<string, unknown>
    let readDiagnostics: OverlayReadDiagnostics | undefined
    let storedOverlay: StoredOverlay | null | undefined

    if (!overlay) {
      mergedBody = seedBody
    } else if (!policy) {
      throw new Error(
        'System overlay patch present but overlayParticipantId is not configured for this content type.',
      )
    } else {
      const parsed = parseStoredOverlayInput(overlay.patch)
      if (!parsed.ok) {
        overlayFailures.push(
          overlayFailureToListEntry(catalogListFailureSeedRow(recordRecord), parsed.failure),
        )
        continue
      }
      storedOverlay = parsed.overlay
      const applied = applyStoredOverlay(seedBody, storedOverlay, policy)
      if (!applied.ok) {
        overlayFailures.push(
          overlayFailureToListEntry(catalogListFailureSeedRow(recordRecord), applied.failure),
        )
        continue
      }
      mergedBody = applied.result.body
      if (overlayReadDiagnosticsNonEmpty(applied.result.diagnostics)) {
        readDiagnostics = applied.result.diagnostics
      }
    }

    const systemOverlayReadMeta =
      policy !== undefined
        ? {
            seedRowIdsByPath: buildSeedRowIdsByPath(seedBody, policy),
            ...(storedOverlay ? { overlayRevision: storedOverlay.revision } : {}),
          }
        : {}

    const published: Record<string, unknown> = {
      ...recordRecord,
      ...mergedBody,
      status: 'published' as const,
      ...systemOverlayReadMeta,
      ...(readDiagnostics ? { overlayReadDiagnostics: readDiagnostics } : {}),
    }
    const rulesetId = recordRecord.rulesetId as SystemRulesetId | undefined
    const resolved = !rulesetId
      ? (published as T)
      : (reconcileContentProvenance({
          authority: 'preserve',
          catalogLayer: 'system',
          rulesetId,
          contentTypeKey: options?.contentTypeKey,
          normalized: published,
          existing: recordRecord,
        }) as unknown as T)
    resolvedSystem.push(resolved)
  }

  return { records: [...resolvedSystem, ...homebrew], overlayFailures }
}
