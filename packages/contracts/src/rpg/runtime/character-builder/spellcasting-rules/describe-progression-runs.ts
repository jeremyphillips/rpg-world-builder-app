import { resolveMaxAuthoredCurveLevel } from '../../../campaign/rules/spellcasting-progression/progression-curve'
import { resolveProgressionValueAtLevel } from '../../../campaign/rules/spellcasting-progression/lookup'
import {
  classProgressionColumnReference,
  classProgressionTableReference,
} from '../../../content/classes/class-progression-table'
import { formatCardinalWord, joinNaturalList } from '../../../primitives/prose'
import { resolveClassCantripCount } from '../../creature/spellcasting'
import type { CharacterClass } from '../../../content/classes/class'
import type { CompiledSpellcastingChoiceProgression } from '../../creature/resolve-class-spellcasting'

export const MAX_NAMED_CANTRIP_MILESTONES = 3 as const

export type SpellbookGainRun = {
  gainPerLevel: number
  fromLevel: number
  toLevel: number
  terminatesAtLastAuthoredSlotLevel: boolean
}

function groupContiguousLevels(levels: readonly number[]): Array<{ from: number; to: number }> {
  if (levels.length === 0) return []
  const sorted = [...levels].sort((left, right) => left - right)
  const ranges: Array<{ from: number; to: number }> = []
  let from = sorted[0]!
  let to = from

  for (let index = 1; index < sorted.length; index += 1) {
    const level = sorted[index]!
    if (level === to + 1) {
      to = level
      continue
    }
    ranges.push({ from, to })
    from = level
    to = level
  }
  ranges.push({ from, to })
  return ranges
}

export function describeSpellbookGainRuns(input: {
  activationLevel: number
  gainProgression: CompiledSpellcastingChoiceProgression
  maxAuthoredSlotLevel: number
}): SpellbookGainRun[] {
  const maxCurveLevel = resolveMaxAuthoredCurveLevel(input.gainProgression.curve.rows)
  const byGain = new Map<number, number[]>()

  for (let level = input.activationLevel + 1; level <= maxCurveLevel; level += 1) {
    const gain = resolveProgressionValueAtLevel({
      kind: 'gain',
      rows: input.gainProgression.curve.rows,
      level,
      extension: input.gainProgression.extension,
    }).count
    if (gain <= 0) continue
    const levels = byGain.get(gain) ?? []
    levels.push(level)
    byGain.set(gain, levels)
  }

  const runs: SpellbookGainRun[] = []
  for (const [gainPerLevel, levels] of byGain) {
    for (const range of groupContiguousLevels(levels)) {
      runs.push({
        gainPerLevel,
        fromLevel: range.from,
        toLevel: range.to,
        terminatesAtLastAuthoredSlotLevel: range.to >= input.maxAuthoredSlotLevel,
      })
    }
  }

  return runs.sort((left, right) => left.fromLevel - right.fromLevel)
}

export function formatSpellbookGainRunSentence(input: {
  className: string
  activationLevel: number
  run: SpellbookGainRun
}): string {
  const { run, className, activationLevel } = input
  const spellLabel =
    run.gainPerLevel === 1
      ? `${className} spell of your choice`
      : `${className} spells of your choice`
  const countWord = formatCardinalWord(run.gainPerLevel)

  if (run.terminatesAtLastAuthoredSlotLevel && run.fromLevel === activationLevel + 1) {
    return `Whenever you gain a ${className} level after ${activationLevel}, add ${countWord} ${spellLabel} to your spellbook. Each of these spells must be of a level for which you have spell slots.`
  }

  const levelPhrase =
    run.fromLevel === run.toLevel
      ? `${className} level ${run.fromLevel}`
      : `each ${className} level from ${run.fromLevel} to ${run.toLevel}`

  return `Add ${countWord} ${spellLabel} to your spellbook at ${levelPhrase}. Each of these spells must be of a level for which you have spell slots.`
}

export function formatSpellbookGainRunSentences(input: {
  className: string
  activationLevel: number
  gainProgression: CompiledSpellcastingChoiceProgression
  maxAuthoredSlotLevel: number
}): string[] {
  const runs = describeSpellbookGainRuns(input)
  if (runs.length === 0) return []

  if (runs.length === 1) {
    return [formatSpellbookGainRunSentence({ ...input, run: runs[0]! })]
  }

  return runs.map((run) => formatSpellbookGainRunSentence({ ...input, run }))
}

