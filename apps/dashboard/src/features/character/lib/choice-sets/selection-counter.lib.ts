import type { ChoiceSet, ChoiceType } from '@rpg/contracts'
import {
  getLanguageGrantAddLabel,
  getLanguageGrantManageLabel,
  getProficiencyGrantAddLabel,
  getProficiencyGrantManageLabel,
} from '@rpg/contracts'

export const BUILDER_SELECTION_FULL_NOTICE = 'Selection full' as const

type ChoiceSetDrawerLabelPair = {
  add: string
  manage: string
}

const CHOICE_SET_DRAWER_LABELS: Partial<Record<ChoiceType, ChoiceSetDrawerLabelPair>> = {
  cantrip: { add: 'Add cantrip', manage: 'Manage cantrips' },
  spell: { add: 'Add spell', manage: 'Manage spells' },
  skillProficiency: {
    add: getProficiencyGrantAddLabel('skill'),
    manage: getProficiencyGrantManageLabel('skill'),
  },
  language: { add: getLanguageGrantAddLabel(), manage: getLanguageGrantManageLabel() },
  toolProficiency: {
    add: getProficiencyGrantAddLabel('tool'),
    manage: getProficiencyGrantManageLabel('tool'),
  },
  weaponProficiency: {
    add: getProficiencyGrantAddLabel('weapon'),
    manage: getProficiencyGrantManageLabel('weapon'),
  },
  armorTraining: {
    add: getProficiencyGrantAddLabel('armor'),
    manage: getProficiencyGrantManageLabel('armor'),
  },
  feat: { add: 'Add feat', manage: 'Manage feat choices' },
}

export type ChoiceSetSelectionCounts = {
  selectedCount: number
  max: number
}

export function formatSelectionCounter(selectedCount: number, max: number): string {
  return `Selected: ${selectedCount} / ${max}`
}

const SPELL_SELECTION_CHOICE_TYPES = new Set<ChoiceType>(['cantrip', 'spell'])

/**
 * "Selection full" complements proficiencies when the drawer is in Manage mode.
 * Hide for spells/cantrips — Manage remains the primary swap action there.
 */
export function shouldShowSelectionFullNotice(
  choiceSet: Pick<ChoiceSet, 'choiceType'>,
  isFull: boolean,
  drawerTriggerLabel: string,
): boolean {
  if (!isFull || !drawerTriggerLabel.startsWith('Manage')) return false
  return !SPELL_SELECTION_CHOICE_TYPES.has(choiceSet.choiceType)
}

export function isChoiceSetFull(selectedCount: number, max: number): boolean {
  return selectedCount >= max
}

/** True when the selection exactly meets the required count (not over-selected). */
export function isChoiceSetAtCapacity(selectedCount: number, max: number): boolean {
  return max > 0 && selectedCount === max
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
