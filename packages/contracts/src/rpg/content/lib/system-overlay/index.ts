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
export { buildSystemOverlayIntent, type BuildSystemOverlayIntentInput } from './build-intent'
export { buildSeedRowIdsByPath } from './seed-row-ids-by-path'
export { overlayPathToFormFieldPath } from './overlay-form-path'
export { overlayPolicyForParticipant } from './participant-policies'
export {
  EXPECTED_OVERLAY_REVISION_FIELD,
  SYSTEM_OVERLAY_INTENT_FIELD,
  mergeSystemOverlayUpdateEnvelope,
  systemOverlayUpdateEnvelopeSchema,
  type SystemOverlayUpdateEnvelope,
} from './system-overlay-update'
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
export { contentStoredOverlayPatchSchema, type ContentStoredOverlayPatch } from './patch-document'
export {
  normalizeStoredOverlayWireInput,
  parseStoredOverlay,
  pruneStoredOverlayForWire,
  stripOverlayNullLeaves,
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
