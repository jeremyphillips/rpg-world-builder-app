import type { ResolvedSpellcastingProgressionConfig } from '../../campaign/rules/spellcasting-progression'
import type { CharacterClass } from '../../content/classes/class'
import {
  isSpellcastingActiveAtLevel,
  resolveClassSpellcastingActivationLevel,
} from '../../content/classes/spellcasting/class-spellcasting-ownership'
import type { ClassSpellcastingFocusKind } from '../../vocab/spell/class-spellcasting-focus-kind'
import { resolveClassSpellcasting } from '../creature/resolve-class-spellcasting'
import {
  activationAcquisitionRulesSentences,
  spellcastingFocusRulesSentence,
} from './format-class-spellcasting-feature-rules.lib'
import {
  statBlockProseFromPlainSentences,
  type StatBlockProseDocument,
} from '../prose/stat-block-prose'

export type FormatClassSpellcastingFeatureRulesInput = {
  characterClass: CharacterClass
  config: ResolvedSpellcastingProgressionConfig
  focusKinds?: readonly ClassSpellcastingFocusKind[]
}

/** Player-facing spellcasting rules for the granting feature — derived from resolvers only. */
export function formatClassSpellcastingFeatureRules(
  input: FormatClassSpellcastingFeatureRulesInput,
): StatBlockProseDocument | null {
  const { characterClass, config } = input
  if (!characterClass.spellcasting) return null

  const activationLevel = resolveClassSpellcastingActivationLevel(characterClass)
  if (activationLevel === undefined) return null
  if (!isSpellcastingActiveAtLevel(characterClass, activationLevel)) return null

  const resolved = resolveClassSpellcasting(characterClass, config)
  if (!resolved) return null

  const sentences = activationAcquisitionRulesSentences({
    className: characterClass.name,
    activationLevel,
    resolved,
    source: characterClass,
  })

  const focusKinds = input.focusKinds ?? characterClass.spellcasting.focusKinds ?? []
  const focus = spellcastingFocusRulesSentence(focusKinds)
  if (focus) sentences.push(focus)

  if (sentences.length === 0) return null
  return statBlockProseFromPlainSentences(sentences)
}

export function joinClassSpellcastingFeatureRulesPlainText(
  input: FormatClassSpellcastingFeatureRulesInput,
): string | null {
  const document = formatClassSpellcastingFeatureRules(input)
  if (!document) return null
  return document
    .map((paragraph) =>
      paragraph.map((segment) => (segment.kind === 'text' ? segment.value : '')).join(''),
    )
    .join('\n\n')
    .trim()
}
