import { getCreatureTraitPresetSentence } from '../../content/creature/trait-presets'
import { getCreatureTraitVocabularyEntry } from '../../vocab/creature/trait-vocabulary'

export type FormatCreatureTraitInput = {
  presetId: string
  /** Phrase from the caller’s subject adapter, such as `the hell hound`. */
  subject: string
  /** Reserved for presets that store their own parameters. Fixed presets ignore it. */
  params?: object
}

export type FormattedCreatureTrait = {
  name: string
  sentence: string
}

/** Printed name and stat-block sentence for a creature trait preset. */
export function formatCreatureTrait(
  input: FormatCreatureTraitInput,
): FormattedCreatureTrait | undefined {
  const entry = getCreatureTraitVocabularyEntry(input.presetId)
  const sentence = getCreatureTraitPresetSentence(input.presetId, input.subject)
  if (!entry || sentence === undefined) return undefined
  return { name: entry.label, sentence }
}
