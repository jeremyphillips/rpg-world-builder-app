import { joinNaturalList } from '../../../../primitives/prose'
import type { ChoiceSet } from '../../choice-set'
import {
  getLanguageGrantAddLabel,
  getLanguageGrantCompactAddLabel,
  getLanguageGrantCompactManageLabel,
  getLanguageGrantManageLabel,
  getLanguageProficiencySentenceForm,
} from '../../../../vocab/language'
import {
  BUILDER_GRANT_EDIT_ACTION_LABEL,
  getProficiencyDomainCompactActionNoun,
  getProficiencyGrantAddLabel,
  getProficiencyGrantCompactAddLabel,
  getProficiencyGrantCompactManageLabel,
  getProficiencyGrantManageLabel,
} from '../../../../vocab/proficiency'
import type { ProficiencyHeadingSourceCoverage } from './resolve-proficiency-choice-presentation'
import type { ProficiencyStepSectionKind } from './resolve-proficiency-step-model'

import {
  formatProficiencyPoolDescription,
  PROFICIENCY_POOL_ENUMERATION_THRESHOLD,
} from './resolve-proficiency-choice-presentation'

export { formatProficiencyPoolDescription, PROFICIENCY_POOL_ENUMERATION_THRESHOLD }

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
  return BUILDER_GRANT_EDIT_ACTION_LABEL
}

function singleChoiceSetNoun(choiceSet: ChoiceSet, count: number): string {
  const domain = choiceDomainFor(choiceSet)
  if (!domain) {
    return formatCountableNoun(count, 'option', 'options')
  }
  if (domain === 'language') return getLanguageProficiencySentenceForm(count)
  return getProficiencyDomainCompactActionNoun(domain, count)
}

export type ProficiencySingleSetSupportingCopy = {
  instruction: string
  identityLine?: string
}

type SingleSetSupportingCopyInput = {
  choiceSet: ChoiceSet
  heading: string
  headingSourceCoverage: ProficiencyHeadingSourceCoverage
  hasFixedGrantsInCategory: boolean
}

function additionalQualifier(hasFixedGrantsInCategory: boolean): string {
  return hasFixedGrantsInCategory ? 'additional ' : ''
}

function formatConstrainedPoolInstruction(
  choiceSet: ChoiceSet,
  hasFixedGrantsInCategory: boolean,
): string {
  const noun = singleChoiceSetNoun(choiceSet, choiceSet.max)
  const prefix = `Choose ${choiceSet.max} ${additionalQualifier(hasFixedGrantsInCategory)}${noun}`
  const { options } = choiceSet

  if (options.length <= PROFICIENCY_POOL_ENUMERATION_THRESHOLD) {
    const labels = options.map((option) => option.label)
    return `${prefix} from ${joinNaturalList(labels)}.`
  }

  return `${prefix} from ${options.length} available ${singleChoiceSetNoun(choiceSet, options.length)}.`
}

/** Single-set category supporting copy — folds identity and meaningful pool constraint. */
export function formatProficiencySingleSetSupportingCopy({
  choiceSet,
  heading,
  headingSourceCoverage,
  hasFixedGrantsInCategory,
}: SingleSetSupportingCopyInput): ProficiencySingleSetSupportingCopy {
  const noun = singleChoiceSetNoun(choiceSet, choiceSet.max)
  const additional = additionalQualifier(hasFixedGrantsInCategory)

  if (headingSourceCoverage === 'owner') {
    return {
      instruction: `Choose ${choiceSet.max} ${additional}${noun} from ${heading}.`,
    }
  }

  if (choiceSet.poolSource === 'any') {
    return {
      instruction: `Choose any ${choiceSet.max} ${additional}${noun} for ${heading}.`,
    }
  }

  return {
    identityLine: heading,
    instruction: formatConstrainedPoolInstruction(choiceSet, hasFixedGrantsInCategory),
  }
}

/** Category subhead driven by choice-set topology and fixed-grant presence. */
export function formatProficiencyCategorySubhead(
  kind: ProficiencyStepSectionKind,
  choiceSets: readonly ChoiceSet[],
  hasFixedGrantsInCategory: boolean,
): string {
  if (choiceSets.length === 0) return ''

  const plural = categoryPluralNoun(kind)
  if (hasFixedGrantsInCategory) {
    return `Choose additional ${plural} from the options below.`
  }
  return `Choose ${plural} from the options below.`
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
