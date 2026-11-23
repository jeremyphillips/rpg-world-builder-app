import { classProgressionTableReference } from '../../../content/classes/class-progression-table'
import type { CharacterClass } from '../../../content/classes/class'
import type { Spell } from '../../../content/spell'
import { formatSpellLevelRange } from '../../../content/spell/levels'
import { resolveMaxAuthoredSlotLevel } from '../../../campaign/rules/spellcasting-progression/slot-progression'
import { formatRestRecoveryClause } from '../../../primitives/rest-recovery'
import { formatCardinalWord } from '../../../primitives/prose'
import { getAbilityLabel } from '../../../vocab/ability'
import type { SpellMutationPolicy } from '../../../vocab/spell/spell-mutation-policy'
import { formatCantripAcquisitionCopy } from '../format-spell-acquisition-copy'
import {
  alwaysPreparedSpellsRuleSentence,
  classSpellListReferenceSentence,
  CLASS_SPELLCASTING_RULES_LEADS,
} from './class-spellcasting-rules-copy'
import type { StatBlockProse } from '../../prose/stat-block-prose'
import {
  appendRulesRecommendations,
  appendRulesSentence,
  rulesParagraphLead,
  rulesPlainParagraph,
  rulesTextSegment,
} from './compose-class-spellcasting-rules-prose'
import {
  describeCantripProgressionAfterActivation,
  formatSpellbookGainRunSentences,
  preparedProgressionFollowUpSentence,
} from './describe-progression-runs'
import { formatClassFocusNounPhrase } from './format-class-focus-noun-phrase'
import type { ClassSpellcastingRulesFacts } from './resolve-class-spellcasting-rules-facts'

function capitalizeSentence(sentence: string): string {
  const trimmed = sentence.trim()
  if (trimmed.length === 0) return trimmed
  return `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`
}

function spellSlotsBodySentence(facts: ClassSpellcastingRulesFacts): string {
  const tableRef = classProgressionTableReference()
  const recoveryClause = formatRestRecoveryClause(facts.slotRecovery)

  if (facts.isPactMagic) {
    const maxSlotLevel =
      facts.resolved.slotProgression.kind === 'pact'
        ? facts.resolved.slotProgression.rows.reduce((max, row) => Math.max(max, row.slotLevel), 0)
        : resolveMaxAuthoredSlotLevel(facts.resolved.slotProgression.rows)
    const levelRange = formatSpellLevelRange(
      Array.from({ length: maxSlotLevel }, (_, index) => index + 1),
    )
    return capitalizeSentence(
      `${tableRef} shows how many spell slots you have to cast your ${facts.className} spells of ${levelRange ?? 'level 1+'} and the level of those slots, all of which are the same level. You regain all expended Pact Magic spell slots ${recoveryClause}.`,
    )
  }

  return capitalizeSentence(
    `${tableRef} shows how many spell slots you have to cast your level 1+ spells. You regain all expended slots ${recoveryClause}.`,
  )
}

function pactUpcastExampleSentence(facts: ClassSpellcastingRulesFacts): string | undefined {
  const example = facts.pactSlotExample
  if (!example) return undefined

  const slotLabel = formatCardinalWord(example.slotCount)
  return `For example, when you're a level ${example.classLevel} ${facts.className}, you have ${slotLabel} level ${example.slotLevel} spell slots. To cast a level 1 spell, you must spend one of those slots, and you cast it as a level ${example.slotLevel} spell.`
}

function initialCantripSentence(className: string, count: number): string {
  const quota = formatCardinalWord(count)
  const noun = count === 1 ? 'cantrip' : 'cantrips'
  return `You know ${quota} ${className} ${noun} of your choice.`
}

function cantripReplacementSentence(
  className: string,
  mutation: SpellMutationPolicy,
): string | undefined {
  return formatCantripAcquisitionCopy(className, 1, true, mutation).change
}

function initialPreparedIntro(facts: ClassSpellcastingRulesFacts): string {
  const leveled = facts.leveledSelection
  if (!leveled) return ''

  const quota = formatCardinalWord(leveled.quotaAtActivation)
  const intro =
    'You prepare the list of level 1+ spells that are available for you to cast with this feature. '

  if (leveled.spellSelection.model === 'prepareFromLearnedCollection') {
    return `${intro}To do so, choose ${quota} spells from your spellbook.`
  }

  const levelRange = facts.eligibleSpellLevelRangeAtActivation ?? 'level 1'
  return `${intro}To start, choose ${quota} ${levelRange} ${facts.className} spells.`
}

