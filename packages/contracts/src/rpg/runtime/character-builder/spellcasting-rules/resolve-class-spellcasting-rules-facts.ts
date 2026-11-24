import type { ResolvedSpellcastingProgressionConfig } from '../../../campaign/rules/spellcasting-progression'
import { resolveMaxAuthoredSlotLevel } from '../../../campaign/rules/spellcasting-progression/slot-progression'
import { resolveSlotRowAtLevel } from '../../../campaign/rules/spellcasting-progression/resolve-slots'
import type { CharacterClass } from '../../../content/classes/class'
import { CLASS_SPELLCASTING_CHOICE_SUFFIXES } from '../../../content/classes/spellcasting'
import type { ClassSpellSelection } from '../../../content/classes/spellcasting/class-spell-selection'
import type { Spell } from '../../../content/spell'
import { formatSpellLevelRange } from '../../../content/spell/levels'
import {
  isSpellcastingActiveAtLevel,
  resolveClassSpellcastingActivationLevel,
} from '../../../content/classes/spellcasting/class-spellcasting-ownership'
import type { RestRecovery } from '../../../primitives/rest-recovery'
import type { Ability } from '../../../vocab/ability'
import type { ClassSpellcastingFocusKind } from '../../../vocab/spell/class-spellcasting-focus-kind'
import type { SpellMutationPolicy } from '../../../vocab/spell/spell-mutation-policy'
import { resolveClassCantripCount } from '../../creature/spellcasting'
import {
  findCompiledChoiceProgressionBySuffix,
  isPactClassSpellcasting,
  resolveClassSpellcasting,
  resolveCompiledChoiceProgressionQuotaAtLevel,
  resolveMaxSelectableSpellLevelFromClass,
  type CompiledSpellcastingChoiceProgression,
  type ResolvedClassSpellcasting,
} from '../../creature/resolve-class-spellcasting'
import { resolveApplicableRecommendationSpellIds } from '../resolvers/spellcasting/resolve-spell-recommendations'
import {
  preparedQuotaRulesProgression,
  spellLevelsWithOccupiedSlots,
} from './spellcasting-rules-resolution'

export type ClassSpellcastingRulesPreparedExample = {
  classLevel: number
  quota: number
  eligibleSpellLevels: number[]
  fromSpellbook: boolean
}

export type ClassSpellcastingRulesPactSlotExample = {
  classLevel: number
  slotCount: number
  slotLevel: number
}

export type ClassSpellcastingRulesFacts = {
  className: string
  activationLevel: number
  ability: Ability
  focusKinds: ClassSpellcastingFocusKind[]
  resolved: ResolvedClassSpellcasting
  slotRecovery: RestRecovery
  isPactMagic: boolean
  occupiedSpellLevelsAtActivation: number[]
  eligibleSpellLevelRangeAtActivation: string | undefined
  cantrips?: {
    progression: CompiledSpellcastingChoiceProgression
    countAtActivation: number
    mutation: SpellMutationPolicy
    recommendationSpellIds: string[]
  }
  spellbook?: {
    gainProgression: CompiledSpellcastingChoiceProgression
    initialCountAtActivation: number
    recommendationSpellIds: string[]
  }
  leveledSelection?: {
    progression: CompiledSpellcastingChoiceProgression
    spellSelection: ClassSpellSelection
    quotaAtActivation: number
    maxSelectableSpellLevelAtActivation: number
    eligibleSpellLevels: number[]
    eligibleSpellLevelRange: string | undefined
    mutation: SpellMutationPolicy
    recommendationSpellIds: string[]
  }
  preparedExample?: ClassSpellcastingRulesPreparedExample
  pactSlotExample?: ClassSpellcastingRulesPactSlotExample
}

