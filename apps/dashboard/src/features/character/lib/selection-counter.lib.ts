import type { ChoiceSet, ChoiceType } from '@rpg/contracts'
import { getProficiencyGrantAddLabel } from '@rpg/contracts'

export const BUILDER_SELECTION_FULL_NOTICE = 'Selection full' as const

type ChoiceSetDrawerLabelPair = {
  add: string
  manage: string
}

const CHOICE_SET_DRAWER_LABELS: Partial<Record<ChoiceType, ChoiceSetDrawerLabelPair>> = {
  cantrip: { add: 'Add cantrip', manage: 'Manage cantrips' },
  spell: { add: 'Add spell', manage: 'Manage spells' },
  skillProficiency: { add: getProficiencyGrantAddLabel('skill'), manage: 'Manage skill choices' },
  language: { add: 'Add language', manage: 'Manage language choices' },
  toolProficiency: { add: getProficiencyGrantAddLabel('tool'), manage: 'Manage tool choices' },
  weaponProficiency: {
    add: getProficiencyGrantAddLabel('weapon'),
    manage: 'Manage weapon choices',
  },
  armorTraining: { add: getProficiencyGrantAddLabel('armor'), manage: 'Manage armor choices' },
  feat: { add: 'Add feat', manage: 'Manage feat choices' },
}

export type ChoiceSetSelectionCounts = {
  selectedCount: number
  max: number
}

export function formatSelectionCounter(selectedCount: number, max: number): string {
  return `Selected: ${selectedCount} / ${max}`
}

export function isChoiceSetFull(selectedCount: number, max: number): boolean {
  return selectedCount >= max
}

export function isChoiceSetOverSelected(selectedCount: number, max: number): boolean {
  return selectedCount > max
}

export function isChoiceSetSelectionFull(
  choiceSet: Pick<ChoiceSet, 'max'>,
  selectedIds: readonly string[],
): boolean {
  return isChoiceSetFull(selectedIds.length, choiceSet.max)
}

export function isChoiceSetSelectionOverSelected(
  choiceSet: Pick<ChoiceSet, 'max'>,
  selectedIds: readonly string[],
): boolean {
  return isChoiceSetOverSelected(selectedIds.length, choiceSet.max)
}

function drawerLabelsForChoiceSet(choiceSet: ChoiceSet): ChoiceSetDrawerLabelPair {
  const labels = CHOICE_SET_DRAWER_LABELS[choiceSet.choiceType]
  if (labels) return labels

  // Legacy escape hatch only — prefer explicit CHOICE_SET_DRAWER_LABELS entries for new choice types.
  const lower = choiceSet.label.toLowerCase()
  return {
    add: `Add ${lower}`,
    manage: `Manage ${lower}`,
  }
}

/** Add vs Manage drawer trigger copy when a bounded ChoiceSet is open for review. */
export function formatChoiceSetDrawerTriggerLabel(
  choiceSet: ChoiceSet,
  counts: ChoiceSetSelectionCounts,
): string {
  const labels = drawerLabelsForChoiceSet(choiceSet)
  return isChoiceSetFull(counts.selectedCount, counts.max) ? labels.manage : labels.add
}