function preparedExampleSentence(facts: ClassSpellcastingRulesFacts): string | undefined {
  const example = facts.preparedExample
  if (!example) return undefined

  const quota = formatCardinalWord(example.quota)
  const levelRange = formatSpellLevelRange(example.eligibleSpellLevels)
  const fromBook = example.fromSpellbook ? ', chosen from your spellbook' : ''
  const spellWord = example.quota === 1 ? 'spell' : 'spells'
  return `For example, if you're a level ${example.classLevel} ${facts.className}, your list of prepared spells can include ${quota} ${facts.className} ${spellWord} of ${levelRange} in any combination${fromBook}.`
}

function changingPreparedSentence(facts: ClassSpellcastingRulesFacts): string | undefined {
  const change = facts.leveledSelection?.spellSelection.change
  if (!change || change.kind !== 'replace') return undefined

  const { className, isPactMagic } = facts
  const fromSpellbook =
    facts.leveledSelection?.spellSelection.model === 'prepareFromLearnedCollection'

  if (change.trigger === 'longRest' && change.limit === 'all') {
    return fromSpellbook
      ? 'Whenever you finish a Long Rest, you can change your list of prepared spells, replacing any of the spells there with spells from your spellbook.'
      : `Whenever you finish a Long Rest, you can change your list of prepared spells, replacing any of the spells there with other ${className} spells for which you have spell slots.`
  }

  if (change.trigger === 'longRest' && change.limit === 1) {
    return `Whenever you finish a Long Rest, you can replace one spell on your list with another ${className} spell for which you have spell slots.`
  }

  if (change.trigger === 'levelUp' && change.limit === 1) {
    const target = isPactMagic
      ? `another ${className} spell of an eligible level`
      : `another ${className} spell for which you have spell slots`
    return `Whenever you gain a ${className} level, you can replace one spell on your list with ${target}.`
  }

  return undefined
}

function spellcastingFocusSentence(facts: ClassSpellcastingRulesFacts): string | undefined {
  if (facts.focusKinds.length === 0) return undefined
  const phrases = facts.focusKinds.map((kind) => formatClassFocusNounPhrase(kind))
  const focusList =
    phrases.length === 1 ? phrases[0]! : `${phrases.slice(0, -1).join(', ')}, or ${phrases.at(-1)}`
  return `You can use ${focusList} as a Spellcasting Focus for your ${facts.className} spells.`
}

export function spellcastingRulesIntroParagraph(
  facts: ClassSpellcastingRulesFacts,
): StatBlockProse {
  return rulesPlainParagraph(classSpellListReferenceSentence(facts.className))
}

export function spellcastingRulesCantripParagraphs(input: {
  characterClass: CharacterClass
  facts: ClassSpellcastingRulesFacts
  spellsById?: ReadonlyMap<string, Spell>
}): StatBlockProse[] {
  const { characterClass, facts, spellsById } = input
  if (!facts.cantrips) return []

  const paragraphs: StatBlockProse[] = []
  let cantripPara = rulesParagraphLead(CLASS_SPELLCASTING_RULES_LEADS.cantrips, [
    rulesTextSegment(initialCantripSentence(facts.className, facts.cantrips.countAtActivation)),
  ])
  cantripPara = appendRulesRecommendations(
    cantripPara,
    facts.cantrips.recommendationSpellIds,
    spellsById,
  )
  const replacement = cantripReplacementSentence(facts.className, facts.cantrips.mutation)
  if (replacement) cantripPara = appendRulesSentence(cantripPara, replacement)
  paragraphs.push(cantripPara)

  const milestones = describeCantripProgressionAfterActivation({
    characterClass,
    activationLevel: facts.activationLevel,
    cantripProgression: facts.cantrips.progression,
  })
  if (milestones) paragraphs.push(rulesPlainParagraph(milestones))

  return paragraphs
}

