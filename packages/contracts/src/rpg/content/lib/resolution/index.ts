export {
  RESOLUTION_PRIMARY_DAMAGE_EFFECT_ID,
  RESOLUTION_PRIMARY_HEALING_EFFECT_ID,
  RESOLUTION_PRIMARY_TEMPORARY_HIT_POINTS_EFFECT_ID,
  effectResolutionFieldShape,
  effectResolutionMethodSchema,
  effectResolutionSchema,
  resolutionApplicationSchema,
  resolutionAutomaticMethodSchema,
  resolutionDamageEffectSchema,
  resolutionEffectIdSchema,
  resolutionEffectSchema,
  resolutionHealingEffectSchema,
  resolutionOriginSchema,
  resolutionOutcomeSchema,
  resolutionSavingThrowMethodSchema,
  resolutionSelectionModeSchema,
  resolutionTargetProximitySchema,
  DEFAULT_RESOLUTION_TARGET,
  resolutionTargetSchema,
  resolutionTemporaryHitPointsEffectSchema,
  validateEffectResolution,
  type EffectResolution,
  type EffectResolutionMethod,
  type EffectResolutionValidationInput,
  type ResolutionApplication,
  type ResolutionDamageEffect,
  type ResolutionEffect,
  type ResolutionEffectId,
  type ResolutionHealingEffect,
  type ResolutionOrigin,
  type ResolutionOutcome,
  type ResolutionTarget,
  type ResolutionTargetProximity,
  type ResolutionEnvelopeBase,
  type ResolutionFormatInput,
  type ResolutionTemporaryHitPointsEffect,
} from './schema'
export {
  deriveDefaultEffectRecipient,
  deriveEffectRecipientFromResolution,
  isResolutionTargetConfigured,
  resolutionEffectFormatOptions,
} from './effect-context'
export {
  getEffectTargetAvailability,
  isCreatureOnlyResolutionEffectKind,
  isEffectKindAllowedForTarget,
  type CreatureOnlyResolutionEffectKind,
  type EffectTargetCompatibilityContext,
} from './effect-target-compatibility'
export { formatEffectResolutionMethod, type ResolutionMethodFormatRegister } from './format-method'
export {
  findResolutionDamageEffects,
  findResolutionHealingEffects,
  findResolutionTemporaryHitPointsEffects,
  formatResolutionDamage,
  formatResolutionDamageRoll,
  formatResolutionDamageValue,
  formatResolutionHealing,
  formatResolutionTemporaryHitPoints,
  formatResolutionApplicationSentence,
} from './format-effect-lines'
export { formatResolutionOutcomeLine, formatResolutionOutcomes } from './format-outcomes'
export {
  formatResolutionAffectedAreaCopy,
  formatResolutionSelectionSections,
  formatResolutionTarget,
  formatResolutionTargetFromParts,
  formatResolutionTargetProximityPhrase,
  resolutionTargetCountSelectOptions,
  RESOLUTION_AFFECTED_AREA_COPY,
  type ResolutionSelectionSection,
} from './format-target'
export {
  formatAreaOccupantCreaturePhrase,
  formatTargetHeadNoun,
  formatTargetQualifyingClauses,
  formatTargetSightPhrase,
} from './format-target-composition'
export {
  formatResolutionRequirementRowTitle,
  type ResolutionRequirementRowTitleOptions,
} from './format-requirement-row-title'
export {
  collectRequirementListIssues,
  formatRequirementTargetMenuNote,
  getRequirementAllowedPopulations,
  getRequirementAppendListConflict,
  getRequirementTargetIncompatibility,
  isRequirementCompatibleWithTargetKind,
  readRequirementCompatibilityInput,
  refineRequirementRowsForTargetKind,
  resolveRequirementAddMenuDisabledNote,
  type RequirementCompatibilityInput,
  type RequirementListIssueCode,
  type RequirementPopulation,
  type RequirementTargetIncompatibilityReason,
} from './requirement-target-compatibility'
export {
  formatRequirementTargetIncompatibilityMessage,
  type RequirementTargetMessageTone,
} from './requirement-target-messages'
export {
  refineRequirementsForTargetKind,
  resolutionTargetRequirementSchema,
  resolutionTargetRequirementsSchema,
  resolutionTargetRequirementValidationMessages,
  type ResolutionTargetRequirement,
} from './target-requirements'
export {
  formatEffectResolutionSummary,
  formatEffectResolutionSummarySections,
  formatResolutionEffectSummarySections,
  type ResolutionSummarySection,
} from './format-summary'
export {
  getSpellResolutionOutcomeAuthoringLabel,
  SPELL_RESOLUTION_CONVENTIONAL_PRIMARY_OUTCOME,
  SPELL_RESOLUTION_OUTCOME_AUTHORING_LABELS,
} from './outcome-display'
export {
  buildDefaultOutcomeSlots,
  effectKindsSupportingPartialApplication,
  ensureOutcomeSlotsForMethod,
  findOutcomeByResult,
  getOutcomeResultsForMethod,
  hasMeaningfulOutcomeContent,
  isOutcomeEmpty,
  normalizeOutcomeOrder,
  stripEmptyOutcomeSlots,
  supportsPartialApplicationForEffectKind,
  type OutcomeLike,
} from './outcome-slots'
export {
  outcomeApplicationsReferenceEffect,
  planOutcomeMethodChange,
  stripEffectFromOutcomes,
  type OutcomeMethodChangePlan,
} from './outcome-change-plan'
export { mapOutcomeResultBetweenMethodKinds } from './outcome-method-map'
export {
  getSelectionMethodCapabilityRequired,
  getSelectionMethodCompatibility,
  getSelectionMethodCompatibilityReasonCode,
  isSelectionMethodAllowed,
  methodOptionToMethodKind,
  resolveSelectionMethodContextKey,
  resolveSelectionModeFromState,
  SELECTION_METHOD_COMPATIBILITY_MATRIX,
  SELECTION_METHOD_COMPATIBILITY_REASON_CODES,
  selectionMethodContextFromState,
  validateResolutionMethodCompatibility,
  type SelectionMethodCompatibility,
  type SelectionMethodCompatibilityReasonCode,
  type SelectionMethodContextKey,
} from './selection-method-compatibility'
export {
  applyMethodOptionPatch,
  applyResolutionStructuralCleanup,
  buildIncompatibleSelectionClearPatch,
  getApplicationPatternAvailability,
  getEffectKindAvailability,
  getMethodAvailability,
  isEffectKindAllowedForState,
  isResolutionEffectKind,
  planResolutionChange,
  resolutionChangeRequiresConfirm,
  RESOLUTION_METHOD_OPTIONS,
  toMethodOption,
} from './selection-policy'
export type {
  IncompatibleSelection,
  OptionAvailability,
  ResolutionApplicationPatternFormKind,
  ResolutionAvailabilityReason,
  ResolutionChangePlan,
  ResolutionChangeRequest,
  ResolutionEffectKind,
  ResolutionEffectRef,
  ResolutionMethodOption,
  ResolutionOutcomeRef,
  ResolutionPatch,
  ResolutionSelectionField,
  ResolutionSelectionState,
  ResolutionWarning,
  ResolutionWarningCode,
} from './selection-types'
export { spellResolutionValidationMessages } from './validation-messages'
