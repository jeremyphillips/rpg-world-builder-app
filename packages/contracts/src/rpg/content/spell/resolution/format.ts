export {
  formatResolutionApplicationPattern,
  formatResolutionEffectsApplicationLabel,
  formatResolutionProjectilesPreview,
} from './format-application-pattern'
export {
  findResolutionDamageEffects,
  findResolutionHealingEffects,
  findResolutionTemporaryHitPointsEffects,
  formatResolutionDamage,
  formatResolutionDamageRoll,
  formatResolutionHealing,
  formatResolutionTemporaryHitPoints,
} from './format-effect-lines'
export { formatResolutionMethod } from './format-method'
export { formatResolutionOutcomeLine, formatResolutionOutcomes } from './format-outcomes'
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
  formatResolutionSummary,
  formatResolutionSummarySections,
  type SpellResolutionSummarySection,
} from './format-summary'
export {
  formatResolutionRange,
  formatResolutionSelectionSections,
  formatResolutionTarget,
  formatResolutionTargetFromParts,
  formatResolutionTargetProximityPhrase,
  RESOLUTION_AFFECTED_AREA_COPY,
  type SpellResolutionSelectionSection,
} from './format-target'
