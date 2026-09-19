import type { ChoiceSet } from '../../choice-set'
import {
  getProficiencyDomainCompactLabel,
  getProficiencyGrantAddLabel,
} from '../../../../vocab/proficiency'
import type { ProficiencyStepSectionKind } from './resolve-proficiency-step-model'

export const PROFICIENCY_POOL_ENUMERATION_THRESHOLD = 5 as const

const CATEGORY_PLURAL_NOUNS: Record<ProficiencyStepSectionKind, string> = {
  savingThrows: 'saving throws',
  skills: getProficiencyDomainCompactLabel('skill').toLowerCase(),
  tools: 'tools',
  languages: 'languages',
  weapons: 'weapons',
  armor: 'armor',
}

const CHOICE_TYPE_DOMAIN = {
  skillProficiency: 'skill',
  toolProficiency: 'tool',
  weaponProficiency: 'weapon',
  armorTraining: 'armor',
  language: 'language',
} as const satisfies Partial<
  Record<ChoiceSet['choiceType'], 'skill' | 'tool' | 'weapon' | 'armor' | 'language'>
>

const CHOICE_BLOCK_ADD_LABELS: Partial<Record<ChoiceSet['choiceType'], string>> = {
  language: 'Add language',
  skillProficiency: getProficiencyGrantAddLabel('skill'),
  toolProficiency: getProficiencyGrantAddLabel('tool'),
  weaponProficiency: getProficiencyGrantAddLabel('weapon'),
  armorTraining: getProficiencyGrantAddLabel('armor'),
}

const CHOICE_BLOCK_MANAGE_LABELS: Partial<Record<ChoiceSet['choiceType'], string>> = {
  skillProficiency: 'Manage skill choices',
  language: 'Manage language choices',
  toolProficiency: 'Manage tool choices',
  weaponProficiency: 'Manage weapon choices',
  armorTraining: 'Manage armor choices',
}

function isChoiceSetFull(selectedCount: number, max: number): boolean {
  return selectedCount >= max
}

function formatCountableNoun(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

function categoryPluralNoun(kind: ProficiencyStepSectionKind): string {
  return CATEGORY_PLURAL_NOUNS[kind]
}

function poolOptionNoun(choiceSet: ChoiceSet): string {
  const domain = CHOICE_TYPE_DOMAIN[choiceSet.choiceType as keyof typeof CHOICE_TYPE_DOMAIN]
  if (!domain) return 'options'
  if (domain === 'language') return formatCountableNoun(choiceSet.max, 'language', 'languages')
  if (domain === 'skill') return formatCountableNoun(choiceSet.max, 'skill', 'skills')
  if (domain === 'tool') return formatCountableNoun(choiceSet.max, 'tool', 'tools')
  if (domain === 'weapon') return formatCountableNoun(choiceSet.max, 'weapon', 'weapons')
  return 'armor'
}

function singleChoiceSetNoun(choiceSet: ChoiceSet, count: number): string {
  const domain = CHOICE_TYPE_DOMAIN[choiceSet.choiceType as keyof typeof CHOICE_TYPE_DOMAIN]
  if (!domain) {
    return formatCountableNoun(count, 'option', 'options')
  }
  if (domain === 'language') return formatCountableNoun(count, 'language', 'languages')
  if (domain === 'skill') return formatCountableNoun(count, 'skill', 'skills')
  if (domain === 'tool') return formatCountableNoun(count, 'tool', 'tools')
  if (domain === 'weapon') return formatCountableNoun(count, 'weapon', 'weapons')
  return 'armor'
}

/** Category subhead driven by choice-set topology, not source ownership. */
export function formatProficiencyCategorySubhead(
  kind: ProficiencyStepSectionKind,
  choiceSets: readonly ChoiceSet[],
): string {
  if (choiceSets.length === 0) return ''

  if (choiceSets.length === 1) {
    const choiceSet = choiceSets[0]!
    const noun = singleChoiceSetNoun(choiceSet, choiceSet.max)
    return `Choose ${choiceSet.max} ${noun} from ${choiceSet.label}.`
  }

  return `Choose additional ${categoryPluralNoun(kind)} from the options below.`
}

/** Compact pool copy for a single choice block. */
export function formatProficiencyPoolDescription(choiceSet: ChoiceSet): string {
  const { options } = choiceSet

  if (options.length <= PROFICIENCY_POOL_ENUMERATION_THRESHOLD) {
    const labels = options.map((option) => option.label).join(', ')
    return `Choose from ${labels}.`
  }

  return `Choose from ${options.length} available ${poolOptionNoun(choiceSet)}.`
}

/** Empty-well copy for an interactive category section. */
export function formatProficiencySectionEmptyMessage(
  kind: ProficiencyStepSectionKind,
  hasFixedGrantsInCategory: boolean,
): string {
  const plural = categoryPluralNoun(kind)
  if (hasFixedGrantsInCategory) {
    return `No additional ${plural} chosen yet.`
  }
  return `No ${plural} chosen yet.`
}

export type ProficiencyAggregateCount = {
  selected: number
  max: number
  label: string
}

type AggregateCountInput = {
  choiceSet: ChoiceSet
  selectedCount: number
  max: number
}

/** Aggregate category count only when every choice set is required with a fixed pick count. */
export function resolveProficiencyAggregateCount(
  choiceBlocks: readonly AggregateCountInput[],
): ProficiencyAggregateCount | null {
  if (choiceBlocks.length === 0) return null

  const allRequiredFixed = choiceBlocks.every(
    (block) => block.choiceSet.required && block.choiceSet.min === block.choiceSet.max,
  )
  if (!allRequiredFixed) return null

  const selected = choiceBlocks.reduce((sum, block) => sum + block.selectedCount, 0)
  const max = choiceBlocks.reduce((sum, block) => sum + block.max, 0)

  return {
    selected,
    max,
    label: `${selected} / ${max} chosen`,
  }
}

/** Add vs Manage drawer trigger copy for a proficiency choice block. */
export function formatProficiencyChoiceBlockAddLabel(
  choiceSet: ChoiceSet,
  selectedCount: number,
): string {
  const addLabel =
    CHOICE_BLOCK_ADD_LABELS[choiceSet.choiceType] ?? `Add ${choiceSet.label.toLowerCase()}`
  const manageLabel =
    CHOICE_BLOCK_MANAGE_LABELS[choiceSet.choiceType] ?? `Manage ${choiceSet.label.toLowerCase()}`

  return isChoiceSetFull(selectedCount, choiceSet.max) ? manageLabel : addLabel
}