function resolveOccupiedSpellLevels(
  resolved: ResolvedClassSpellcasting,
  classLevel: number,
): number[] {
  const slotRow = resolveSlotRowAtLevel(resolved.slotProgression, classLevel)
  if (slotRow.kind === 'pact') {
    if (slotRow.slotCount <= 0 || slotRow.slotLevel <= 0) return []
    return Array.from({ length: slotRow.slotLevel }, (_, index) => index + 1)
  }
  return spellLevelsWithOccupiedSlots(slotRow.slots)
}

function resolvePreparedExample(input: {
  activationLevel: number
  resolved: ResolvedClassSpellcasting
}): ClassSpellcastingRulesPreparedExample | undefined {
  const progression = preparedQuotaRulesProgression(input.resolved)
  if (!progression) return undefined

  const maxSlotLevel = resolveMaxAuthoredSlotLevel(input.resolved.slotProgression.rows)
  const scanThrough = Math.max(maxSlotLevel, input.activationLevel)

  for (let classLevel = input.activationLevel; classLevel <= scanThrough; classLevel += 1) {
    const quota = resolveCompiledChoiceProgressionQuotaAtLevel(progression, classLevel)
    if (quota <= 0) continue

    const eligible = resolveOccupiedSpellLevels(input.resolved, classLevel)
    if (eligible.length < 2) continue

    return {
      classLevel,
      quota,
      eligibleSpellLevels: eligible,
      fromSpellbook: input.resolved.spellSelection?.model === 'prepareFromLearnedCollection',
    }
  }

  return undefined
}

function resolvePactSlotExample(input: {
  activationLevel: number
  resolved: ResolvedClassSpellcasting
}): ClassSpellcastingRulesPactSlotExample | undefined {
  if (!isPactClassSpellcasting(input.resolved)) return undefined

  const maxSlotLevel = resolveMaxAuthoredSlotLevel(input.resolved.slotProgression.rows)
  const scanThrough = Math.max(maxSlotLevel, input.activationLevel)

  for (let classLevel = input.activationLevel; classLevel <= scanThrough; classLevel += 1) {
    const slotRow = resolveSlotRowAtLevel(input.resolved.slotProgression, classLevel)
    if (slotRow.kind !== 'pact' || slotRow.slotCount <= 0 || slotRow.slotLevel <= 1) continue
    return { classLevel, slotCount: slotRow.slotCount, slotLevel: slotRow.slotLevel }
  }

  return undefined
}

type RecommendationArgs = {
  spellcasting: NonNullable<CharacterClass['spellcasting']>
  classLevel: number
  activationClassLevel: number
  maxSelectableSpellLevel: number
  catalogSpellsById?: ReadonlyMap<string, Spell>
}

function buildCantripsFacts(input: {
  characterClass: CharacterClass
  activationLevel: number
  resolved: ResolvedClassSpellcasting
  recommendationArgs: RecommendationArgs
}): ClassSpellcastingRulesFacts['cantrips'] {
  const cantripProgression = findCompiledChoiceProgressionBySuffix(
    input.resolved,
    CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips,
  )
  const cantripCount = resolveClassCantripCount({
    source: input.characterClass,
    classLevel: input.activationLevel,
  })
  if (!cantripProgression || cantripCount <= 0) return undefined

  return {
    progression: cantripProgression,
    countAtActivation: cantripCount,
    mutation: cantripProgression.mutation,
    recommendationSpellIds: resolveApplicableRecommendationSpellIds({
      ...input.recommendationArgs,
      target: 'cantrips',
    }),
  }
}

function buildSpellbookFacts(input: {
  activationLevel: number
  resolved: ResolvedClassSpellcasting
  recommendationArgs: RecommendationArgs
}): ClassSpellcastingRulesFacts['spellbook'] {
  const spellbookGain = findCompiledChoiceProgressionBySuffix(
    input.resolved,
    CLASS_SPELLCASTING_CHOICE_SUFFIXES.spellbook,
    'gain',
  )
  if (!spellbookGain) return undefined

  const initialCount = resolveCompiledChoiceProgressionQuotaAtLevel(
    spellbookGain,
    input.activationLevel,
  )
  if (initialCount <= 0) return undefined

  return {
    gainProgression: spellbookGain,
    initialCountAtActivation: initialCount,
    recommendationSpellIds: resolveApplicableRecommendationSpellIds({
      ...input.recommendationArgs,
      target: 'level1Plus',
    }),
  }
}

