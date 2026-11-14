import type { FormValueSync } from '@rpg/ui/form'

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function stringIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((id): id is string => typeof id === 'string' && id.length > 0)
}

function rowsEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right)
}

function reconcileConditionAuthoringRow(record: Record<string, unknown>): Record<string, unknown> {
  const presence = record.presence === 'lacks' ? 'lacks' : 'has'
  const ids = stringIds(record.ids)
  const allowWilling = record.willing === true

  if (presence === 'lacks') {
    return { kind: 'condition', presence: 'lacks', ids }
  }
  if (allowWilling && ids.length === 0) {
    return { kind: 'willing' }
  }
  if (allowWilling) {
    return { kind: 'any-of', willing: true, conditionIds: ids }
  }
  return { kind: 'condition', presence: 'has', ids }
}

function reconcileAnyOfAuthoringRow(record: Record<string, unknown>): Record<string, unknown> {
  const conditionIds = stringIds(record.conditionIds)
  const authoringIds = stringIds(record.ids)
  const unifiedIds = conditionIds.length > 0 ? conditionIds : authoringIds
  const allowWilling = record.willing === true
  const presence = record.presence === 'lacks' ? 'lacks' : 'has'

  if (presence === 'lacks') {
    return { kind: 'condition', presence: 'lacks', ids: unifiedIds }
  }
  if (!allowWilling && unifiedIds.length > 0) {
    return { kind: 'condition', presence: 'has', ids: unifiedIds }
  }
  if (allowWilling && unifiedIds.length === 0) {
    return { kind: 'willing' }
  }
  if (allowWilling) {
    return { kind: 'any-of', willing: true, conditionIds: unifiedIds }
  }
  if (unifiedIds.length > 0) {
    return { kind: 'condition', presence: 'has', ids: unifiedIds }
  }
  return { kind: 'any-of' }
}

/** Normalizes one requirement row between condition authoring UI and persisted kinds. */
export function reconcileResolutionTargetRequirementRow(
  row: unknown,
): Record<string, unknown> | undefined {
  if (!isPlainRecord(row)) return undefined
  const kind = row.kind
  if (typeof kind !== 'string') return row
  if (kind === 'condition') return reconcileConditionAuthoringRow(row)
  if (kind === 'any-of') return reconcileAnyOfAuthoringRow(row)
  return row
}

/** Reconciles every row in a requirements array; returns undefined when unchanged. */
export function reconcileResolutionTargetRequirementRows(
  rows: unknown,
): Record<string, unknown>[] | undefined {
  if (!Array.isArray(rows)) return undefined
  const next = rows
    .map((row) => reconcileResolutionTargetRequirementRow(row) ?? row)
    .filter(isPlainRecord)
  if (rowsEqual(rows, next)) return undefined
  return next
}

function requirementArrayValueSync(path: string): FormValueSync {
  return {
    dependsOn: [path],
    apply: (values, changedKeys) => {
      if (!changedKeys.includes(path)) return undefined
      const next = reconcileResolutionTargetRequirementRows(values[path])
      if (!next) return undefined
      return { [path]: next }
    },
  }
}

/** Wires condition / willing / any-of authoring onto shared requirement array paths. */
export function buildResolutionTargetRequirementValueSyncs(
  paths: readonly string[],
): FormValueSync[] {
  return paths.map(requirementArrayValueSync)
}
