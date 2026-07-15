import type {
  SpellResolutionAttackType,
  SpellResolutionOutcomeResult,
  SpellResolutionProximityKind,
  SpellResolutionTargetKind,
} from './vocab'

/** Combined method select value used by resolution authoring UI. */
export type ResolutionMethodOption = SpellResolutionAttackType | 'saving-throw' | 'automatic'

export type ResolutionApplicationPatternFormKind = 'none' | 'projectiles'

export type ResolutionEffectKind = 'damage' | 'healing' | 'temporary-hit-points'

/** Minimal effect row reference for selection policy and change planning. */
export type ResolutionEffectRef = {
  id: string
  kind: ResolutionEffectKind | string
}

/** Minimal outcome row for selection policy and change planning. */
export type ResolutionOutcomeRef = {
  result: SpellResolutionOutcomeResult
  applications: readonly { effectId: string; amount: string }[]
  note?: string
}

/** Flattened resolution slice used by availability predicates and change planning. */
export type ResolutionSelectionState = {
  proximityKind: SpellResolutionProximityKind
  proximityDistanceFt?: number
  proximityReachDistanceFt?: number
  targetKind?: string
  targetCount?: number
  methodKind?: 'attack' | 'saving-throw' | 'automatic'
  attackType?: SpellResolutionAttackType
  saveAbility?: string
  applicationPatternKind?: ResolutionApplicationPatternFormKind
  projectileCount?: number
  projectileUnitLabelSingular?: string
  projectileUnitLabelPlural?: string
  effects?: readonly ResolutionEffectRef[]
  outcomes?: readonly ResolutionOutcomeRef[]
}

export type ResolutionSelectionField = 'proximityKind' | 'methodOption' | 'applicationPatternKind'

export type ResolutionChangeRequest =
  | { field: 'proximityKind'; value: SpellResolutionProximityKind }
  | { field: 'methodOption'; value: ResolutionMethodOption }
  | { field: 'applicationPatternKind'; value: ResolutionApplicationPatternFormKind }
  | { field: 'removeEffect'; effectId: string }

export type ResolutionPatch = Partial<ResolutionSelectionState>

export type IncompatibleSelection =
  | { field: 'method'; currentOption: ResolutionMethodOption }
  | { field: 'applicationPattern'; currentKind: 'projectiles' }

export type ResolutionWarningCode =
  | 'self-with-damage'
  | 'automatic-distance-without-pattern'
  | 'check-without-damage-effect'
  | 'multiple-healing-effects'
  | 'multiple-temporary-hit-points-effects'
  | 'creature-only-effect-with-non-creature-target'

export type ResolutionWarning = {
  code: ResolutionWarningCode
}

export type ResolutionAvailabilityReason =
  | {
      code: 'method-incompatible-with-proximity'
      method: ResolutionMethodOption
      proximity: SpellResolutionProximityKind
    }
  | { code: 'pattern-requires-distance-proximity'; pattern: 'projectiles' }
  | {
      code: 'effect-kind-unsupported-for-method'
      kind: ResolutionEffectKind
      method: ResolutionMethodOption
    }
  | {
      code: 'effect-kind-incompatible-with-target'
      kind: ResolutionEffectKind
      targetKind: SpellResolutionTargetKind
    }

export type OptionAvailability = {
  allowed: boolean
  reason?: ResolutionAvailabilityReason
  severity?: 'unsupported' | 'warning'
}

export type ResolutionChangePlan = {
  /** The field the user explicitly changed */
  requestedPatch: ResolutionPatch
  /** Safe dependent-field cleanup only — no semantic substitution */
  cleanupPatch: ResolutionPatch
  /** Semantic selections that become invalid and require author action */
  incompatibleSelections: IncompatibleSelection[]
  /** Effect rows that would be removed if the change is applied */
  effectsToRemove: ResolutionEffectRef[]
  /** Outcome branches that would lose authored content on method change */
  discardedOutcomeBranches: readonly SpellResolutionOutcomeResult[]
  /** Mapped outcomes after a method change (form-shaped, includes empty slots) */
  outcomePatch?: { outcomes: readonly ResolutionOutcomeRef[] }
  warnings: ResolutionWarning[]
}
