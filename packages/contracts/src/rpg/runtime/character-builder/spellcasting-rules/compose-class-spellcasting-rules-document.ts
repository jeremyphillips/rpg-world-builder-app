import type { CharacterClass } from '../../../content/classes/class'
import type { Spell } from '../../../content/spell'
import type { StatBlockProseDocument } from '../../prose/stat-block-prose'
import { rulesDocumentFromParagraphs } from './compose-class-spellcasting-rules-prose'
import {
  spellcastingRulesCantripParagraphs,
  spellcastingRulesClosingParagraphs,
  spellcastingRulesIntroParagraph,
  spellcastingRulesPreparedParagraphs,
  spellcastingRulesSpellbookParagraphs,
  spellcastingRulesSpellSlotsParagraph,
} from './compose-class-spellcasting-rules-sections'
import type { ClassSpellcastingRulesFacts } from './resolve-class-spellcasting-rules-facts'

export function composeClassSpellcastingRulesDocument(input: {
  characterClass: CharacterClass
  facts: ClassSpellcastingRulesFacts
  spellsById?: ReadonlyMap<string, Spell>
}): StatBlockProseDocument {
  const { characterClass, facts, spellsById } = input

  return rulesDocumentFromParagraphs([
    spellcastingRulesIntroParagraph(facts),
    ...spellcastingRulesCantripParagraphs({ characterClass, facts, spellsById }),
    ...spellcastingRulesSpellbookParagraphs({ facts, spellsById }),
    spellcastingRulesSpellSlotsParagraph(facts),
    ...spellcastingRulesPreparedParagraphs(facts, spellsById),
    ...spellcastingRulesClosingParagraphs(facts),
  ])
}
