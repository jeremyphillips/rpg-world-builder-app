import type { ObjectDelta } from './intent'
import type { OverlayPolicyNode } from './policy'
import type { ResolveFailure } from './resolve-core'
import type { StoredCollection, StoredOverlay } from './stored'
import { overlayValueEqual } from './value-equal'

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function mergeRestoreKeys(
  current: readonly string[] | undefined,
  keys: readonly string[],
): string[] {
  const merged = new Set(current ?? [])
  for (const key of keys) merged.add(key)
  return [...merged]
}

function removeRestoreKeys(
  restore: readonly string[] | undefined,
  keys: readonly string[],
): string[] | undefined {
  const drop = new Set(keys)
  const next = (restore ?? []).filter((key) => !drop.has(key))
  return next.length > 0 ? next : undefined
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

type OverlayDraft = {
  overlay: StoredOverlay
  set: Record<string, unknown>
}

export function applyIntentScalarSet(
  draft: OverlayDraft,
  seed: Record<string, unknown>,
  key: string,
  value: unknown,
  node: OverlayPolicyNode,
): OverlayDraft {
  const { overlay, set } = draft
  if (node.kind === 'scalar' || node.kind === 'atomic') {
    if (overlayValueEqual(value, seed[key])) {
      delete set[key]
      return { overlay: { ...overlay, restore: mergeRestoreKeys(overlay.restore, [key]) }, set }
    }
    set[key] = value
    return {
      overlay: { ...overlay, restore: removeRestoreKeys(overlay.restore, [key]) },
      set,
    }
  }
  if (node.kind === 'value-list') {
    if (overlayValueEqual(value, seed[key])) {
      delete set[key]
      const collections = { ...(overlay.collections ?? {}) }
      delete collections[key]
      return {
        overlay: { ...overlay, collections: pruneCollections(collections) },
        set,
      }
    }
    set[key] = value
    const collections = { ...(overlay.collections ?? {}) }
    collections[key] = { kind: 'value-list', items: asArray(value) }
    return { overlay: { ...overlay, collections }, set }
  }
  set[key] = value
  return draft
}

export function applyIntentSetFields(
  draft: OverlayDraft,
  seed: Record<string, unknown>,
  intent: ObjectDelta,
  policy: OverlayPolicyNode,
): OverlayDraft {
  if (policy.kind !== 'deep') return draft
  let current = draft
  for (const [key, value] of Object.entries(intent.set ?? {})) {
    const node = policy.fields[key]
    if (!node) continue
    if (node.kind === 'scalar' || node.kind === 'atomic' || node.kind === 'value-list') {
      current = applyIntentScalarSet(current, seed, key, value, node)
      continue
    }
    current.set[key] = value
  }
  return current
}

export function applyIntentRestoreFields(draft: OverlayDraft, intent: ObjectDelta): OverlayDraft {
  let { overlay, set } = draft
  for (const key of intent.restore ?? []) {
    delete set[key]
    const collections = { ...(overlay.collections ?? {}) }
    delete collections[key]
    overlay = {
      ...overlay,
      collections: pruneCollections(collections),
      restore: mergeRestoreKeys(overlay.restore, [key]),
    }
  }
  const nextSet = Object.keys(set).length > 0 ? set : undefined
  return { overlay: { ...overlay, set: nextSet }, set }
}

export function applyIntentClearFields(
  draft: OverlayDraft,
  seed: Record<string, unknown>,
  intent: ObjectDelta,
  policy: OverlayPolicyNode,
): { draft: OverlayDraft; failure?: ResolveFailure } {
  void seed
  if (policy.kind !== 'deep') return { draft }
  let { overlay, set } = draft
  for (const key of intent.clear ?? []) {
    const node = policy.fields[key]
    if (node?.presence === 'required') {
      return {
        draft,
        failure: { code: 'overlay-validation', issues: [`Cannot clear required field ${key}`] },
      }
    }
    overlay = { ...overlay, clear: mergeRestoreKeys(overlay.clear, [key]) }
    delete set[key]
    if (overlay.set) {
      const nextSet = { ...overlay.set }
      delete nextSet[key]
      overlay.set = Object.keys(nextSet).length > 0 ? nextSet : undefined
    }
  }
  return { draft: { overlay, set } }
}

export function finalizeOverlayDraft(draft: OverlayDraft, revision: number): StoredOverlay {
  const { overlay, set } = draft
  const next: StoredOverlay = { ...overlay, set: Object.keys(set).length > 0 ? set : undefined }
  const hasOverlay =
    next.set !== undefined ||
    (next.clear?.length ?? 0) > 0 ||
    (next.restore?.length ?? 0) > 0 ||
    next.collections !== undefined
  return hasOverlay ? next : { version: 1, revision }
}
