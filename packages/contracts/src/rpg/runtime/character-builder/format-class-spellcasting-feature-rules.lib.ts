import type { CharacterClass } from '../../content/classes/class'
import {
  CLASS_SPELLCASTING_CHOICE_SUFFIXES,
  type ClassSpellSelection,
} from '../../content/classes/spellcasting'
import { resolveMaxAuthoredSlotLevel } from '../../campaign/rules/spellcasting-progression/slot-progression'
import { resolveSlotRowAtLevel } from '../../campaign/rules/spellcasting-progression/resolve-slots'
import { resolveMaxAuthoredCurveLevel } from '../../campaign/rules/spellcasting-progression/progression-curve'
import { resolveProgressionValueAtLevel } from '../../campaign/rules/spellcasting-progression/lookup'
import { getAbilityLabel, type Ability } from '../../vocab/ability'
import {
  type ClassSpellcastingFocusKind,
  getClassSpellcastingFocusKindLabel,
} from '../../vocab/spell/class-spellcasting-focus-kind'
import { resolveClassCantripCount } from '../creature/spellcasting'
import {
  findCompiledChoiceProgressionBySuffix,
  isPactClassSpellcasting,
  resolveCompiledChoiceProgressionQuotaAtLevel,
  type CompiledSpellcastingChoiceProgression,
  type ResolvedClassSpellcasting,
} from '../creature/resolve-class-spellcasting'
import {
  formatCantripAcquisitionCopy,
  formatSpellAcquisitionCopy,
  type SpellAcquisitionCopy,
} from './format-spell-acquisition-copy'

export const REQUIRED_SPELLCASTING_RULES_TO_COMPLETE = true

export function spellcastingRulesCopyLines(copy: SpellAcquisitionCopy): string[] {
  return [copy.lead, copy.persistence, copy.change].filter(
    (line): line is string => line !== undefined && line.length > 0,
  )
}

export function formatRulesCountableNoun(count: number, singular: string, plural: string): string {
  return count === 1 ? singular : plural
}

export function spellLevelsWithOccupiedSlots(slots: readonly number[]): number[] {
  const levels: number[] = []
  slots.forEach((count, index) => {
    if (count > 0) levels.push(index + 1)
  })
  return levels
}

export function formatOccupiedSpellLevelRange(levels: readonly number[]): string | undefined {
  if (levels.length === 0) return undefined
  if (levels.length === 1) return `level ${levels[0]}`
  const low = levels[0]!
  const high = levels.at(-1)!
  if (high === low) return `level ${low}`
  return `levels ${low} and ${high}`
}

export function formatClassLevelGainPhrase(className: string, levels: readonly number[]): string {
  if (levels.length === 0) return ''
  if (levels.length === 1) return `${className} level ${levels[0]}`
  const head = levels
    .slice(0, -1)
    .map((level) => String(level))
    .join(', ')
  return `${className} levels ${head} and ${levels.at(-1)}`
}

export function cantripIncreaseRulesSentence(
  className: string,
  activationLevel: number,
  source: CharacterClass,
): string | undefined {
  const rows = source.spellcasting?.progression?.cantrips?.curve.rows ?? []
  if (rows.length === 0) return undefined

  const sorted = [...rows].sort((a, b) => a.level - b.level)
  const increases: number[] = []
  let baseline = resolveClassCantripCount({ source, classLevel: activationLevel })

  for (const row of sorted) {
    if (row.level <= activationLevel) {
      baseline = resolveClassCantripCount({ source, classLevel: row.level })
      continue
    }
    const count = resolveClassCantripCount({ source, classLevel: row.level })
    if (count > baseline) {
      increases.push(row.level)
      baseline = count
    }
  }

  if (increases.length === 0) return undefined

  const levelPhrase = formatClassLevelGainPhrase(className, increases)
  const noun = increases.length === 1 ? 'another cantrip' : 'more cantrips'
  return `When you reach ${levelPhrase}, you learn ${noun} of your choice from the ${className} spell list, as shown in the Cantrips column of the ${className} Features table.`
}

export function spellbookGainRulesSentenceAtLevel(input: {
  className: string
  level: number
  gain: CompiledSpellcastingChoiceProgression
  spellSelection: ClassSpellSelection | undefined
}): string | undefined {
  const count = resolveProgressionValueAtLevel({
    kind: 'gain',
    rows: input.gain.curve.rows,
    level: input.level,
    extension: input.gain.extension,
  }).count
  if (count <= 0) return undefined

  const copy = formatSpellAcquisitionCopy({
    spellSelection: input.spellSelection,
    className: input.className,
    max: count,
    requiredToComplete: REQUIRED_SPELLCASTING_RULES_TO_COMPLETE,
    destination: 'spellbook',
  })
  return spellcastingRulesCopyLines(copy).join(' ')
}

