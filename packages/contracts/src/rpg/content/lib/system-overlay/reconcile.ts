import type { ObjectDelta } from './intent'
import type { OverlayReconcileFailure, OverlayReadDiagnostics } from './overlay-failures'
import { parseStoredOverlayInput } from './legacy'
import type { OverlayPolicyNode } from './policy'
import { overlayContentEqual, reconcileStoredOverlay } from './reconcile-stored'
import { resolveWithPolicy } from './resolve-core'
import type { StoredOverlay } from './stored'

export type ReconcileOverlayUpdateSuccess = {
  stored: StoredOverlay
  body: Record<string, unknown>
  diagnostics: OverlayReadDiagnostics
  unchanged: boolean
}

export type ReconcileOverlayUpdateResult =
  | { ok: true; result: ReconcileOverlayUpdateSuccess }
  | { ok: false; failure: OverlayReconcileFailure }

/** Write path: apply author intent to the stored overlay, then resolve the effective body. */
export function reconcileOverlayUpdate(
  seed: Record<string, unknown>,
  storedInput: unknown,
  intent: ObjectDelta,
  policy: OverlayPolicyNode,
): ReconcileOverlayUpdateResult {
  const parsed = parseStoredOverlayInput(storedInput)
  if (!parsed.ok) return { ok: false, failure: parsed.failure }

  const merged = reconcileStoredOverlay(seed, parsed.overlay, intent, policy)
  if (merged.failure) return { ok: false, failure: merged.failure }

  const resolved = resolveWithPolicy(seed, merged.overlay, policy)
  if (!resolved.ok) return { ok: false, failure: resolved.failure }

  const unchanged = overlayContentEqual(parsed.overlay, merged.overlay)

  return {
    ok: true,
    result: {
      stored: merged.overlay,
      body: resolved.result.value as Record<string, unknown>,
      diagnostics: resolved.result.diagnostics,
      unchanged,
    },
  }
}
