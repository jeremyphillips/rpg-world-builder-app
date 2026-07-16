export {
  RESOLUTION_METHOD_OPTIONS,
  applyMethodOptionPatch,
  getApplicationPatternAvailability,
  getEffectKindAvailability,
  getMethodAvailability,
  isEffectKindAllowedForState,
  isResolutionEffectKind,
  stateAfterPatch,
  toMethodOption,
} from './selection-availability'
export {
  outcomeApplicationsReferenceEffect,
  planOutcomeMethodChange,
  stripEffectFromOutcomes,
  type OutcomeMethodChangePlan,
} from './outcome-change-plan'
export {
  applyResolutionStructuralCleanup,
  buildIncompatibleSelectionClearPatch,
  planResolutionChange,
  resolutionChangeRequiresConfirm,
} from './selection-change-plan'
