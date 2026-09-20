import {
  getContentTypeSentenceForm,
  getContentTypeTerm,
} from '../../../../content/lib/content-type-terms'
import { joinNaturalList } from '../../../../primitives/prose'
import { ORIGIN_PROVENANCE_TERM } from '../../../character/format-selection-source-label'
import { getLanguageProficiencySentenceForm } from '../../../../vocab/language'
import {
  getProficiencyDomainCompactActionNoun,
  getProficiencyDomainCompactLabel,
  getProficiencyDomainLabel,
  getProficiencyDomainSentenceForm,
} from '../../../../vocab/proficiency'
import type { ChoiceSet, ChoiceSetOwnerKind, ChoiceSetProvenance } from '../../choice-set'

export const PROFICIENCY_POOL_ENUMERATION_THRESHOLD = 5 as const

export const PROFICIENCY_CHOICE_SOURCE_PRIORITY = {
  class: 10,
  subclass: 20,
  species: 30,
  heritage: 40,
  origin: 50,
  feat: 60,
  ruleset: 70,
  campaign: 80,
} as const satisfies Record<ChoiceSetOwnerKind, number>

const UNKNOWN_PROFICIENCY_CHOICE_SOURCE_PRIORITY = 999 as const

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

export type ProficiencyChoicePresentation = {
  heading: string
  sourceLine?: string
}

function choiceDomainFor(choiceType: ChoiceSet['choiceType']): ProficiencyChoiceDomain | undefined {
  return CHOICE_TYPE_DOMAIN[choiceType as keyof typeof CHOICE_TYPE_DOMAIN]
}

function genericHeadingForDomain(domain: ProficiencyChoiceDomain): string {
  if (domain === 'skill') {
    return getContentTypeTerm('skill-proficiencies').label
  }
  if (domain === 'language') {
    const phrase = getLanguageProficiencySentenceForm(1)
    return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`
  }
  return getProficiencyDomainLabel(domain)
}

const SOURCE_LINE_FORMATTERS: Partial<
  Record<ChoiceSetOwnerKind, (provenance: ChoiceSetProvenance) => string | undefined>
> = {
  species: (provenance) =>
    provenance.ownerLabel
      ? `${provenance.ownerLabel} ${getContentTypeSentenceForm('species')} trait`
      : undefined,
  heritage: (provenance) =>
    provenance.ownerLabel ? `${provenance.ownerLabel} heritage` : undefined,
  class: (provenance) =>
    provenance.ownerLabel
      ? `${provenance.ownerLabel} ${getContentTypeSentenceForm('classes')}`
      : undefined,
  subclass: (provenance) =>
    provenance.ownerLabel ? `${provenance.ownerLabel} subclass` : undefined,
  origin: () => ORIGIN_PROVENANCE_TERM.label,
  feat: (provenance) =>
    provenance.ownerLabel
      ? `${provenance.ownerLabel} ${getContentTypeSentenceForm('feats')}`
      : undefined,
}

function resolveSourceLine(provenance: ChoiceSetProvenance | undefined): string | undefined {
  if (!provenance?.ownerKind) return undefined
  return SOURCE_LINE_FORMATTERS[provenance.ownerKind]?.(provenance)
}

function resolveHeading(
  provenance: ChoiceSetProvenance | undefined,
  domain: ProficiencyChoiceDomain | undefined,
): string {
  if (provenance?.choiceLabel) return provenance.choiceLabel
  if (provenance?.featureLabel) return provenance.featureLabel
  if (provenance?.ownerLabel && domain) {
    if (domain === 'language') {
      return `${provenance.ownerLabel} ${getLanguageProficiencySentenceForm(1)}`
    }
    return `${provenance.ownerLabel} ${getProficiencyDomainCompactLabel(domain)}`
  }
  if (domain) return genericHeadingForDomain(domain)
  return 'Choose'
}

/** Resolves proficiency choice block heading and source line from ChoiceSet provenance. */
export function resolveProficiencyChoicePresentation(
  choiceSet: Pick<ChoiceSet, 'choiceType' | 'provenance'>,
): ProficiencyChoicePresentation {
  const domain = choiceDomainFor(choiceSet.choiceType)
  const heading = resolveHeading(choiceSet.provenance, domain)
  const sourceLine = resolveSourceLine(choiceSet.provenance)

  return sourceLine ? { heading, sourceLine } : { heading }
}

function proficiencyChoiceSourcePriority(choiceSet: ChoiceSet): number {
  const ownerKind = choiceSet.provenance?.ownerKind
  if (!ownerKind) return UNKNOWN_PROFICIENCY_CHOICE_SOURCE_PRIORITY
  return PROFICIENCY_CHOICE_SOURCE_PRIORITY[ownerKind] ?? UNKNOWN_PROFICIENCY_CHOICE_SOURCE_PRIORITY
}

/** Stable sort — class before species; same kind keeps resolver order. */
export function sortProficiencyChoiceSets(choiceSets: readonly ChoiceSet[]): ChoiceSet[] {
  return [...choiceSets].sort(
    (left, right) => proficiencyChoiceSourcePriority(left) - proficiencyChoiceSourcePriority(right),
  )
}

function poolOptionNoun(choiceSet: ChoiceSet, count: number): string {
  const domain = choiceDomainFor(choiceSet.choiceType)
  if (!domain) return count === 1 ? 'option' : 'options'
  if (domain === 'language') return getLanguageProficiencySentenceForm(count)
  return getProficiencyDomainCompactActionNoun(domain, count)
}

function anyPoolSentenceForm(choiceSet: ChoiceSet): string {
  const domain = choiceDomainFor(choiceSet.choiceType)
  if (domain === 'language') return getLanguageProficiencySentenceForm(choiceSet.max)
  if (domain) return getProficiencyDomainSentenceForm(domain, choiceSet.max)
  return choiceSet.max === 1 ? 'option' : 'options'
}

/** Compact pool copy for a single choice block. */
export function formatProficiencyPoolDescription(choiceSet: ChoiceSet): string {
  if (choiceSet.poolSource === 'any') {
    return `Choose any ${choiceSet.max} ${anyPoolSentenceForm(choiceSet)}.`
  }

  const { options } = choiceSet

  if (options.length <= PROFICIENCY_POOL_ENUMERATION_THRESHOLD) {
    const labels = options.map((option) => option.label)
    return `Choose from ${joinNaturalList(labels)}.`
  }

  return `Choose from ${options.length} available ${poolOptionNoun(choiceSet, options.length)}.`
}
