import {
  isMultiattackAttackGroup,
  replacementCountMax,
  type MultiattackDraftStep,
} from '@rpg/contracts'
import type { FormValueSync } from '@rpg/ui/form'

import type { MonsterActionDraftRow } from '../monster-action-presets'

type MultiattackRow = Extract<MonsterActionDraftRow, { kind: 'multiattack' }>

function isMultiattackRow(row: unknown): row is MultiattackRow {
  return (
    row !== null && typeof row === 'object' && (row as { kind?: string }).kind === 'multiattack'
  )
}

function replacementStepsSignature(steps: readonly MultiattackDraftStep[] | undefined): string {
  return JSON.stringify(
    (steps ?? []).map((step) =>
      isMultiattackAttackGroup(step)
        ? { count: step.count, actionIds: step.actionIds }
        : {
            kind: 'use',
            mode: step.mode,
            actionId: (step as { actionId?: string }).actionId,
          },
    ),
  )
}

function replacementTargetingSignature(replacement: MultiattackRow['replacement']): string {
  if (!replacement) return ''
  return JSON.stringify({
    replacesActionId: replacement.replacesActionId ?? null,
    attackWord: replacement.attackWord ?? null,
  })
}

function multiattackRowById(
  actions: readonly MonsterActionDraftRow[],
): Map<string, MultiattackRow> {
  const map = new Map<string, MultiattackRow>()
  for (const row of actions) {
    if (isMultiattackRow(row)) map.set(row.id, row)
  }
  return map
}

function rowStructureChanged(before: MultiattackRow | undefined, after: MultiattackRow): boolean {
  if (!before) return true
  const stepsChanged =
    replacementStepsSignature(before.steps) !== replacementStepsSignature(after.steps)
  const targetingChanged =
    replacementTargetingSignature(before.replacement) !==
    replacementTargetingSignature(after.replacement)
  return stepsChanged || targetingChanged
}

export function clampMultiattackReplacementActions(
  before: readonly MonsterActionDraftRow[] | undefined,
  after: MonsterActionDraftRow[],
): { next: MonsterActionDraftRow[]; changed: boolean } {
  const beforeById = before ? multiattackRowById(before) : new Map()

  let changed = false
  const next = after.map((row) => {
    if (!isMultiattackRow(row) || !row.replacement) return row

    const beforeRow = beforeById.get(row.id)
    if (!rowStructureChanged(beforeRow, row)) return row

    const count = row.replacement.count
    if (typeof count !== 'number' || !Number.isInteger(count) || count < 1) return row

    const max = replacementCountMax(row.replacement, row.steps ?? [])
    if (max === undefined || max < 1 || count <= max) return row

    changed = true
    return {
      ...row,
      replacement: { ...row.replacement, count: max },
    }
  })

  return { next, changed }
}

let primedActionsSnapshot: MonsterActionDraftRow[] | undefined

/** Prime before the monster form mounts so the first edit can compare against hydrated state. */
export function primeMultiattackReplacementActionsSnapshot(
  actions: MonsterActionDraftRow[] | undefined,
): void {
  primedActionsSnapshot = actions ? structuredClone(actions) : undefined
}

export function buildMultiattackReplacementValueSyncs(): FormValueSync[] {
  return [
    {
      dependsOn: ['actions'],
      apply: (values, changedKeys) => {
        if (!changedKeys.includes('actions')) return undefined
        const actions = values.actions
        if (!Array.isArray(actions)) return undefined

        const typed = actions as MonsterActionDraftRow[]
        const before = primedActionsSnapshot
        const { next, changed } = clampMultiattackReplacementActions(before, typed)
        primedActionsSnapshot = structuredClone(changed ? next : typed)
        if (!changed) return undefined
        return { actions: next }
      },
    },
  ]
}