export function postActivationSpellbookGainRulesSentences(input: {
  className: string
  activationLevel: number
  resolved: ResolvedClassSpellcasting
}): string[] {
  const gain = findCompiledChoiceProgressionBySuffix(
    input.resolved,
    CLASS_SPELLCASTING_CHOICE_SUFFIXES.spellbook,
    'gain',
  )
  if (!gain) return []

  const maxLevel = resolveMaxAuthoredCurveLevel(gain.curve.rows)
  const byCount = new Map<number, number[]>()

  for (let level = input.activationLevel + 1; level <= maxLevel; level += 1) {
    const count = resolveProgressionValueAtLevel({
      kind: 'gain',
      rows: gain.curve.rows,
      level,
      extension: gain.extension,
    }).count
    if (count <= 0) continue
    const levels = byCount.get(count) ?? []
    levels.push(level)
    byCount.set(count, levels)
  }

  const sentences: string[] = []
  for (const [count, levels] of byCount) {
    const spellLabel = formatRulesCountableNoun(
      count,
      `${input.className} spell`,
      `${input.className} spells`,
    )
    if (levels.length === 1) {
      sentences.push(
        `Whenever you reach ${input.className} level ${levels[0]}, add ${count} ${spellLabel} of your choice to your spellbook.`,
      )
      continue
    }
    const levelPhrase = formatClassLevelGainPhrase(input.className, levels)
    sentences.push(
      `Whenever you reach ${levelPhrase}, add ${count} ${spellLabel} of your choice to your spellbook.`,
    )
  }

  return sentences
}

export function preparedQuotaRulesProgression(
  resolved: ResolvedClassSpellcasting,
): CompiledSpellcastingChoiceProgression | undefined {
  return (
    findCompiledChoiceProgressionBySuffix(
      resolved,
      CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared,
      'capacity',
    ) ??
    findCompiledChoiceProgressionBySuffix(
      resolved,
      CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire,
      'capacity',
    )
  )
}

type PreparedExampleRow = {
  classLevel: number
  quota: number
  levelRange?: string
  fromSpellbook: boolean
}

function pactMagicExampleSentence(input: {
  className: string
  classLevel: number
  slotCount: number
  slotLevel: number
}): string {
  const slotCountLabel = formatRulesCountableNoun(input.slotCount, 'spell slot', 'spell slots')
  return `For example, when you're a level ${input.classLevel} ${input.className}, you have ${input.slotCount} level ${input.slotLevel} ${slotCountLabel}.`
}

function preparedSpellsExampleSentence(row: PreparedExampleRow, className: string): string {
  const spellWord = formatRulesCountableNoun(row.quota, 'spell', 'spells')
  const fromPhrase = row.fromSpellbook ? ' from your spellbook' : ''
  const levelPart = row.levelRange ? ` of ${row.levelRange}` : ''
  return `If you're a level ${row.classLevel} ${className}, your list of prepared spells can include ${row.quota} ${spellWord}${levelPart}${fromPhrase}.`
}

function pactExampleAtLevel(input: {
  className: string
  classLevel: number
  resolved: ResolvedClassSpellcasting
}): string | undefined {
  if (!isPactClassSpellcasting(input.resolved)) return undefined
  const slotRow = resolveSlotRowAtLevel(input.resolved.slotProgression, input.classLevel)
  if (slotRow.kind !== 'pact' || slotRow.slotCount <= 0) return undefined
  return pactMagicExampleSentence({
    className: input.className,
    classLevel: input.classLevel,
    slotCount: slotRow.slotCount,
    slotLevel: slotRow.slotLevel,
  })
}

function leveledPreparedExampleAtLevel(input: {
  classLevel: number
  quota: number
  resolved: ResolvedClassSpellcasting
}): { row: PreparedExampleRow; multiLevel: boolean } | undefined {
  const slotRow = resolveSlotRowAtLevel(input.resolved.slotProgression, input.classLevel)
  if (slotRow.kind !== 'leveled') return undefined
  const occupied = spellLevelsWithOccupiedSlots(slotRow.slots)
  if (occupied.length === 0) return undefined
  return {
    multiLevel: occupied.length > 1,
    row: {
      classLevel: input.classLevel,
      quota: input.quota,
      levelRange: formatOccupiedSpellLevelRange(occupied),
      fromSpellbook: input.resolved.spellSelection?.model === 'prepareFromLearnedCollection',
    },
  }
}

export function illustrativePreparedRulesSentence(input: {
  className: string
  activationLevel: number
  resolved: ResolvedClassSpellcasting
}): string | undefined {
  const progression = preparedQuotaRulesProgression(input.resolved)
  if (!progression) return undefined

  const maxSlotLevel = resolveMaxAuthoredSlotLevel(input.resolved.slotProgression.rows)
  const scanThrough = Math.max(maxSlotLevel, input.activationLevel)

  let fallback: PreparedExampleRow | undefined

  for (let classLevel = input.activationLevel; classLevel <= scanThrough; classLevel += 1) {
    const quota = resolveCompiledChoiceProgressionQuotaAtLevel(progression, classLevel)
    if (quota <= 0) continue

    const pactExample = pactExampleAtLevel({
      className: input.className,
      classLevel,
      resolved: input.resolved,
    })
    if (pactExample) return pactExample

    const leveled = leveledPreparedExampleAtLevel({ classLevel, quota, resolved: input.resolved })
    if (!leveled) continue
    if (leveled.multiLevel) {
      return preparedSpellsExampleSentence(leveled.row, input.className)
    }
    fallback ??= leveled.row
  }

  if (!fallback) return undefined
  return preparedSpellsExampleSentence(fallback, input.className)
}

