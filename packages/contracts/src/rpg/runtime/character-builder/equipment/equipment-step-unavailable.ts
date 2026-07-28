// ---------------------------------------------------------------------------
// Equipment step unavailable reasons — typed missing-context surface for Phase A.
// Phase B expands this into the canonical EquipmentStepModel command API.
// ---------------------------------------------------------------------------

export type EquipmentStepUnavailableReason =
  | 'class_missing'
  | 'class_not_in_catalog'
  | 'funding_context_missing'
  | 'choice_sets_loading'
  | 'ruleset_mismatch'