export function spellcastingRulesSpellbookParagraphs(input: {
  facts: ClassSpellcastingRulesFacts
  spellsById?: ReadonlyMap<string, Spell>
}): StatBlockProse[] {
  const { facts, spellsById } = input
  if (!facts.spellbook) return []

  const paragraphs: StatBlockProse[] = []
  const levelRange = facts.eligibleSpellLevelRangeAtActivation ?? 'level 1'
  let spellbookPara = rulesParagraphLead(CLASS_SPELLCASTING_RULES_LEADS.spellbook, [
    rulesTextSegment(
      `Your spellbook contains the level 1+ spells you know. It starts with ${formatCardinalWord(facts.spellbook.initialCountAtActivation)} ${levelRange} ${facts.className} spells of your choice.`,
    ),
  ])
  spellbookPara = appendRulesRecommendations(
    spellbookPara,
    facts.spellbook.recommendationSpellIds,
    spellsById,
  )
  paragraphs.push(spellbookPara)

  const gainSentences = formatSpellbookGainRunSentences({
    className: facts.className,
    activationLevel: facts.activationLevel,
    gainProgression: facts.spellbook.gainProgression,
    maxAuthoredSlotLevel: resolveMaxAuthoredSlotLevel(facts.resolved.slotProgression.rows),
  })
  for (const sentence of gainSentences) {
    paragraphs.push(rulesPlainParagraph(sentence))
  }

  return paragraphs
}

export function spellcastingRulesSpellSlotsParagraph(
  facts: ClassSpellcastingRulesFacts,
): StatBlockProse {
  let slotsPara = rulesParagraphLead(CLASS_SPELLCASTING_RULES_LEADS.spellSlots, [
    rulesTextSegment(spellSlotsBodySentence(facts)),
  ])
  const pactExample = pactUpcastExampleSentence(facts)
  if (pactExample) slotsPara = appendRulesSentence(slotsPara, pactExample)
  return slotsPara
}

export function spellcastingRulesPreparedParagraphs(
  facts: ClassSpellcastingRulesFacts,
  spellsById?: ReadonlyMap<string, Spell>,
): StatBlockProse[] {
  if (!facts.leveledSelection) return []

  const paragraphs: StatBlockProse[] = []
  let preparedPara = rulesParagraphLead(CLASS_SPELLCASTING_RULES_LEADS.preparedSpells, [
    rulesTextSegment(initialPreparedIntro(facts)),
  ])
  preparedPara = appendRulesRecommendations(
    preparedPara,
    facts.leveledSelection.recommendationSpellIds,
    spellsById,
  )
  paragraphs.push(preparedPara)

  paragraphs.push(
    rulesPlainParagraph(
      preparedProgressionFollowUpSentence({
        className: facts.className,
        activationLevel: facts.activationLevel,
        leveledProgression: facts.leveledSelection.progression,
        fromSpellbook:
          facts.leveledSelection.spellSelection.model === 'prepareFromLearnedCollection',
        isPactMagic: facts.isPactMagic,
      }),
    ),
  )

  const example = preparedExampleSentence(facts)
  if (example) paragraphs.push(rulesPlainParagraph(example))

  paragraphs.push(rulesPlainParagraph(alwaysPreparedSpellsRuleSentence(facts.className)))

  return paragraphs
}

export function spellcastingRulesClosingParagraphs(
  facts: ClassSpellcastingRulesFacts,
): StatBlockProse[] {
  const paragraphs: StatBlockProse[] = []

  const changing = changingPreparedSentence(facts)
  if (changing) {
    paragraphs.push(
      rulesParagraphLead(CLASS_SPELLCASTING_RULES_LEADS.changingPrepared, [
        rulesTextSegment(changing),
      ]),
    )
  }

  paragraphs.push(
    rulesParagraphLead(CLASS_SPELLCASTING_RULES_LEADS.spellcastingAbility, [
      rulesTextSegment(
        `${getAbilityLabel(facts.ability)} is your spellcasting ability for your ${facts.className} spells.`,
      ),
    ]),
  )

  const focus = spellcastingFocusSentence(facts)
  if (focus) {
    paragraphs.push(
      rulesParagraphLead(CLASS_SPELLCASTING_RULES_LEADS.spellcastingFocus, [
        rulesTextSegment(focus),
      ]),
    )
  }

  return paragraphs
}
