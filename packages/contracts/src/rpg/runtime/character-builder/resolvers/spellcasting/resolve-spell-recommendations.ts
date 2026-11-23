import {
  CLASS_SPELLCASTING_CHOICE_SUFFIXES,
  type ClassSpellSelection,
  type SpellRecommendation,
  type SpellRecommendationTarget,
  type Spellcasting,
} from '../../../../content/classes/spellcasting'
import type { Spell } from '../../../../content/spell'
import { spellcastingChoiceSetId } from './resolve-spellcasting-choice-sets'

function level1PlusChoiceSuffix(selection: ClassSpellSelection | undefined): string | undefined {
  switch (selection?.model) {
    case 'limitedRepertoire':
      return CLASS_SPELLCASTING_CHOICE_SUFFIXES.repertoire
    case 'prepareFromClassList':
      return CLASS_SPELLCASTING_CHOICE_SUFFIXES.prepared
    case 'prepareFromLearnedCollection':
      return CLASS_SPELLCASTING_CHOICE_SUFFIXES.spellbook
    default:
      return undefined
  }
}

function recommendationMatchesChoiceSet(args: {
  recommendation: SpellRecommendation
  choiceSetId: string
  classId: string
  spellSelection: ClassSpellSelection | undefined
}): boolean {
  const { recommendation, choiceSetId, classId, spellSelection } = args
  if (recommendation.target === 'cantrips') {
    return (
      choiceSetId === spellcastingChoiceSetId(classId, CLASS_SPELLCASTING_CHOICE_SUFFIXES.cantrips)
    )
  }

  const suffix = level1PlusChoiceSuffix(spellSelection)
  if (!suffix) return false
  return choiceSetId === spellcastingChoiceSetId(classId, suffix)
}

function recommendationScheduleLevel(
  recommendation: SpellRecommendation,
  activationClassLevel: number,
): number {
  return recommendation.classLevel ?? activationClassLevel
}

function recommendationMatchesEligibility(args: {
  recommendation: SpellRecommendation
  spell: Spell
  classLevel: number
  activationClassLevel: number
  maxSelectableSpellLevel: number
}): boolean {
  const scheduleLevel = recommendationScheduleLevel(args.recommendation, args.activationClassLevel)
  if (args.classLevel !== scheduleLevel) return false
  if (args.spell.level > args.maxSelectableSpellLevel) return false
  return true
}

function recommendedOptionIdsForReference(args: {
  spellId: string
  optionIds: ReadonlySet<string>
  recommendation: SpellRecommendation
  classLevel: number
  activationClassLevel: number
  maxSelectableSpellLevel: number
  catalogSpellsById: ReadonlyMap<string, Spell>
}): string[] {
  if (!args.optionIds.has(args.spellId)) return []
  const spell = args.catalogSpellsById.get(args.spellId)
  if (!spell) return []
  if (
    !recommendationMatchesEligibility({
      recommendation: args.recommendation,
      spell,
      classLevel: args.classLevel,
      activationClassLevel: args.activationClassLevel,
      maxSelectableSpellLevel: args.maxSelectableSpellLevel,
    })
  ) {
    return []
  }
  return [args.spellId]
}

function recommendedOptionIdsForRecommendation(args: {
  recommendation: SpellRecommendation
  optionIds: ReadonlySet<string>
  classLevel: number
  activationClassLevel: number
  maxSelectableSpellLevel: number
  catalogSpellsById: ReadonlyMap<string, Spell>
}): string[] {
  return args.recommendation.spellIds.flatMap((spellId) =>
    recommendedOptionIdsForReference({
      spellId,
      optionIds: args.optionIds,
      recommendation: args.recommendation,
      classLevel: args.classLevel,
      activationClassLevel: args.activationClassLevel,
      maxSelectableSpellLevel: args.maxSelectableSpellLevel,
      catalogSpellsById: args.catalogSpellsById,
    }),
  )
}

/** Resolves recommendation spell ids for a semantic target at the given class level. */
export function resolveApplicableRecommendationSpellIds(args: {
  spellcasting: Spellcasting | undefined
  target: SpellRecommendationTarget
  classLevel: number
  activationClassLevel: number
  maxSelectableSpellLevel: number
  catalogSpellsById?: ReadonlyMap<string, Spell>
}): string[] {
  const recommendations = args.spellcasting?.recommendations ?? []
  if (recommendations.length === 0) return []

  const result: string[] = []
  for (const recommendation of recommendations) {
    if (recommendation.target !== args.target) continue

    if (!args.catalogSpellsById) {
      const scheduleLevel = recommendationScheduleLevel(recommendation, args.activationClassLevel)
      if (args.classLevel !== scheduleLevel) continue
      result.push(...recommendation.spellIds)
      continue
    }

    for (const spellId of recommendedOptionIdsForRecommendation({
      recommendation,
      optionIds: new Set(recommendation.spellIds),
      classLevel: args.classLevel,
      activationClassLevel: args.activationClassLevel,
      maxSelectableSpellLevel: args.maxSelectableSpellLevel,
      catalogSpellsById: args.catalogSpellsById,
    })) {
      result.push(spellId)
    }
  }

  return result
}

/** Resolves recommended spell ids for the opened ChoiceSet; advisory only. */
export function resolveRecommendedSpellIdsForChoiceSet(args: {
  spellcasting: Spellcasting | undefined
  choiceSetId: string
  classId: string
  classLevel: number
  activationClassLevel: number
  maxSelectableSpellLevel: number
  choiceSetOptionIds: readonly string[]
  catalogSpellsById: ReadonlyMap<string, Spell>
}): Set<string> {
  const recommendations = args.spellcasting?.recommendations ?? []
  if (recommendations.length === 0) return new Set()

  const optionIds = new Set(args.choiceSetOptionIds)
  const recommended = new Set<string>()
  const spellSelection = args.spellcasting?.spellSelection

  for (const recommendation of recommendations) {
    if (
      !recommendationMatchesChoiceSet({
        recommendation,
        choiceSetId: args.choiceSetId,
        classId: args.classId,
        spellSelection,
      })
    ) {
      continue
    }

    for (const optionId of recommendedOptionIdsForRecommendation({
      recommendation,
      optionIds,
      classLevel: args.classLevel,
      activationClassLevel: args.activationClassLevel,
      maxSelectableSpellLevel: args.maxSelectableSpellLevel,
      catalogSpellsById: args.catalogSpellsById,
    })) {
      recommended.add(optionId)
    }
  }

  return recommended
}