export function spellcastingAbilityRulesSentence(ability: Ability): string {
  return `${getAbilityLabel(ability)} is the spellcasting ability for your spells.`
}

export function spellcastingFocusRulesSentence(
  focusKinds: readonly ClassSpellcastingFocusKind[],
): string | undefined {
  if (focusKinds.length === 0) return undefined
  const labels = focusKinds.map((kind) => getClassSpellcastingFocusKindLabel(kind))
  if (labels.length === 1) {
    return `You can use ${labels[0]} as a Spellcasting Focus for your spells.`
  }
  const head = labels.slice(0, -1).join(', ')
  return `You can use ${head}, or ${labels.at(-1)} as a Spellcasting Focus for your spells.`
}

function pushActivationCantripCopy(
  sentences: string[],
  input: {
    className: string
    activationLevel: number
    source: CharacterClass
    resolved: ResolvedClassSpellcasting
  },
): void {
  const cantripCount = resolveClassCantripCount({
    source: input.source,
    classLevel: input.activationLevel,
  })
  if (cantripCount <= 0) return

  const cantripProgression = findCompiledChoiceProgressionBySuffix(
    input.resolved,
    CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips,
  )
  const copy = formatCantripAcquisitionCopy(
    input.className,
    cantripCount,
    REQUIRED_SPELLCASTING_RULES_TO_COMPLETE,
    cantripProgression?.mutation,
  )
  sentences.push(...spellcastingRulesCopyLines(copy))
}

function pushActivationSpellbookGain(
  sentences: string[],
  input: {
    className: string
    activationLevel: number
    resolved: ResolvedClassSpellcasting
    spellSelection: ClassSpellSelection | undefined
  },
): void {
  const spellbookGain = findCompiledChoiceProgressionBySuffix(
    input.resolved,
    CLASS_SPELLCASTING_CHOICE_SUFFIXES.spellbook,
    'gain',
  )
  if (!spellbookGain) return

  const gainLine = spellbookGainRulesSentenceAtLevel({
    className: input.className,
    level: input.activationLevel,
    gain: spellbookGain,
    spellSelection: input.spellSelection,
  })
  if (gainLine) sentences.push(gainLine)
}

function pushActivationLeveledQuotaCopy(
  sentences: string[],
  input: {
    className: string
    activationLevel: number
    resolved: ResolvedClassSpellcasting
    spellSelection: ClassSpellSelection | undefined
  },
): void {
  const prepared = findCompiledChoiceProgressionBySuffix(
    input.resolved,
    CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared,
    'capacity',
  )
  const repertoire = findCompiledChoiceProgressionBySuffix(
    input.resolved,
    CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire,
    'capacity',
  )
  const leveled = prepared ?? repertoire
  if (!leveled) return

  const quota = resolveCompiledChoiceProgressionQuotaAtLevel(leveled, input.activationLevel)
  if (quota <= 0) return

  const destination =
    input.spellSelection?.model === 'prepareFromLearnedCollection' && prepared
      ? 'deferredPrepared'
      : 'classList'
  const copy = formatSpellAcquisitionCopy({
    spellSelection: input.spellSelection,
    className: input.className,
    max: quota,
    requiredToComplete: REQUIRED_SPELLCASTING_RULES_TO_COMPLETE,
    destination,
  })
  sentences.push(...spellcastingRulesCopyLines(copy))
}

export function activationAcquisitionRulesSentences(input: {
  className: string
  activationLevel: number
  resolved: ResolvedClassSpellcasting
  source: CharacterClass
}): string[] {
  const sentences: string[] = []
  const spellSelection = input.source.spellcasting?.spellSelection

  pushActivationCantripCopy(sentences, {
    className: input.className,
    activationLevel: input.activationLevel,
    source: input.source,
    resolved: input.resolved,
  })
  pushActivationSpellbookGain(sentences, {
    className: input.className,
    activationLevel: input.activationLevel,
    resolved: input.resolved,
    spellSelection,
  })
  pushActivationLeveledQuotaCopy(sentences, {
    className: input.className,
    activationLevel: input.activationLevel,
    resolved: input.resolved,
    spellSelection,
  })

  const increase = cantripIncreaseRulesSentence(
    input.className,
    input.activationLevel,
    input.source,
  )
  if (increase) sentences.push(increase)

  sentences.push(...postActivationSpellbookGainRulesSentences(input))

  const example = illustrativePreparedRulesSentence({
    className: input.className,
    activationLevel: input.activationLevel,
    resolved: input.resolved,
  })
  if (example) sentences.push(example)

  const ability = input.source.spellcasting?.ability
  if (ability) sentences.push(spellcastingAbilityRulesSentence(ability))

  return sentences
}
