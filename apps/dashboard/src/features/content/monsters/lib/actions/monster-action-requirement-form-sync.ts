import type { FormValueSync } from '@rpg/ui/form'

import { reconcileResolutionTargetRequirementRows } from '../../../lib/forms/fields/resolution-target-requirement-form-sync.lib'

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function rowsEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

const MONSTER_ACTION_COLLECTIONS = [
  'actions',
  'bonusActions',
  'reactions',
  'legendaryActions',
] as const

function patchRequirementsOnRecord<T extends Record<string, unknown>>(
  record: T,
  key: keyof T,
): { next: T; changed: boolean } {
  const requirements = reconcileResolutionTargetRequirementRows(record[key])
  if (!requirements || rowsEqual(record[key], requirements)) {
    return { next: record, changed: false }
  }
  return { next: { ...record, [key]: requirements }, changed: true }
}

function reconcileActionRequirementPaths(action: unknown): unknown {
  if (!isPlainRecord(action)) return action

  let nextAction: Record<string, unknown> = action
  if (isPlainRecord(action.passenger)) {
    const passengerPatch = patchRequirementsOnRecord(action.passenger, 'requirements')
    if (passengerPatch.changed) {
      nextAction = { ...nextAction, passenger: passengerPatch.next }
    }
  }

  const resolution = nextAction.resolution
  if (!isPlainRecord(resolution)) return nextAction

  let nextResolution = resolution
  const occupantPatch = patchRequirementsOnRecord(resolution, 'occupantRequirements')
  if (occupantPatch.changed) nextResolution = occupantPatch.next

  if (isPlainRecord(nextResolution.target)) {
    const targetPatch = patchRequirementsOnRecord(nextResolution.target, 'requirements')
    if (targetPatch.changed) {
      nextResolution = { ...nextResolution, target: targetPatch.next }
    }
  }

  if (nextResolution === resolution && nextAction === action) return action
  return { ...nextAction, resolution: nextResolution }
}

/** Monster action arrays nest requirement lists; reconcile them when any action row changes. */
export function buildMonsterActionRequirementValueSyncs(): FormValueSync[] {
  return MONSTER_ACTION_COLLECTIONS.map((collection) => ({
    dependsOn: [collection],
    apply: (values, changedKeys) => {
      if (!changedKeys.includes(collection)) return undefined
      const actions = values[collection]
      if (!Array.isArray(actions)) return undefined
      const next = actions.map(reconcileActionRequirementPaths)
      if (rowsEqual(actions, next)) return undefined
      return { [collection]: next }
    },
  }))
}
