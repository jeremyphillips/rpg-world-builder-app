import type { ResolvedSpellcastingProgressionConfig } from '../../campaign/rules/spellcasting-progression'
import type { CharacterClass } from '../../content/classes/class'
import type { Spell } from '../../content/spell'
import type { ClassSpellcastingFocusKind } from '../../vocab/spell/class-spellcasting-focus-kind'
import { composeClassSpellcastingRulesDocument } from './spellcasting-rules/compose-class-spellcasting-rules-document'
import { resolveClassSpellcastingRulesFacts } from './spellcasting-rules/resolve-class-spellcasting-rules-facts'
import { joinStatBlockProseDocument, type StatBlockProseDocument } from '../prose/stat-block-prose'

export type FormatClassSpellcastingFeatureRulesInput = {
  characterClass: CharacterClass
  config: ResolvedSpellcastingProgressionConfig
  focusKinds?: readonly ClassSpellcastingFocusKind[]
  spellsById?: ReadonlyMap<string, Spell>
}

/** Player-facing spellcasting rules for the granting feature — derived from resolvers only. */
export function formatClassSpellcastingFeatureRules(
  input: FormatClassSpellcastingFeatureRulesInput,
): StatBlockProseDocument | null {
  const facts = resolveClassSpellcastingRulesFacts({
    characterClass: input.characterClass,
    config: input.config,
    spellsById: input.spellsById,
  })
  if (!facts) return null

  const focusKinds = [...(input.focusKinds ?? input.characterClass.spellcasting?.focusKinds ?? [])]

  return composeClassSpellcastingRulesDocument({
    characterClass: input.characterClass,
    facts: { ...facts, focusKinds },
    spellsById: input.spellsById,
  })
}

export function joinClassSpellcastingFeatureRulesPlainText(
  input: FormatClassSpellcastingFeatureRulesInput,
): string | null {
  const document = formatClassSpellcastingFeatureRules(input)
  if (!document) return null
  return joinStatBlockProseDocument(document).trim()
}
