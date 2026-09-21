import {
  getContentTypeSentenceForm,
  getContentTypeTerm,
} from '../../../../content/lib/content-type-terms'
import { getSpellCollectionKindLabel } from '../../../../vocab/spell/spell-collection-kind'
import { ORIGIN_PROVENANCE_TERM } from '../../../character/format-selection-source-label'
import type { ChoiceSet, ChoiceSetOwnerKind, ChoiceSetProvenance } from '../../choice-set'

export const SPELL_CHOICE_SOURCE_PRIORITY = {
  spellcasting: 10,
  class: 20,
  subclass: 30,
  species: 40,
  heritage: 50,
  origin: 55,
  feat: 60,
  ruleset: 70,
  campaign: 80,
} as const

const UNKNOWN_SPELL_CHOICE_SOURCE_PRIORITY = 999 as const

export type SpellHeadingSourceCoverage = 'owner' | 'feature' | 'generic'

export type SpellChoicePresentation = {
  heading: string
  sourceLine?: string
  headingSourceCoverage: SpellHeadingSourceCoverage
  identityLine?: string
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

function genericHeadingForChoiceType(choiceType: ChoiceSet['choiceType']): string {
  if (choiceType === 'cantrip') return getContentTypeTerm('spells').label
  return getContentTypeTerm('spells').label
}

function resolveHeading(choiceSet: Pick<ChoiceSet, 'choiceType' | 'label' | 'provenance'>): {
  heading: string
  headingSourceCoverage: SpellHeadingSourceCoverage
} {
  const provenance = choiceSet.provenance

  if (provenance?.choiceLabel) {
    return { heading: provenance.choiceLabel, headingSourceCoverage: 'owner' }
  }
  if (provenance?.featureLabel) {
    return { heading: provenance.featureLabel, headingSourceCoverage: 'feature' }
  }
  if (provenance?.ownerLabel) {
    return {
      heading: `${provenance.ownerLabel} ${choiceSet.choiceType === 'cantrip' ? 'Cantrips' : 'Spells'}`,
      headingSourceCoverage: 'owner',
    }
  }

  if (choiceSet.label) {
    return { heading: choiceSet.label, headingSourceCoverage: 'generic' }
  }

  return {
    heading: genericHeadingForChoiceType(choiceSet.choiceType),
    headingSourceCoverage: 'generic',
  }
}

function shouldShowSourceLine(coverage: SpellHeadingSourceCoverage): boolean {
  return coverage === 'feature' || coverage === 'generic'
}

function spellbookIdentityLine(
  choiceSet: Pick<ChoiceSet, 'id' | 'sourceType' | 'label' | 'provenance'>,
  className: string | undefined,
): string | undefined {
  if (choiceSet.sourceType !== 'spellcasting') return undefined
  if (!choiceSet.id.endsWith(':spellbook')) return undefined

  const collectionLabel = choiceSet.label || getSpellCollectionKindLabel('spellbook')
  if (className) {
    return `${className} ${collectionLabel.replace(/ spells$/i, '')}`
  }
  return collectionLabel
}

/** Resolves spell choice block heading, source line, and optional identity from ChoiceSet provenance. */
export function resolveSpellChoicePresentation(
  choiceSet: Pick<ChoiceSet, 'id' | 'choiceType' | 'label' | 'provenance' | 'sourceType'>,
  className?: string,
): SpellChoicePresentation {
  const { heading, headingSourceCoverage } = resolveHeading(choiceSet)
  const resolvedSourceLine = resolveSourceLine(choiceSet.provenance)
  const sourceLine =
    shouldShowSourceLine(headingSourceCoverage) && resolvedSourceLine
      ? resolvedSourceLine
      : undefined
  const identityLine = spellbookIdentityLine(choiceSet, className)

  return sourceLine
    ? { heading, headingSourceCoverage, sourceLine, identityLine }
    : { heading, headingSourceCoverage, identityLine }
}

function spellChoiceSourcePriority(choiceSet: ChoiceSet): number {
  if (choiceSet.sourceType === 'spellcasting') {
    return SPELL_CHOICE_SOURCE_PRIORITY.spellcasting
  }

  const ownerKind = choiceSet.provenance?.ownerKind
  if (!ownerKind) return UNKNOWN_SPELL_CHOICE_SOURCE_PRIORITY
  return SPELL_CHOICE_SOURCE_PRIORITY[ownerKind] ?? UNKNOWN_SPELL_CHOICE_SOURCE_PRIORITY
}

/** Stable sort — base spellcasting before features, species, feats. */
export function sortSpellChoiceSets(choiceSets: readonly ChoiceSet[]): ChoiceSet[] {
  return [...choiceSets].sort(
    (left, right) => spellChoiceSourcePriority(left) - spellChoiceSourcePriority(right),
  )
}
