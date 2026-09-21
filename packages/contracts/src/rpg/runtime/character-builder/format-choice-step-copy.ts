import { joinNaturalList } from '../../primitives/prose'
import type { ChoiceCounterVerb } from './format-spell-acquisition-copy'
import type { ChoiceSet } from './choice-set'
import { formatChoiceChosenCounter } from './format-choice-set-drawer-copy'
import {
  formatChoiceSetAvailabilityAfterSelection,
  formatChoiceSetRequiredLead,
} from './resolve-choice-set-availability'
import { resolveChoiceSetRequiredToComplete } from './choice-set'
import {
  getLanguageGrantAddLabel,
  getLanguageGrantCompactAddLabel,
  getLanguageGrantCompactManageLabel,
  getLanguageGrantManageLabel,
  getLanguageProficiencySentenceForm,
} from '../../vocab/language'
import {
  BUILDER_GRANT_EDIT_ACTION_LABEL,
  getProficiencyDomainCompactActionNoun,
  getProficiencyGrantAddLabel,
  getProficiencyGrantCompactAddLabel,
  getProficiencyGrantCompactManageLabel,
  getProficiencyGrantManageLabel,
} from '../../vocab/proficiency'
import {
  formatProficiencyChoiceEmptyMessage,
  formatSpellChoiceEmptyMessage,
} from './readiness/step-readiness-helpers'

export const CHOICE_POOL_ENUMERATION_THRESHOLD = 5 as const

export type ChoiceHeadingSourceCoverage = 'owner' | 'feature' | 'generic'

export type ChoiceSingleSetSupportingCopy = {
  instruction: string
  identityLine?: string
}

export type ChoiceAggregateCount = {
  selected: number
  max: number
  label: string
  verb?: ChoiceCounterVerb
  requiredToComplete?: boolean
  effectiveRequiredCount?: number
}

export type ChoiceSubheadStyle = 'proficiency' | 'spell'

const PROFICIENCY_CHOICE_TYPE_DOMAIN = {
  skillProficiency: 'skill',
  toolProficiency: 'tool',
  weaponProficiency: 'weapon',
  armorTraining: 'armor',
  language: 'language',
} as const satisfies Partial<
  Record<ChoiceSet['choiceType'], 'skill' | 'tool' | 'weapon' | 'armor' | 'language'>
>

type ProficiencyChoiceDomain =
  (typeof PROFICIENCY_CHOICE_TYPE_DOMAIN)[keyof typeof PROFICIENCY_CHOICE_TYPE_DOMAIN]

const SPELL_CHOICE_NOUNS = {
  cantrip: { singular: 'cantrip', plural: 'cantrips' },
  spell: { singular: 'spell', plural: 'spells' },
} as const

function isChoiceSetFull(selectedCount: number, max: number): boolean {
  return selectedCount >= max
}

