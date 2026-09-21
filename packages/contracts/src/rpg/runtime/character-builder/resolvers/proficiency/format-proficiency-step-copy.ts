import type { ChoiceSet } from '../../choice-set'
import {
  formatChoiceBlockCompactAddLabel,
  formatChoiceCategorySubhead,
  formatChoiceSectionEmptyMessage,
  formatChoiceSingleSetSupportingCopy,
  resolveChoiceAggregateCount,
  type ChoiceAggregateCount,
  type ChoiceSingleSetSupportingCopy,
} from '../../format-choice-step-copy'
import type { ProficiencyHeadingSourceCoverage } from './resolve-proficiency-choice-presentation'
import { getLanguageProficiencySentenceForm } from '../../../../vocab/language'
import { getProficiencyDomainCompactActionNoun } from '../../../../vocab/proficiency'
import type { ProficiencyStepSectionKind } from './resolve-proficiency-step-model'

export {
  formatProficiencyPoolDescription,
  PROFICIENCY_POOL_ENUMERATION_THRESHOLD,
} from './resolve-proficiency-choice-presentation'

const CATEGORY_PLURAL_NOUNS: Record<ProficiencyStepSectionKind, string> = {
  savingThrows: 'saving throws',
  skills: getProficiencyDomainCompactActionNoun('skill', 2),
  tools: getProficiencyDomainCompactActionNoun('tool', 2),
  languages: getLanguageProficiencySentenceForm(2),
  weapons: getProficiencyDomainCompactActionNoun('weapon', 2),
  armor: getProficiencyDomainCompactActionNoun('armor', 2),
}

const SECTION_KIND_CHOICE_TYPE: Partial<
  Record<ProficiencyStepSectionKind, ChoiceSet['choiceType']>
> = {
  skills: 'skillProficiency',
  tools: 'toolProficiency',
  languages: 'language',
  weapons: 'weaponProficiency',
  armor: 'armorTraining',
}

export type ProficiencySingleSetSupportingCopy = ChoiceSingleSetSupportingCopy

export type ProficiencyAggregateCount = ChoiceAggregateCount

type SingleSetSupportingCopyInput = {
  choiceSet: ChoiceSet
  heading: string
  headingSourceCoverage: ProficiencyHeadingSourceCoverage
  hasFixedGrantsInCategory: boolean
}

/** Single-set category supporting copy — folds identity and meaningful pool constraint. */
export function formatProficiencySingleSetSupportingCopy(
  input: SingleSetSupportingCopyInput,
): ProficiencySingleSetSupportingCopy {
  return formatChoiceSingleSetSupportingCopy({
    ...input,
    subheadStyle: 'proficiency',
  })
}

function categoryPluralNoun(kind: ProficiencyStepSectionKind): string {
  return CATEGORY_PLURAL_NOUNS[kind]
}

/** Category subhead driven by choice-set topology and fixed-grant presence. */
export function formatProficiencyCategorySubhead(
  kind: ProficiencyStepSectionKind,
  choiceSets: readonly ChoiceSet[],
  hasFixedGrantsInCategory: boolean,
): string {
  return formatChoiceCategorySubhead(
    categoryPluralNoun(kind),
    choiceSets,
    hasFixedGrantsInCategory,
    'proficiency',
  )
}

/** Empty-well copy for an interactive category section. */
export function formatProficiencySectionEmptyMessage(
  kind: ProficiencyStepSectionKind,
  hasFixedGrantsInCategory: boolean,
): string {
  const choiceType = SECTION_KIND_CHOICE_TYPE[kind]
  return formatChoiceSectionEmptyMessage(
    choiceType,
    categoryPluralNoun(kind),
    hasFixedGrantsInCategory,
    'proficiency',
  )
}

/** Aggregate category count only when every choice set is required with a fixed pick count. */
export function resolveProficiencyAggregateCount(
  choiceBlocks: Parameters<typeof resolveChoiceAggregateCount>[0],
): ProficiencyAggregateCount | null {
  return resolveChoiceAggregateCount(choiceBlocks)
}

/** Compact inline add action copy for multi-set proficiency subsections. */
export function formatProficiencyChoiceBlockCompactAddLabel(
  choiceSet: ChoiceSet,
  selectedCount: number,
): string {
  return formatChoiceBlockCompactAddLabel(choiceSet, selectedCount)
}

export { formatChoiceChosenCounter } from '../../format-choice-set-drawer-copy'
