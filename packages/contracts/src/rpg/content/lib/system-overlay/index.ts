export {
  overlayAtomic,
  overlayIdentityArray,
  overlayValueArray,
  readOverlaySchemaMeta,
  type OverlayCollectionMeta,
  type OverlayIdentityMeta,
  type OverlaySchemaMeta,
  type OverlayValueListMeta,
} from './annotate'
export {
  compileOverlayPolicy,
  requireCompiledOverlayPolicy,
  type CompiledOverlayPolicy,
} from './compile-policy'
export { overlayIdSchema, UNSAFE_OVERLAY_IDS } from './ids'
export {
  parseSystemOverlayIntent,
  systemOverlayIntentSchema,
  type CollectionDelta,
  type ObjectDelta,
  type SeedFieldDelta,
  type SeedRowReplace,
} from './intent'
export { overlayPathOverrides } from './path-overrides'
export {
  assertIntentCollectionMatchesPolicy,
  assertStoredCollectionMatchesPolicy,
  restoreCollectionPaths,
  type OverlayPolicyPath,
} from './policy-consumers'
export {
  compileSystemOverlayParticipants,
  systemOverlayParticipants,
  type CompiledParticipantPolicy,
  type SystemOverlayParticipantId,
} from './participants'
export { type OverlayPolicyNode, type OverlayPresence, type OverlayUnionBranch } from './policy'
export {
  overlayDeleteEntryIdRows,
  overlayDeleteIdRows,
  overlayImmaterialIdRows,
  overlayOrderedList,
  overlayRestoreIdRows,
  overlaySlugList,
} from './overlay-presets'
export { collectSchemaCollections, describeOverlaySchema, type SchemaFact } from './schema-tree'
export {
  parseStoredOverlay,
  storedOverlaySchema,
  type HomebrewAddition,
  type LegacyHold,
  type StoredSeedOverride,
  type StoredCollection,
  type StoredIdentityCollection,
  type StoredOverlay,
} from './stored'
export {
  applyStoredOverlay,
  type ApplyStoredOverlayResult,
  type ApplyStoredOverlaySuccess,
} from './apply'
export {
  reconcileOverlayUpdate,
  type ReconcileOverlayUpdateResult,
  type ReconcileOverlayUpdateSuccess,
} from './reconcile'
export {
  parseStoredOverlayInput,
  emptyStoredOverlay,
  type ParsedStoredOverlayInput,
} from './legacy'
export {
  type OverlayApplyFailure,
  type OverlayReconcileFailure,
  type OverlayReadDiagnostics,
  type OverlayUnsupportedRetentionFailure,
  type OverlayUnsupportedVersionFailure,
  type OverlayValidationFailure,
  type OverlayInvalidOrderFailure,
} from './overlay-failures'
