import {
  getCreatureTraitPresetSentence,
  isConfigurableCreatureTraitPreset,
} from '../../content/creature/trait-presets'
import { getCreatureTraitVocabularyEntry } from '../../vocab/creature/trait-vocabulary'
import {
  formatConfigurableCreatureTrait,
  type CreatureTraitFormatRow,
} from './format-configurable-trait'

export type FormatCreatureTraitInput = {
  /** Phrase from the caller’s subject adapter, such as `the hell hound`. */
  subject: string
  /** Preset row. Configurable fields are read from this object. */
  trait: CreatureTraitFormatRow
}

export type FormattedCreatureTrait = {
  name: string
  sentence: string
}

/** Printed name and stat-block sentence for a creature trait preset. */
export function formatCreatureTrait(
  input: FormatCreatureTraitInput,
): FormattedCreatureTrait | undefined {
  if (isConfigurableCreatureTraitPreset(input.trait.preset)) {
    return formatConfigurableCreatureTrait(input.subject, input.trait)
  }
  const entry = getCreatureTraitVocabularyEntry(input.trait.preset)
  const sentence = getCreatureTraitPresetSentence(input.trait.preset, input.subject)
  if (!entry || sentence === undefined || sentence === '') return undefined
  return { name: entry.label, sentence }
}
