import type { OverlayApplyFailure, OverlayReadDiagnostics } from './overlay-failures'
import { parseStoredOverlayInput } from './legacy'
import type { OverlayPolicyNode } from './policy'
import { resolveWithPolicy } from './resolve-core'

export type ApplyStoredOverlaySuccess = {
  body: Record<string, unknown>
  diagnostics: OverlayReadDiagnostics
}

export type ApplyStoredOverlayResult =
  | { ok: true; result: ApplyStoredOverlaySuccess }
  | { ok: false; failure: OverlayApplyFailure }

/** Read path: merge a versioned stored overlay onto the current seed using policy. */
export function applyStoredOverlay(
  seed: Record<string, unknown>,
  storedInput: unknown,
  policy: OverlayPolicyNode,
): ApplyStoredOverlayResult {
  const parsed = parseStoredOverlayInput(storedInput)
  if (!parsed.ok) return { ok: false, failure: parsed.failure }

  const resolved = resolveWithPolicy(seed, parsed.overlay, policy)
  if (!resolved.ok) return { ok: false, failure: resolved.failure }

  return {
    ok: true,
    result: {
      body: resolved.result.value as Record<string, unknown>,
      diagnostics: resolved.result.diagnostics,
    },
  }
}
