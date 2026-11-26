import type { CollectionDelta, ObjectDelta } from './intent'
import type { OverlayPolicyNode } from './policy'
import {
  assertIntentCollectionMatchesPolicy,
  valueListCollectionIntentIsUnsupported,
} from './policy-consumers'
import {
  applyIntentClearFields,
  applyIntentRestoreFields,
  applyIntentSetFields,
  finalizeOverlayDraft,
} from './reconcile-intent-fields'
import {
  intentCollectionToStoredIdentity,
  normalizeScalarSet,
  overlayPolicyForRow,
  type ResolveFailure,
} from './resolve-core'
import type { StoredCollection, StoredIdentityCollection, StoredOverlay } from './stored'
import { overlayValueEqual } from './value-equal'

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function nodeAtPath(
  policy: OverlayPolicyNode,
  collectionPath: string,
  seed?: Record<string, unknown>,
): OverlayPolicyNode | undefined {
  let current: OverlayPolicyNode = policy
  if (seed) {
    const branch = overlayPolicyForRow(seed, current)
    if (branch) current = branch
  }
  if (!collectionPath || collectionPath === '<root>') return current
  const segments = collectionPath.split('.').filter(Boolean)
  for (const segment of segments) {
    if (current.kind !== 'deep') return undefined
    const next = current.fields[segment]
    if (!next) return undefined
    current = next
  }
  return current
}

function pruneCollections(
  collections: Record<string, StoredCollection> | undefined,
): Record<string, StoredCollection> | undefined {
  if (!collections) return undefined
  const next = { ...collections }
  for (const key of Object.keys(next)) {
    if (next[key] === undefined) delete next[key]
  }
  return Object.keys(next).length > 0 ? next : undefined
}

function seedValueAt(seed: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((cursor, segment) => {
    if (typeof cursor !== 'object' || cursor === null) return undefined
    return (cursor as Record<string, unknown>)[segment]
  }, seed)
}

function reconcileIdentityCollection(
  seedRows: readonly unknown[],
  current: StoredIdentityCollection | undefined,
  delta: CollectionDelta,
  policy: Extract<OverlayPolicyNode, { kind: 'identity' }>,
): { stored?: StoredCollection; failure?: ResolveFailure } {
  return intentCollectionToStoredIdentity(current, delta, seedRows, policy)
}

function reconcileCollection(
  seed: Record<string, unknown>,
  seedValue: unknown,
  current: StoredCollection | undefined,
  delta: CollectionDelta,
  policy: OverlayPolicyNode,
  path: string,
): { stored?: StoredCollection; failure?: ResolveFailure } {
  const node = nodeAtPath(policy, path, seed)
  if (!node) {
    return { failure: { code: 'overlay-validation', issues: [`Unknown collection path ${path}`] } }
  }
  if (node.kind === 'identity') {
    if (current?.kind === 'legacy-array') {
      return {
        failure: { code: 'unsupported-overlay-retention', retention: 'legacy-array', path },
      }
    }
    return reconcileIdentityCollection(
      asArray(seedValue),
      current?.kind === 'identity' ? current : undefined,
      delta,
      node,
    )
  }
  if (node.kind === 'value-list') {
    if (current?.kind === 'legacy-array') {
      return {
        failure: { code: 'unsupported-overlay-retention', retention: 'legacy-array', path },
      }
    }
    if (delta.reset) return { stored: undefined }
    if (valueListCollectionIntentIsUnsupported(delta)) {
      return {
        failure: {
          code: 'overlay-validation',
          issues: [
            `Value-list collection at ${path} only supports reset intent; edit the list via scalar set`,
          ],
        },
      }
    }
    return { stored: current }
  }
  return {
    failure: { code: 'overlay-validation', issues: [`Path ${path} is not an editable collection`] },
  }
}

function intentHasSignal(intent: ObjectDelta): boolean {
  return (
    Object.keys(intent.set ?? {}).length > 0 ||
    (intent.clear?.length ?? 0) > 0 ||
    (intent.restore?.length ?? 0) > 0 ||
    Object.keys(intent.collections ?? {}).length > 0
  )
}

// fallow-ignore-next-line complexity — branches on policy node kind for each intent field
export function reconcileStoredOverlay(
  seed: Record<string, unknown>,
  stored: StoredOverlay | null,
  intent: ObjectDelta,
  policy: OverlayPolicyNode,
): { overlay: StoredOverlay; failure?: ResolveFailure } {
  const base: StoredOverlay = stored ?? { version: 1, revision: 0 }
  if (!intentHasSignal(intent) && stored) {
    return { overlay: stored }
  }

  let draft = applyIntentSetFields(
    { overlay: { ...base }, set: { ...(base.set ?? {}) } },
    seed,
    intent,
    policy,
  )
  draft = applyIntentRestoreFields(draft, intent)
  const cleared = applyIntentClearFields(draft, seed, intent, policy)
  if (cleared.failure) return { overlay: base, failure: cleared.failure }
  draft = cleared.draft

  let next = draft.overlay
  const collections = { ...(next.collections ?? {}) }
  for (const [path, delta] of Object.entries(intent.collections ?? {})) {
    const policyIssue = assertIntentCollectionMatchesPolicy(policy, path, delta)
    if (policyIssue) {
      return { overlay: base, failure: { code: 'overlay-validation', issues: [policyIssue] } }
    }
    const seedRows = asArray(seedValueAt(seed, path))
    const reconciled = reconcileCollection(seed, seedRows, collections[path], delta, policy, path)
    if (reconciled.failure) return { overlay: base, failure: reconciled.failure }
    if (reconciled.stored === undefined) delete collections[path]
    else collections[path] = reconciled.stored
  }
  next = { ...next, collections: pruneCollections(collections) }
  next = normalizeScalarSet(seed, { ...next, set: draft.set }, policy)

  return {
    overlay: finalizeOverlayDraft({ overlay: next, set: { ...(next.set ?? {}) } }, base.revision),
  }
}

export function overlayContentEqual(
  left: StoredOverlay | null,
  right: StoredOverlay | null,
): boolean {
  return overlayValueEqual(
    left ?? { version: 1, revision: 0 },
    right ?? { version: 1, revision: 0 },
  )
}
