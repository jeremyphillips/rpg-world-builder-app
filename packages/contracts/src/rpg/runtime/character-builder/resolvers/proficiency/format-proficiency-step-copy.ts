import type { ChoiceSet } from '../../choice-set'
import {
  getLanguageGrantAddLabel,
  getLanguageGrantCompactAddLabel,
  getLanguageGrantCompactManageLabel,
  getLanguageGrantManageLabel,
  getLanguageProficiencySentenceForm,
} from '../../../../vocab/language'
import {
  getProficiencyDomainCompactActionNoun,
  getProficiencyGrantAddLabel,
  getProficiencyGrantCompactAddLabel,
  getProficiencyGrantCompactManageLabel,
  getProficiencyGrantManageLabel,
} from '../../../../vocab/proficiency'
import type { ProficiencyStepSectionKind } from './resolve-proficiency-step-model'

export const PROFICIENCY_POOL_ENUMERATION_THRESHOLD = 5 as const

const CATEGORY_PLURAL_NOUNS: Record<ProficiencyStepSectionKind, string> = {
  savingThrows: 'saving throws',
  skills: getProficiencyDomainCompactActionNoun('skill', 2),
  tools: getProficiencyDomainCompactActionNoun('tool', 2),
  languages: getLanguageProficiencySentenceForm(2),
  weapons: getProficiencyDomainCompactActionNoun('weapon', 2),
  armor: getProficiencyDomainCompactActionNoun('armor', 2),
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

type ProficiencyChoiceDomain = (typeof CHOICE_TYPE_DOMAIN)[keyof typeof CHOICE_TYPE_DOMAIN]

function isChoiceSetFull(selectedCount: number, max: number): boolean {
  return selectedCount >= max
}

function formatCountableNoun(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

function categoryPluralNoun(kind: ProficiencyStepSectionKind): string {
  return CATEGORY_PLURAL_NOUNS[kind]
}

function choiceDomainFor(choiceSet: ChoiceSet): ProficiencyChoiceDomain | undefined {
  return CHOICE_TYPE_DOMAIN[choiceSet.choiceType as keyof typeof CHOICE_TYPE_DOMAIN]
}

function choiceBlockAddLabelFor(choiceSet: ChoiceSet, compact: boolean): string {
  const domain = choiceDomainFor(choiceSet)
  if (domain === 'language') {
    return compact ? getLanguageGrantCompactAddLabel() : getLanguageGrantAddLabel()
  }
  if (domain) {
    return compact
      ? getProficiencyGrantCompactAddLabel(domain)
      : getProficiencyGrantAddLabel(domain)
  }
  return `Add ${choiceSet.label.toLowerCase()}`
}

function choiceBlockManageLabelFor(choiceSet: ChoiceSet, compact: boolean): string {
  const domain = choiceDomainFor(choiceSet)
  if (domain === 'language') {
    return compact ? getLanguageGrantCompactManageLabel() : getLanguageGrantManageLabel()
  }
  if (domain) {
    return compact
      ? getProficiencyGrantCompactManageLabel(domain)
      : getProficiencyGrantManageLabel(domain)
  }
  return `Manage ${choiceSet.label.toLowerCase()}`
}

function poolOptionNoun(choiceSet: ChoiceSet): string {
  const domain = choiceDomainFor(choiceSet)
  if (!domain) return 'options'
  if (domain === 'language') return getLanguageProficiencySentenceForm(choiceSet.max)
  return getProficiencyDomainCompactActionNoun(domain, choiceSet.max)
}

function singleChoiceSetNoun(choiceSet: ChoiceSet, count: number): string {
  const domain = choiceDomainFor(choiceSet)
  if (!domain) {
    return formatCountableNoun(count, 'option', 'options')
  }
  if (domain === 'language') return getLanguageProficiencySentenceForm(count)
  return getProficiencyDomainCompactActionNoun(domain, count)
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

function choiceBlockActionLabel(
  choiceSet: ChoiceSet,
  selectedCount: number,
  compact: boolean,
): string {
  return isChoiceSetFull(selectedCount, choiceSet.max)
    ? choiceBlockManageLabelFor(choiceSet, compact)
    : choiceBlockAddLabelFor(choiceSet, compact)
}

/** Add vs Manage drawer trigger copy for a proficiency choice block. */
export function formatProficiencyChoiceBlockAddLabel(
  choiceSet: ChoiceSet,
  selectedCount: number,
): string {
  return choiceBlockActionLabel(choiceSet, selectedCount, false)
}

/** Compact inline add action copy for multi-set proficiency subsections. */
export function formatProficiencyChoiceBlockCompactAddLabel(
  choiceSet: ChoiceSet,
  selectedCount: number,
): string {
  return choiceBlockActionLabel(choiceSet, selectedCount, true)
}