function buildLeveledSelectionFacts(input: {
  activationLevel: number
  occupiedAtActivation: number[]
  maxSelectableAtActivation: number
  resolved: ResolvedClassSpellcasting
  recommendationArgs: RecommendationArgs
}): ClassSpellcastingRulesFacts['leveledSelection'] {
  const leveledProgression = preparedQuotaRulesProgression(input.resolved)
  const spellSelection = input.resolved.spellSelection
  if (!leveledProgression || !spellSelection) return undefined

  const quotaAtActivation = resolveCompiledChoiceProgressionQuotaAtLevel(
    leveledProgression,
    input.activationLevel,
  )
  if (quotaAtActivation <= 0) return undefined

  const eligibleLevels = input.occupiedAtActivation.filter(
    (level) => level <= input.maxSelectableAtActivation,
  )

  return {
    progression: leveledProgression,
    spellSelection,
    quotaAtActivation,
    maxSelectableSpellLevelAtActivation: input.maxSelectableAtActivation,
    eligibleSpellLevels: eligibleLevels,
    eligibleSpellLevelRange: formatSpellLevelRange(eligibleLevels),
    mutation: leveledProgression.mutation,
    recommendationSpellIds: resolveApplicableRecommendationSpellIds({
      ...input.recommendationArgs,
      target: 'level1Plus',
    }),
  }
}

/** Canonical spellcasting rules facts for class feature prose generation. */
export function resolveClassSpellcastingRulesFacts(input: {
  characterClass: CharacterClass
  config: ResolvedSpellcastingProgressionConfig
  spellsById?: ReadonlyMap<string, Spell>
}): ClassSpellcastingRulesFacts | null {
  const { characterClass, config, spellsById } = input
  if (!characterClass.spellcasting) return null

  const activationLevel = resolveClassSpellcastingActivationLevel(characterClass)
  if (activationLevel === undefined) return null
  if (!isSpellcastingActiveAtLevel(characterClass, activationLevel)) return null

  const resolved = resolveClassSpellcasting(characterClass, config)
  if (!resolved) return null

  const occupiedAtActivation = resolveOccupiedSpellLevels(resolved, activationLevel)
  const maxSelectableAtActivation = resolveMaxSelectableSpellLevelFromClass(
    resolved,
    activationLevel,
  )

  const recommendationArgs: RecommendationArgs = {
    spellcasting: characterClass.spellcasting,
    classLevel: activationLevel,
    activationClassLevel: activationLevel,
    maxSelectableSpellLevel: maxSelectableAtActivation,
    catalogSpellsById: spellsById,
  }

  return {
    className: characterClass.name,
    activationLevel,
    ability: characterClass.spellcasting.ability,
    focusKinds: characterClass.spellcasting.focusKinds ?? [],
    resolved,
    slotRecovery: resolved.slotProgression.recovery,
    isPactMagic: isPactClassSpellcasting(resolved),
    occupiedSpellLevelsAtActivation: occupiedAtActivation,
    eligibleSpellLevelRangeAtActivation: formatSpellLevelRange(occupiedAtActivation),
    cantrips: buildCantripsFacts({
      characterClass,
      activationLevel,
      resolved,
      recommendationArgs,
    }),
    spellbook: buildSpellbookFacts({ activationLevel, resolved, recommendationArgs }),
    leveledSelection: buildLeveledSelectionFacts({
      activationLevel,
      occupiedAtActivation,
      maxSelectableAtActivation,
      resolved,
      recommendationArgs,
    }),
    preparedExample: resolvePreparedExample({ activationLevel, resolved }),
    pactSlotExample: resolvePactSlotExample({ activationLevel, resolved }),
  }
}
