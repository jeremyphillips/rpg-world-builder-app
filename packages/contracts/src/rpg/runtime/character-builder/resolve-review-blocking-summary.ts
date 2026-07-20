import { ABILITY_IDS } from '../../vocab/ability'
import type { ChoiceSet } from './choice-set'
import type { CharacterBuildContext } from './context'
import type { CharacterBuilderDraft } from './draft'
import type { CharacterBuilderStepId } from './step-ids'
import { BUILDER_STEPS } from './steps'
import type { EquipmentPickerFocusRequest } from './resolvers/equipment/equipment-picker-focus'
import { isMagicItemGrantIncompleteIssueCode } from './resolvers/equipment/resolve-equipment-magic-item-grant-step-issues'
import { resolveUnresolvedChoiceSetSummaries } from './resolve-unresolved-choice-set-summaries'
import { validateCharacterBuild } from './validate/validate-character-build'
import type { CharacterBuildValidationIssue } from './validate/types'

export type ReviewRequiredItem = {
  id: string
  kind: 'choiceSet' | 'stepField'
  label: string
  message: string
  stepId: CharacterBuilderStepId
  stepLabel: string
  progress?: { current: number; total: number; max?: number }
  equipmentPickerFocus?: EquipmentPickerFocusRequest
}

export type ReviewNonActionableIssue = {
  issue: CharacterBuildValidationIssue
  reason: string
}

export type ReviewBlockingSummary = {
  alertIssues: CharacterBuildValidationIssue[]
  requiredItems: ReviewRequiredItem[]
  nonActionable: ReviewNonActionableIssue[]
}

const STEP_FIELD_LABELS: Record<CharacterBuilderStepId, string> = {
  identity: 'Identity',
  species: 'Species',
  class: 'Class',
  abilities: 'Ability Scores',
  proficiencies: 'Proficiencies',
  equipment: 'Equipment',
  spells: 'Spells',
  review: 'Review',
}

const REVIEW_NON_ACTIONABLE_REASON = 'No destination step for this issue.' as const

function resolveBuilderStepLabel(stepId: CharacterBuilderStepId): string {
  const step = BUILDER_STEPS.find((entry) => entry.id === stepId)
  return step?.label ?? stepId
}

function resolveAbilityScoreProgress(draft: CharacterBuilderDraft): {
  current: number
  total: number
} {
  const scores = draft.abilities.scores
  const current = ABILITY_IDS.filter((ability) => typeof scores?.[ability] === 'number').length

  return { current, total: ABILITY_IDS.length }
}

function formatChoiceProgress(selectedCount: number, min: number, max: number): string {
  if (min === max) {
    return `${selectedCount} of ${min} selected`
  }

  return `${selectedCount} selected (${min}–${max} required)`
}

function choiceSetRequiredItems(
  draft: CharacterBuilderDraft,
  choiceSets: readonly ChoiceSet[],
  alertIssues: readonly CharacterBuildValidationIssue[],
): ReviewRequiredItem[] {
  const items = new Map<string, ReviewRequiredItem>()

  for (const summary of resolveUnresolvedChoiceSetSummaries(draft, choiceSets)) {
    items.set(summary.choiceSetId, {
      id: `choiceSet:${summary.choiceSetId}`,
      kind: 'choiceSet',
      label: summary.label,
      message: summary.message,
      stepId: summary.stepId,
      stepLabel: summary.stepLabel,
      progress: { current: summary.selectedCount, total: summary.min, max: summary.max },
    })
  }

  for (const issue of alertIssues) {
    if (!issue.choiceSetId || items.has(issue.choiceSetId)) continue

    const choiceSet = choiceSets.find((entry) => entry.id === issue.choiceSetId)
    if (!choiceSet || !issue.stepId) continue

    const selectedCount = (draft.choiceSelections[choiceSet.id] ?? []).length

    items.set(issue.choiceSetId, {
      id: `choiceSet:${issue.choiceSetId}`,
      kind: 'choiceSet',
      label: choiceSet.label,
      message: issue.message,
      stepId: issue.stepId,
      stepLabel: resolveBuilderStepLabel(issue.stepId),
      progress: { current: selectedCount, total: choiceSet.min, max: choiceSet.max },
    })
  }

  return [...items.values()]
}

function stepFieldRequiredItems(
  draft: CharacterBuilderDraft,
  alertIssues: readonly CharacterBuildValidationIssue[],
): ReviewRequiredItem[] {
  const items: ReviewRequiredItem[] = []
  const seen = new Set<string>()

  for (const issue of alertIssues) {
    if (issue.choiceSetId || !issue.stepId || issue.stepId === 'review') continue

    const dedupeKey = `${issue.stepId}:${issue.code}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)

    const progress =
      issue.code === 'abilities_incomplete' ? resolveAbilityScoreProgress(draft) : undefined

    const equipmentPickerFocus =
      issue.allowanceId && isMagicItemGrantIncompleteIssueCode(issue.code)
        ? { mode: 'magic_items' as const, allowanceId: issue.allowanceId }
        : undefined

    items.push({
      id: `stepField:${issue.stepId}:${issue.code}`,
      kind: 'stepField',
      label: STEP_FIELD_LABELS[issue.stepId as CharacterBuilderStepId],
      message: issue.message,
      stepId: issue.stepId,
      stepLabel: resolveBuilderStepLabel(issue.stepId),
      progress,
      equipmentPickerFocus,
    })
  }

  return items
}

function issueMapsToRequiredItem(
  issue: CharacterBuildValidationIssue,
  requiredItems: readonly ReviewRequiredItem[],
): boolean {
  if (issue.choiceSetId) {
    return requiredItems.some((item) => item.id === `choiceSet:${issue.choiceSetId}`)
  }

  if (!issue.stepId || issue.stepId === 'review') return false

  return requiredItems.some((item) => item.id === `stepField:${issue.stepId}:${issue.code}`)
}

function resolveNonActionableIssues(
  alertIssues: readonly CharacterBuildValidationIssue[],
  requiredItems: readonly ReviewRequiredItem[],
): ReviewNonActionableIssue[] {
  return alertIssues
    .filter((issue) => !issueMapsToRequiredItem(issue, requiredItems))
    .map((issue) => ({
      issue,
      reason: REVIEW_NON_ACTIONABLE_REASON,
    }))
}

/**
 * Single review summary for the top alert and required-item cards.
 *
 * Coverage rule: every blocking alert issue maps to a required item card or is
 * listed explicitly in `nonActionable`.
 */
export function resolveReviewBlockingSummary(
  draft: CharacterBuilderDraft,
  context: CharacterBuildContext,
  resolvedChoiceSets: readonly ChoiceSet[],
  validationIssues?: CharacterBuildValidationIssue[],
): ReviewBlockingSummary {
  const alertIssues =
    validationIssues && validationIssues.length > 0
      ? validationIssues
      : validateCharacterBuild(draft, context, 'finalSubmit', { resolvedChoiceSets }).issues

  const choiceItems = choiceSetRequiredItems(draft, resolvedChoiceSets, alertIssues)
  const fieldItems = stepFieldRequiredItems(draft, alertIssues)
  const requiredItems = [...choiceItems, ...fieldItems]
  const nonActionable = resolveNonActionableIssues(alertIssues, requiredItems)

  return { alertIssues, requiredItems, nonActionable }
}

export function formatReviewRequiredItemProgress(item: ReviewRequiredItem): string | null {
  if (!item.progress) return null

  const { current, total, max = total } = item.progress

  if (item.kind === 'choiceSet') {
    return formatChoiceProgress(current, total, max)
  }

  return `${current} of ${total} assigned`
}