type CantripLevelIncrease = { level: number; delta: number }

function collectCantripIncreasesAfterActivation(input: {
  characterClass: CharacterClass
  activationLevel: number
  cantripProgression: CompiledSpellcastingChoiceProgression
}): CantripLevelIncrease[] {
  const { characterClass, activationLevel, cantripProgression } = input
  const rows = [...cantripProgression.curve.rows].sort((left, right) => left.level - right.level)

  const increases: CantripLevelIncrease[] = []
  let baseline = resolveClassCantripCount({
    source: characterClass,
    classLevel: activationLevel,
  })

  for (const row of rows) {
    if (row.level <= activationLevel) {
      baseline = resolveClassCantripCount({ source: characterClass, classLevel: row.level })
      continue
    }
    const count = resolveClassCantripCount({ source: characterClass, classLevel: row.level })
    if (count > baseline) {
      increases.push({ level: row.level, delta: count - baseline })
      baseline = count
    }
  }

  return increases
}

function uniformCantripDelta(increases: readonly CantripLevelIncrease[]): number | undefined {
  const deltas = new Set(increases.map((entry) => entry.delta))
  return deltas.size === 1 ? [...deltas][0] : undefined
}

function cantripLearnNounPhrase(
  className: string,
  uniformDelta: number | undefined,
  anotherSingle: boolean,
): string {
  if (anotherSingle) return `another ${className} cantrip`
  if (uniformDelta === 1) return `more ${className} cantrips`
  if (uniformDelta) return `${formatCardinalWord(uniformDelta)} more ${className} cantrips`
  return `more ${className} cantrips`
}

function describeCantripProgressionByTable(
  className: string,
  columnRef: string,
  uniformDelta: number | undefined,
): string {
  const noun = cantripLearnNounPhrase(className, uniformDelta, false)
  return `When you gain ${className} levels, you learn ${noun} of your choice, as shown in ${columnRef}.`
}

function describeCantripProgressionByMilestones(
  className: string,
  increases: readonly CantripLevelIncrease[],
  columnRef: string | undefined,
  uniformDelta: number | undefined,
): string {
  const levels = increases.map((entry) => entry.level)
  const levelPhrase =
    levels.length === 1
      ? `${className} level ${levels[0]}`
      : `${className} levels ${joinNaturalList(levels.map(String))}`

  const noun = cantripLearnNounPhrase(className, uniformDelta, uniformDelta === 1)
  const tableSuffix = columnRef ? `, as shown in ${columnRef}` : ''
  return `When you reach ${levelPhrase}, you learn ${noun} of your choice${tableSuffix}.`
}

export function describeCantripProgressionAfterActivation(input: {
  characterClass: CharacterClass
  activationLevel: number
  cantripProgression: CompiledSpellcastingChoiceProgression
}): string | undefined {
  const increases = collectCantripIncreasesAfterActivation(input)
  if (increases.length === 0) return undefined

  const className = input.characterClass.name
  const columnRef = classProgressionColumnReference(input.cantripProgression)
  const uniformDelta = uniformCantripDelta(increases)

  if (increases.length > MAX_NAMED_CANTRIP_MILESTONES && columnRef) {
    return describeCantripProgressionByTable(className, columnRef, uniformDelta)
  }

  return describeCantripProgressionByMilestones(className, increases, columnRef, uniformDelta)
}

export function preparedProgressionFollowUpSentence(input: {
  className: string
  activationLevel: number
  leveledProgression: CompiledSpellcastingChoiceProgression
  fromSpellbook: boolean
  isPactMagic: boolean
}): string {
  const columnRef = classProgressionColumnReference(input.leveledProgression)
  const visibility = columnRef
    ? `as shown in ${columnRef}`
    : `as shown in ${classProgressionTableReference()}`
  const quotaMatch = columnRef ? 'the number in that column' : 'the number shown there'

  const additional = input.fromSpellbook
    ? `additional spells from your spellbook`
    : `additional ${input.className} spells`
  const eligibility = input.isPactMagic
    ? 'of a level no higher than the level of your spell slots'
    : 'of a level for which you have spell slots'

  return `The number of spells on your list increases as you gain ${input.className} levels, ${visibility}. Whenever that number increases, choose ${additional} until the number of spells on your list matches ${quotaMatch}. The chosen spells must be ${eligibility}.`
}
