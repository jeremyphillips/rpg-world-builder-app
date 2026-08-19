import type { RadioCardOption, RadioCardOptionGroup } from '@rpg/ui'

export type CreateSetupValueChangeEvent = {
  setId: string
  previousValue: string | number
  nextValue: string | number
  invalidatedSetIds: readonly string[]
  /** When true, the set is resolved without a value (optional skip affordance). */
  skipped?: boolean
}

export type CreateSetupExternalDecision = {
  id: string
  /** Values are valid/settled — sequence-level isComplete additionally requires confirmation for explicit decisions. */
  isResolved: boolean
  completion: 'auto' | 'explicit'
  /** Confirmation identity: material changes invalidate any prior confirmation. */
  revision: string
  completeLabel?: string
}

export type CreateSetupPendingExplicitDecision = {
  id: string
  isResolved: boolean
  completeLabel: string
}

export type CreateSetupSequenceModel = {
  activeSetId: string | null
  visibleSetIds: string[]
  reopenSetId: string | null
  reopen: (setId: string | null) => void
  /** True while a reopened upstream set is being edited — siblings/downstream hide on this. */
  isEditingUpstream: boolean
  /** All decisions resolved and explicit decisions confirmed at their current revision. */
  isComplete: boolean
  /** Explicit decisions currently unconfirmed — drives the derived footer action. */
  pendingExplicitDecisions: CreateSetupPendingExplicitDecision[]
  completeExplicitDecision: (id: string) => void
}

export type CreateSetupSequenceItem = {
  id: string
  isComplete: boolean
  required?: boolean
  /** Upstream set ids — when any changes, dependents are reset via the value-change event. */
  dependsOn?: readonly string[]
  /** Upstream set ids that must be complete before this set is visible — no reset. */
  visibleWhenComplete?: readonly string[]
  /** Semantic group id — completed non-active members render partial SetupSummaryCard rows. */
  summaryGroup?: string
}

export type CreateSetupSetBase = {
  id: string
  fieldLabel: string
  /** Row label in setup-phase summary; falls back to fieldLabel. */
  summaryLabel?: string
  /** Optional — radio cards may explain; compact number controls may omit. */
  prompt?: string
  required?: boolean
  dependsOn?: readonly string[]
  visibleWhenComplete?: readonly string[]
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

export type CreateSetupSet = CreateSetupChoiceSet
