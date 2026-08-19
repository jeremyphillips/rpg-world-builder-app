import type { NumberStepperDigits, RadioCardOption, RadioCardOptionGroup } from '@rpg/ui'

export type CreateSetupValueChangeEvent = {
  setId: string
  previousValue: string | number
  nextValue: string | number
  invalidatedSetIds: readonly string[]
  /** When true, the set is resolved without a value (optional skip affordance). */
  skipped?: boolean
}

export type CreateSetupSequenceModel = {
  activeSetId: string | null
  visibleSetIds: string[]
  collapsedCompleteSetIds: string[]
  reopenSetId: string | null
  reopen: (setId: string | null) => void
  /** True while a reopened upstream set is being edited — siblings/downstream hide on this. */
  isEditingUpstream: boolean
  canContinue: boolean
}

export type CreateSetupSequenceItem = {
  id: string
  isComplete: boolean
  required?: boolean
  /** Upstream set ids — when any changes, dependents are reset via the value-change event. */
  dependsOn?: readonly string[]
  /** Upstream set ids that must be complete before this set is visible — no reset. */
  visibleWhenComplete?: readonly string[]
  /**
   * Presentation: when false, completed visible sets stay expanded.
   * Does not affect `isComplete`. @default true
   */
  collapseWhenComplete?: boolean
  /**
   * Presentation: when true, a completed set collapses even while it remains
   * the active terminal set. Opt-in for flows that should summarize after seeding.
   */
  collapseWhenActiveAndComplete?: boolean
  /** Semantic group id — collapsed-complete members render one grouped SetupSummaryCard. */
  summaryGroup?: string
}

export type CreateSetupSetBase = {
  id: string
  fieldLabel: string
  /** Optional — radio cards may explain; compact number controls may omit. */
  prompt?: string
  required?: boolean
  dependsOn?: readonly string[]
  visibleWhenComplete?: readonly string[]
  collapseWhenComplete?: boolean
  collapseWhenActiveAndComplete?: boolean
  summaryGroup?: string
  /** Eyebrow for grouped setup-phase summary when `summaryGroup` is set. */
  summaryGroupEyebrow?: string
  isComplete: boolean
}

export type CreateSetupChoiceSet = CreateSetupSetBase & {
  kind: 'choice'
  options: RadioCardOption[]
  optionGroups?: RadioCardOptionGroup[]
  value: string
  /** Optional sets: explicit skip affordance label (e.g. "Skip / Not specified"). */
  skipLabel?: string
  /** When true, summary shows `skippedValueLabel` instead of the selected option. */
  skipped?: boolean
  skippedValueLabel?: string
}

export type CreateSetupNumberSet = CreateSetupSetBase & {
  kind: 'number'
  value: number
  min: number
  max: number
  digits?: NumberStepperDigits
}

export type CreateSetupSet = CreateSetupChoiceSet | CreateSetupNumberSet
