import type { ClassSpellSelection } from '../../content/classes/spellcasting/class-spell-selection'
import { IMMUTABLE_SPELL_MUTATION } from '../../vocab/spell/spell-mutation-policy'
import {
  formatSpellMutationCopyParts,
  type SpellMutationCopyParts,
  type SpellMutationCopyTrigger,
} from '../../vocab/spell/format-spell-mutation-policy'

export type SpellAcquisitionCopy = {
  lead: string
  persistence?: string
  change?: string
}

export type ChoiceCounterVerb = 'chosen' | 'prepared' | 'learned'

const MAX_ACQUISITION_COPY_LINES = 2 as const

function formatCountableNoun(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

function capitalizeTrigger(trigger: SpellMutationCopyTrigger): string {
  return trigger.charAt(0).toUpperCase() + trigger.slice(1)
}

/** Generic required vs optional count phrase for spell (and future proficiency) copy. */
export function formatChoiceCountPhrase(input: {
  verb: string
  max: number
  noun: string
  requiredToComplete: boolean
  className?: string
  fromClassList?: boolean
}): string {
  const { verb, max, noun, requiredToComplete, className, fromClassList = true } = input
  const countPhrase = requiredToComplete ? `${verb} ${max}` : `${verb} up to ${max}`
  const pool = fromClassList && className ? ` from the ${className} spell list` : ''
  return `${countPhrase} ${noun}${pool}.`
}

function formatPreparedSpellReplaceChange(parts: SpellMutationCopyParts): string | undefined {
  if (!parts) return undefined

  if (parts.replaceCount === 'all') {
    return `You can change your prepared spells ${parts.trigger}.`
  }

  const spellLabel = formatCountableNoun(parts.replaceCount, 'prepared spell', 'prepared spells')
  return `${capitalizeTrigger(parts.trigger)}, you can replace ${parts.replaceCount} ${spellLabel}.`
}

function formatLimitedRepertoireDetail(parts: SpellMutationCopyParts | null): string {
  if (!parts) {
    return 'These remain prepared as you gain levels.'
  }

  if (parts.replaceCount === 'all') {
    return `These remain prepared as you gain levels; you can change your prepared spells ${parts.trigger}.`
  }

  return `These remain prepared as you gain levels; ${parts.trigger}, you can replace ${parts.replaceCount}.`
}

function formatSpellbookPersistence(): string {
  return 'Spells in your spellbook remain there and can be prepared later.'
}

function formatPrepareFromClassListCopy(
  className: string,
  max: number,
  requiredToComplete: boolean,
  changePolicy: ClassSpellSelection['change'] | undefined,
): SpellAcquisitionCopy {
  const parts = formatSpellMutationCopyParts(changePolicy ?? IMMUTABLE_SPELL_MUTATION)
  return {
    lead: formatChoiceCountPhrase({
      verb: 'Prepare',
      max,
      noun: formatCountableNoun(max, 'spell', 'spells'),
      requiredToComplete,
      className,
    }),
    change: formatPreparedSpellReplaceChange(parts),
  }
}

function formatLimitedRepertoireCopy(
  className: string,
  max: number,
  requiredToComplete: boolean,
  changePolicy: ClassSpellSelection['change'] | undefined,
): SpellAcquisitionCopy {
  const parts = formatSpellMutationCopyParts(changePolicy ?? IMMUTABLE_SPELL_MUTATION)
  return {
    lead: formatChoiceCountPhrase({
      verb: 'Prepare',
      max,
      noun: formatCountableNoun(max, 'spell', 'spells'),
      requiredToComplete,
      className,
    }),
    persistence: formatLimitedRepertoireDetail(parts),
  }
}

function formatSpellbookAcquisitionCopy(
  className: string,
  max: number,
  requiredToComplete: boolean,
): SpellAcquisitionCopy {
  return {
    lead: `${formatChoiceCountPhrase({
      verb: 'Learn',
      max,
      noun: formatCountableNoun(max, 'spell', 'spells'),
      requiredToComplete,
      className,
    }).replace(/\.$/, '')} and add them to your spellbook.`,
    persistence: formatSpellbookPersistence(),
  }
}

function formatDeferredPreparedCopy(
  max: number,
  requiredToComplete: boolean,
  changePolicy: ClassSpellSelection['change'] | undefined,
): SpellAcquisitionCopy {
  const parts = formatSpellMutationCopyParts(changePolicy ?? IMMUTABLE_SPELL_MUTATION)
  const lead = requiredToComplete
    ? `Prepare ${max} ${formatCountableNoun(max, 'spell', 'spells')} from your spellbook.`
    : `Prepare up to ${max} ${formatCountableNoun(max, 'spell', 'spells')} from your spellbook.`

  return {
    lead,
    change: formatPreparedSpellReplaceChange(parts),
  }
}

function formatCantripCountPhrase(
  className: string,
  max: number,
  requiredToComplete: boolean,
): string {
  const countPhrase = requiredToComplete ? `Choose ${max}` : `Choose up to ${max}`
  const noun = formatCountableNoun(max, 'cantrip', 'cantrips')
  return `${countPhrase} ${noun} to learn from the ${className} spell list.`
}

/** Class-list cantrip acquisition copy. */
export function formatCantripAcquisitionCopy(
  className: string,
  max: number,
  requiredToComplete: boolean,
): SpellAcquisitionCopy {
  return {
    lead: formatCantripCountPhrase(className, max, requiredToComplete),
  }
}

export function formatSpellAcquisitionCopy(input: {
  spellSelection: ClassSpellSelection | undefined
  className: string
  max: number
  requiredToComplete: boolean
  destination: 'classList' | 'spellbook' | 'deferredPrepared'
}): SpellAcquisitionCopy {
  const { spellSelection, className, max, requiredToComplete, destination } = input

  if (destination === 'spellbook') {
    return formatSpellbookAcquisitionCopy(className, max, requiredToComplete)
  }

  if (destination === 'deferredPrepared') {
    return formatDeferredPreparedCopy(max, requiredToComplete, spellSelection?.change)
  }

  if (!spellSelection) {
    return formatPrepareFromClassListCopy(className, max, requiredToComplete, undefined)
  }

  switch (spellSelection.model) {
    case 'limitedRepertoire':
      return formatLimitedRepertoireCopy(className, max, requiredToComplete, spellSelection.change)
    case 'prepareFromClassList':
      return formatPrepareFromClassListCopy(
        className,
        max,
        requiredToComplete,
        spellSelection.change,
      )
    case 'prepareFromLearnedCollection':
      return formatSpellbookAcquisitionCopy(className, max, requiredToComplete)
  }
}

/** Renders acquisition copy as at most two UI lines. */
export function spellAcquisitionCopyLines(copy: SpellAcquisitionCopy): string[] {
  return [copy.lead, copy.persistence, copy.change]
    .filter((line): line is string => line !== undefined && line.length > 0)
    .slice(0, MAX_ACQUISITION_COPY_LINES)
}
