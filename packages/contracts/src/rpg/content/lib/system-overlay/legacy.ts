import { normalizeStoredOverlayWireInput, storedOverlaySchema, type StoredOverlay } from './stored'
import type { OverlayUnsupportedVersionFailure, OverlayValidationFailure } from './overlay-failures'

export type ParsedStoredOverlayInput =
  | { ok: true; overlay: StoredOverlay | null }
  | { ok: false; failure: OverlayUnsupportedVersionFailure | OverlayValidationFailure }

function readVersion(value: unknown): unknown {
  if (typeof value !== 'object' || value === null) return undefined
  return (value as Record<string, unknown>).version
}

/** Accept null/undefined as an empty overlay; reject missing or unknown versions before Zod. */
export function parseStoredOverlayInput(input: unknown): ParsedStoredOverlayInput {
  if (input === null || input === undefined) {
    return { ok: true, overlay: null }
  }
  if (typeof input !== 'object') {
    return { ok: false, failure: { code: 'unsupported-overlay-version', version: input } }
  }
  const version = readVersion(input)
  if (version === undefined) {
    return { ok: false, failure: { code: 'unsupported-overlay-version', version: undefined } }
  }
  if (version !== 1) {
    return { ok: false, failure: { code: 'unsupported-overlay-version', version } }
  }
  const parsed = storedOverlaySchema.safeParse(normalizeStoredOverlayWireInput(input))
  if (!parsed.success) {
    return {
      ok: false,
      failure: {
        code: 'overlay-validation',
        issues: parsed.error.issues.map((issue) => issue.message),
      },
    }
  }
  return { ok: true, overlay: parsed.data }
}

export function emptyStoredOverlay(revision: number): StoredOverlay {
  return { version: 1, revision }
}
