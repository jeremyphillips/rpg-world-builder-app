import { multiattackUseClauseHasRepetition, type MultiattackDraftStep } from '@rpg/contracts'
import type { FormValueSync } from '@rpg/ui/form'

import type { MonsterActionDraftRow } from '../monster-action-presets'
import { multiattackActionsBeforeEdit } from './monster-multiattack-replacement-form-sync'
import { multiattackUseStepShouldClearRepetitionOnActionChange } from './monster-multiattack-use-action-transition.lib'

type MultiattackRow = Extract<MonsterActionDraftRow, { kind: 'multiattack' }>
type UseStepLike = {
  kind?: string
  mode?: string
  actionId?: string
  count?: unknown
  choices?: unknown[]
}

function isMultiattackRow(row: unknown): row is MultiattackRow {
  return (
    row !== null && typeof row === 'object' && (row as { kind?: string }).kind === 'multiattack'
  )
}

function isSingleUseStep(step: UseStepLike): boolean {
  if (step.mode === 'choice') return false
  if (Array.isArray(step.choices) && step.choices.length > 0) return false
  return step.kind === 'use' || Boolean(step.actionId)
}

function actionKind(
  actionId: string | undefined,
  actions: readonly MonsterActionDraftRow[],
): string | undefined {
  if (!actionId) return undefined
  return actions.find((row) => row.id === actionId)?.kind
}

function clearSpellRepetitionOnActionChange(
  beforeStep: UseStepLike | undefined,
  afterStep: UseStepLike,
  actions: readonly MonsterActionDraftRow[],
): UseStepLike {
  const beforeId = typeof beforeStep?.actionId === 'string' ? beforeStep.actionId : undefined
  const afterId = typeof afterStep.actionId === 'string' ? afterStep.actionId : undefined
  if (!afterId || beforeId === afterId || !multiattackUseClauseHasRepetition(afterStep.count)) {
    return afterStep
  }
  const kind = actionKind(afterId, actions)
  if (
    !multiattackUseStepShouldClearRepetitionOnActionChange({
      previousActionId: beforeId,
      nextActionId: afterId,
      nextActionKind: kind,
      count: afterStep.count,
    })
  ) {
    return afterStep
  }
  return { ...afterStep, count: undefined }
}

function reconcileStepList(
  beforeSteps: readonly MultiattackDraftStep[] | undefined,
  afterSteps: readonly MultiattackDraftStep[] | undefined,
  actions: readonly MonsterActionDraftRow[],
): { steps: MultiattackDraftStep[]; changed: boolean } {
  const before = beforeSteps ?? []
  const after = afterSteps ?? []
  let changed = false
  const next = after.map((step, index) => {
    if (!isSingleUseStep(step as UseStepLike)) return step
    const beforeStep = before[index] as UseStepLike | undefined
    const afterStep = step as UseStepLike
    const hadCount = afterStep.count !== undefined
    const reconciled = clearSpellRepetitionOnActionChange(beforeStep, afterStep, actions)
    if (hadCount && reconciled.count === undefined) {
      changed = true
      const { count: _count, ...rest } = afterStep
      return rest as MultiattackDraftStep
    }
    return step
  })
  return { steps: next, changed }
}

function reconcileMultiattackRowSpellRepetition(
  beforeRow: MultiattackRow | undefined,
  row: MultiattackRow,
  actions: readonly MonsterActionDraftRow[],
): { next: MultiattackRow; changed: boolean } {
  const primary = reconcileStepList(beforeRow?.steps, row.steps, actions)
  const alternative = reconcileStepList(
    beforeRow?.alternative?.steps,
    row.alternative?.steps,
    actions,
  )
  const changed = primary.changed || alternative.changed
  if (!changed) return { next: row, changed: false }
  return {
    changed: true,
    next: {
      ...row,
      steps: primary.changed ? primary.steps : row.steps,
      alternative:
        row.alternative && alternative.changed
          ? { ...row.alternative, steps: alternative.steps }
          : row.alternative,
    },
  }
}

function clearSpellUseRepetitionOnActionChange(
  before: readonly MonsterActionDraftRow[] | undefined,
  after: MonsterActionDraftRow[],
): { next: MonsterActionDraftRow[]; changed: boolean } {
  let changed = false
  const next = after.map((row) => {
    if (!isMultiattackRow(row)) return row
    const beforeRow = before?.find((entry) => entry.id === row.id)
    const reconciled = reconcileMultiattackRowSpellRepetition(
      beforeRow && isMultiattackRow(beforeRow) ? beforeRow : undefined,
      row,
      after,
    )
    if (reconciled.changed) changed = true
    return reconciled.next
  })

  return { next, changed }
}

export function buildMultiattackUseRepetitionValueSyncs(): FormValueSync[] {
  return [
    {
      dependsOn: ['actions'],
      apply: (values, changedKeys) => {
        if (!changedKeys.includes('actions')) return undefined
        const actions = values.actions
        if (!Array.isArray(actions)) return undefined

        const typed = actions as MonsterActionDraftRow[]
        const before = multiattackActionsBeforeEdit()
        const { next, changed } = clearSpellUseRepetitionOnActionChange(before, typed)
        if (!changed) return undefined
        return { actions: next }
      },
    },
  ]
}
