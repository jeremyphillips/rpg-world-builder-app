import type { MonsterForms } from '../../content/monster/forms'
import type { CreatureSize } from '../../vocab/creature-size'
import { MOVEMENT_MODES, type MovementMode, type MovementSpeeds } from '../../vocab/movement-mode'
import {
  creatureFormSizesDiffer,
  resolveCreatureFormsContext,
  resolveCreatureFormStatistics,
  type ResolvedCreatureFormIdentity,
} from './forms'

export type ResolvedFormMovementLabel = {
  readonly formId: string
  readonly name: string
}

export type MovementModeDifference = {
  readonly mode: MovementMode
  readonly segments: readonly {
    readonly feet: number
    readonly formNames: readonly string[]
  }[]
}

export type CreatureFormDifferenceAnalysis = {
  readonly sizeVaries: boolean
  readonly movementDiffers: boolean
  readonly speechDiffers: boolean
  readonly hasNotes: boolean
  readonly modeDifferences: readonly MovementModeDifference[]
  readonly trueFormOnlyModes: readonly MovementMode[]
  readonly silentFormNames: readonly string[]
}

export type CreatureFormDifferenceInput = {
  readonly sizes: readonly CreatureSize[]
  readonly movement: MovementSpeeds
  readonly hover?: boolean
  readonly forms: MonsterForms
  readonly monsterName: string
}

function lowerFormName(name: string): string {
  return name.trim().toLocaleLowerCase()
}

function movementSignature(speeds: MovementSpeeds, hover: boolean): string {
  const modes = MOVEMENT_MODES.filter((mode) => speeds[mode] !== undefined)
    .map((mode) => `${mode}:${speeds[mode]}`)
    .join('|')
  return `${modes}#hover:${hover ? 1 : 0}`
}

function collectResolvedForms(input: CreatureFormDifferenceInput): readonly {
  identity: ResolvedCreatureFormIdentity
  stats: ReturnType<typeof resolveCreatureFormStatistics>
}[] {
  const context = resolveCreatureFormsContext(input.forms, input.monsterName)
  if (context.status !== 'complete' || !context.trueForm) return []
  const base = {
    sizes: input.sizes,
    movement: input.movement,
    hover: input.hover,
  }
  return context.eligibleForms.map((identity) => ({
    identity,
    stats: resolveCreatureFormStatistics(base, identity.form, {
      usesBaseStatistics: identity.usesBaseStatistics,
    }),
  }))
}

/** Compares resolved statistics across eligible forms for stat-block presentation. */
// fallow-ignore-next-line complexity
export function analyzeCreatureFormDifferences(
  input: CreatureFormDifferenceInput,
): CreatureFormDifferenceAnalysis | undefined {
  const resolved = collectResolvedForms(input)
  if (resolved.length < 2) return undefined

  const trueEntry = resolved.find((entry) => entry.identity.usesBaseStatistics) ?? resolved[0]
  if (!trueEntry) {
    return undefined
  }
  const trueSizes = trueEntry.stats.sizes
  const sizeVaries = resolved.some((entry) => creatureFormSizesDiffer(trueSizes, entry.stats.sizes))

  const silentFormNames = resolved
    .filter((entry) => entry.stats.canSpeak === false)
    .map((entry) => lowerFormName(entry.identity.name))
  const speechDiffers = silentFormNames.length > 0

  const hasNotes = resolved.some((entry) => Boolean(entry.identity.form?.notes?.trim()))

  const signatures = new Map<string, ResolvedFormMovementLabel[]>()
  for (const entry of resolved) {
    const key = movementSignature(entry.stats.movement.speeds, entry.stats.movement.hover)
    const labels = signatures.get(key) ?? []
    labels.push({ formId: entry.identity.id, name: lowerFormName(entry.identity.name) })
    signatures.set(key, labels)
  }
  const movementDiffers = signatures.size > 1

  const modeDifferences: MovementModeDifference[] = []
  const trueSpeeds = trueEntry.stats.movement.speeds
  const modesPresent = new Set<MovementMode>()
  for (const entry of resolved) {
    for (const mode of MOVEMENT_MODES) {
      if (entry.stats.movement.speeds[mode] !== undefined) modesPresent.add(mode)
    }
  }

  const trueFormOnlyModes: MovementMode[] = []
  for (const mode of MOVEMENT_MODES) {
    const inTrue = trueSpeeds[mode] !== undefined
    const inAnyAlternate = resolved
      .filter((entry) => !entry.identity.usesBaseStatistics)
      .some((entry) => entry.stats.movement.speeds[mode] !== undefined)
    if (inTrue && !inAnyAlternate) trueFormOnlyModes.push(mode)
  }

  for (const mode of MOVEMENT_MODES) {
    if (!modesPresent.has(mode)) continue
    const valueGroups = new Map<number, string[]>()
    for (const entry of resolved) {
      const feet = entry.stats.movement.speeds[mode]
      if (feet === undefined) continue
      const names = valueGroups.get(feet) ?? []
      names.push(lowerFormName(entry.identity.name))
      valueGroups.set(feet, names)
    }
    const uniqueValues = [...valueGroups.keys()]
    if (
      uniqueValues.length === 1 &&
      valueGroups.get(uniqueValues[0]!)!.length === resolved.length
    ) {
      continue
    }
    modeDifferences.push({
      mode,
      segments: uniqueValues
        .sort((left, right) => left - right)
        .map((feet) => ({
          feet,
          formNames: valueGroups.get(feet) ?? [],
        })),
    })
  }

  return {
    sizeVaries,
    movementDiffers,
    speechDiffers,
    hasNotes,
    modeDifferences,
    trueFormOnlyModes,
    silentFormNames,
  }
}

export function creatureFormMechanicalDifferencesExist(
  analysis: CreatureFormDifferenceAnalysis | undefined,
): boolean {
  if (!analysis) return false
  return (
    analysis.sizeVaries || analysis.movementDiffers || analysis.speechDiffers || analysis.hasNotes
  )
}
