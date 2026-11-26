import { z } from 'zod'

export type OverlayUnsupportedVersionFailure = {
  code: 'unsupported-overlay-version'
  version: unknown
}

export type OverlayUnsupportedRetentionFailure = {
  code: 'unsupported-overlay-retention'
  retention: 'legacy-array' | 'legacy-hold'
  path: string
}

export type OverlayValidationFailure = {
  code: 'overlay-validation'
  issues: readonly string[]
}

export type OverlayInvalidOrderFailure = {
  code: 'overlay-invalid-order'
  path: string
}

export type OverlayApplyFailure =
  | OverlayUnsupportedVersionFailure
  | OverlayUnsupportedRetentionFailure
  | OverlayValidationFailure
  | OverlayInvalidOrderFailure

export type OverlayReconcileFailure = OverlayApplyFailure

export type OverlayReadDiagnostics = {
  orphanedSeedOverrides: readonly string[]
  identityConflicts: readonly string[]
}

export const overlayReadDiagnosticsSchema = z.object({
  orphanedSeedOverrides: z.array(z.string().min(1)),
  identityConflicts: z.array(z.string().min(1)),
})
