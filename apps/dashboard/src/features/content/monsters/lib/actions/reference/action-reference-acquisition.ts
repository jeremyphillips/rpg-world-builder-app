import type { MonsterActionDraftRow } from '../monster-action-presets'

/** Actions-section rows eligible as sources for action-reference acquisition (legendary or reaction). */
export function isActionReferenceAcquisitionTarget(row: MonsterActionDraftRow): boolean {
  return (
    row.kind === 'weapon' ||
    row.kind === 'natural-weapon' ||
    row.kind === 'attack' ||
    row.kind === 'save' ||
    row.kind === 'special'
  )
}

export function listActionReferenceAcquisitionTargets(
  rows: readonly MonsterActionDraftRow[],
): MonsterActionDraftRow[] {
  return rows.filter(isActionReferenceAcquisitionTarget)
}
