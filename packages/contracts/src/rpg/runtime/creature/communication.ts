import { TELEPATHY_MILE_FEET } from '../../content/creature/communication'
import type { CreatureLanguageProficiencyEntry } from '../../content/creature/proficiencies'
import { getTermSentenceForm, vocabularyTermLabel } from '../../vocab/types'
import { EXPERIENCE_POINTS_TERM } from '../../vocab/mechanics/experience-points'
import { PASSIVE_PERCEPTION_TERM } from '../../vocab/mechanics/passive-perception'
import { PROFICIENCY_BONUS_TERM } from '../../vocab/mechanics/proficiency-bonus'
import { TELEPATHY_TERM } from '../../vocab/mechanics/telepathy'
import { getTermCompactLabel } from '../../vocab/types'
import { formatSignedModifier } from './weapon-attack'

/** Display label for a stored telepathy range (`60 ft.`, `1 mile`). */
export function formatTelepathyRange(feet: number): string {
  if (feet === TELEPATHY_MILE_FEET) return '1 mile'
  return `${feet} ft.`
}

export function formatExperiencePoints(value: number): string {
  return `${getTermCompactLabel(EXPERIENCE_POINTS_TERM)} ${value}`
}

export function formatProficiencyBonus(value: number): string {
  return `${getTermCompactLabel(PROFICIENCY_BONUS_TERM)} ${formatSignedModifier(value)}`
}

/** SRD-style passive Perception phrase for stat blocks (`passive Perception 12`). */
export function formatPassivePerceptionStatPhrase(value: number): string {
  const label = vocabularyTermLabel(PASSIVE_PERCEPTION_TERM, {
    number: 'singular',
    casing: 'sentence',
  })
  return `${label} ${value}`
}

export type FormatCreatureCommunicationOptions = {
  formatLanguageLabel: (languageId: string) => string
}

export type FormatCreatureCommunicationInput = {
  languages: readonly CreatureLanguageProficiencyEntry[]
  telepathy?: number
}

/**
 * Composes the Languages line for creature stat blocks: spoken languages,
 * understands-only clauses, and telepathy. Returns undefined when empty.
 */
export function formatCreatureCommunication(
  input: FormatCreatureCommunicationInput,
  options: FormatCreatureCommunicationOptions,
): string | undefined {
  const { languages, telepathy } = input

  if (languages.length === 0 && telepathy == null) {
    return undefined
  }

  const speaking = languages.filter((entry) => entry.speaks !== false)
  const understandsOnly = languages.filter((entry) => entry.speaks === false)

  const parts: string[] = []
  if (speaking.length > 0) {
    parts.push(speaking.map((entry) => options.formatLanguageLabel(entry.language)).join(', '))
  }
  if (understandsOnly.length > 0) {
    const labels = understandsOnly
      .map((entry) => options.formatLanguageLabel(entry.language))
      .join(', ')
    parts.push(`understands ${labels} but can't speak`)
  }
  if (telepathy != null) {
    const telepathyWord = getTermSentenceForm(TELEPATHY_TERM, 1)
    parts.push(`${telepathyWord} ${formatTelepathyRange(telepathy)}`)
  }
  return parts.join('; ')
}