function formatCountableNoun(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

function proficiencyDomainFor(choiceSet: ChoiceSet): ProficiencyChoiceDomain | undefined {
  return PROFICIENCY_CHOICE_TYPE_DOMAIN[
    choiceSet.choiceType as keyof typeof PROFICIENCY_CHOICE_TYPE_DOMAIN
  ]
}

function spellNounFor(choiceType: 'cantrip' | 'spell', count: number): string {
  const nouns = SPELL_CHOICE_NOUNS[choiceType]
  return formatCountableNoun(count, nouns.singular, nouns.plural)
}

function singleProficiencyNoun(choiceSet: ChoiceSet, count: number): string {
  const domain = proficiencyDomainFor(choiceSet)
  if (!domain) {
    return formatCountableNoun(count, 'option', 'options')
  }
  if (domain === 'language') return getLanguageProficiencySentenceForm(count)
  return getProficiencyDomainCompactActionNoun(domain, count)
}

function choiceBlockAddLabelFor(choiceSet: ChoiceSet, compact: boolean): string {
  if (choiceSet.choiceType === 'cantrip') {
    return compact ? 'Add cantrip' : 'Add cantrip'
  }
  if (choiceSet.choiceType === 'spell') {
    return compact ? 'Add spell' : 'Add spell'
  }

  const domain = proficiencyDomainFor(choiceSet)
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
  if (choiceSet.choiceType === 'cantrip' || choiceSet.choiceType === 'spell') {
    return BUILDER_GRANT_EDIT_ACTION_LABEL
  }

  const domain = proficiencyDomainFor(choiceSet)
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

function additionalQualifier(hasFixedGrantsInCategory: boolean): string {
  return hasFixedGrantsInCategory ? 'additional ' : ''
}

function formatConstrainedProficiencyPoolInstruction(
  choiceSet: ChoiceSet,
  hasFixedGrantsInCategory: boolean,
): string {
  const noun = singleProficiencyNoun(choiceSet, choiceSet.max)
  const prefix = `Choose ${choiceSet.max} ${additionalQualifier(hasFixedGrantsInCategory)}${noun}`
  const { options } = choiceSet

  if (options.length <= CHOICE_POOL_ENUMERATION_THRESHOLD) {
    const labels = options.map((option) => option.label)
    return `${prefix} from ${joinNaturalList(labels)}.`
  }

  return `${prefix} from ${options.length} available ${singleProficiencyNoun(choiceSet, options.length)}.`
}

type SingleSetSupportingCopyInput = {
  choiceSet: ChoiceSet
  heading: string
  headingSourceCoverage: ChoiceHeadingSourceCoverage
  hasFixedGrantsInCategory: boolean
  subheadStyle: ChoiceSubheadStyle
  spellLevel?: number
}

function formatConstrainedSpellPoolInstruction(choiceSet: ChoiceSet): string {
  const choiceType = choiceSet.choiceType === 'cantrip' ? 'cantrip' : 'spell'
  const { options } = choiceSet
  const optionCount = options.length

  if (optionCount <= CHOICE_POOL_ENUMERATION_THRESHOLD) {
    const labels = options.map((option) => option.label)
    return `Choose from ${joinNaturalList(labels)}.`
  }

  if (choiceType === 'cantrip') {
    return `Choose from ${optionCount} available cantrips.`
  }

  return `Choose from ${optionCount} available ${spellNounFor('spell', optionCount)}.`
}

export function resolveChoiceBlockAvailabilityMessage(
  choiceSet: ChoiceSet,
  selections: readonly string[],
): string | undefined {
  return (
    formatChoiceSetRequiredLead(choiceSet) ??
    formatChoiceSetAvailabilityAfterSelection(choiceSet, selections)
  )
}

/** Single-set supporting copy — folds identity and meaningful pool constraint. */
export function formatChoiceSingleSetSupportingCopy({
  choiceSet,
  heading,
  headingSourceCoverage,
  hasFixedGrantsInCategory,
  subheadStyle,
}: SingleSetSupportingCopyInput): ChoiceSingleSetSupportingCopy {
  if (subheadStyle === 'spell') {
    return {
      instruction: formatConstrainedSpellPoolInstruction(choiceSet),
    }
  }

  const noun = singleProficiencyNoun(choiceSet, choiceSet.max)
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
    instruction: formatConstrainedProficiencyPoolInstruction(choiceSet, hasFixedGrantsInCategory),
  }
}

/** Multi-set parent subhead driven by topology and fixed-grant presence. */
export function formatChoiceCategorySubhead(
  categoryPlural: string,
  choiceSets: readonly ChoiceSet[],
  hasFixedGrantsInCategory: boolean,
  subheadStyle: ChoiceSubheadStyle,
): string {
  if (choiceSets.length === 0) return ''

  if (subheadStyle === 'spell') {
    return 'Choose spells from the options below.'
  }

  if (hasFixedGrantsInCategory) {
    return `Choose additional ${categoryPlural} from the options below.`
  }
  return `Choose ${categoryPlural} from the options below.`
}

/** Empty-well copy for an interactive section. */
export function formatChoiceSectionEmptyMessage(
  choiceType: ChoiceSet['choiceType'] | undefined,
  categoryFallbackPlural: string,
  hasFixedGrantsInCategory: boolean,
  subheadStyle: ChoiceSubheadStyle,
): string {
  if (subheadStyle === 'spell') {
    if (choiceType === 'cantrip' || choiceType === 'spell') {
      return formatSpellChoiceEmptyMessage(choiceType, {
        additional: hasFixedGrantsInCategory,
      })
    }
    return 'No spells chosen yet.'
  }

  if (choiceType) {
    return formatProficiencyChoiceEmptyMessage(choiceType, {
      additional: hasFixedGrantsInCategory,
    })
  }

  if (hasFixedGrantsInCategory) {
    return `No additional ${categoryFallbackPlural} chosen yet.`
  }
  return `No ${categoryFallbackPlural} chosen yet.`
}

type AggregateCountInput = {
  choiceSet: ChoiceSet
  selectedCount: number
  max: number
  verb?: ChoiceCounterVerb
}

/** Aggregate count when every choice set is required with a fixed pick count. */
export function resolveChoiceAggregateCount(
  choiceBlocks: readonly AggregateCountInput[],
  verb: ChoiceCounterVerb = 'chosen',
): ChoiceAggregateCount | null {
  if (choiceBlocks.length === 0) return null

  const allRequiredFixed = choiceBlocks.every(
    (block) => block.choiceSet.required && block.choiceSet.min === block.choiceSet.max,
  )
  if (!allRequiredFixed) return null

  const selected = choiceBlocks.reduce((sum, block) => sum + block.selectedCount, 0)
  const max = choiceBlocks.reduce((sum, block) => sum + block.max, 0)
  const requiredToComplete = choiceBlocks.every((block) =>
    resolveChoiceSetRequiredToComplete(block.choiceSet),
  )

  return {
    selected,
    max,
    label: formatChoiceChosenCounter(selected, max, verb),
    verb,
    requiredToComplete,
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

/** Compact inline add action copy for multi-set subsections. */
export function formatChoiceBlockCompactAddLabel(
  choiceSet: ChoiceSet,
  selectedCount: number,
): string {
  return choiceBlockActionLabel(choiceSet, selectedCount, true)
}

function poolOptionNoun(choiceSet: ChoiceSet, count: number): string {
  if (choiceSet.choiceType === 'cantrip') return spellNounFor('cantrip', count)
  if (choiceSet.choiceType === 'spell') return spellNounFor('spell', count)

  const domain = proficiencyDomainFor(choiceSet)
  if (!domain) return count === 1 ? 'option' : 'options'
  if (domain === 'language') return getLanguageProficiencySentenceForm(count)
  return getProficiencyDomainCompactActionNoun(domain, count)
}

function anyPoolSentenceForm(choiceSet: ChoiceSet): string {
  if (choiceSet.choiceType === 'cantrip') return spellNounFor('cantrip', choiceSet.max)
  if (choiceSet.choiceType === 'spell') return spellNounFor('spell', choiceSet.max)

  const domain = proficiencyDomainFor(choiceSet)
  if (domain === 'language') return getLanguageProficiencySentenceForm(choiceSet.max)
  if (domain) return getProficiencyDomainCompactActionNoun(domain, choiceSet.max)
  return choiceSet.max === 1 ? 'option' : 'options'
}

export type FormatChoicePoolDescriptionInput = {
  choiceSet: ChoiceSet
  spellLevel?: number
}

/** Compact pool copy for a single choice block. */
export function formatChoicePoolDescription({
  choiceSet,
}: FormatChoicePoolDescriptionInput): string {
  if (choiceSet.choiceType === 'cantrip' || choiceSet.choiceType === 'spell') {
    return formatConstrainedSpellPoolInstruction(choiceSet)
  }

  if (choiceSet.poolSource === 'any') {
    return `Choose any ${choiceSet.max} ${anyPoolSentenceForm(choiceSet)}.`
  }

  const { options } = choiceSet

  if (options.length <= CHOICE_POOL_ENUMERATION_THRESHOLD) {
    const labels = options.map((option) => option.label)
    return `Choose from ${joinNaturalList(labels)}.`
  }

  return `Choose from ${options.length} available ${poolOptionNoun(choiceSet, options.length)}.`
}

export {
  formatChoiceChosenCounter,
  formatChoiceProgressCounter,
} from './format-choice-set-drawer-copy'
