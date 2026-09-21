import {
  CLASS_SPELLCASTING_CHOICE_SUFFIXES,
  type ClassSpellSelection,
  type SpellRecommendation,
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

function spellSlugFromId(spellId: string): string {
  const colonIndex = spellId.indexOf(':')
  return colonIndex === -1 ? spellId : spellId.slice(colonIndex + 1)
}

function recommendationMatchesSpellLevel(
  recommendation: SpellRecommendation,
  spell: Spell,
  classLevel: number,
): boolean {
  if (recommendation.classLevel !== undefined && recommendation.classLevel !== classLevel) {
    return false
  }
  if (recommendation.spellLevel !== undefined && recommendation.spellLevel !== spell.level) {
    return false
  }
  return true
}

function recommendedOptionIdsForSlug(args: {
  slug: string
  optionIds: ReadonlySet<string>
  recommendation: SpellRecommendation
  classLevel: number
  catalogSpellsById: ReadonlyMap<string, Spell>
}): string[] {
  const matches: string[] = []
  for (const optionId of args.optionIds) {
    if (spellSlugFromId(optionId) !== args.slug) continue
    const spell = args.catalogSpellsById.get(optionId)
    if (!spell) continue
    if (!recommendationMatchesSpellLevel(args.recommendation, spell, args.classLevel)) continue
    matches.push(optionId)
  }
  return matches
}

function recommendedOptionIdsForRecommendation(args: {
  recommendation: SpellRecommendation
  optionIds: ReadonlySet<string>
  classLevel: number
  catalogSpellsById: ReadonlyMap<string, Spell>
}): string[] {
  return args.recommendation.spellIds.flatMap((slug) =>
    recommendedOptionIdsForSlug({
      slug,
      optionIds: args.optionIds,
      recommendation: args.recommendation,
      classLevel: args.classLevel,
      catalogSpellsById: args.catalogSpellsById,
    }),
  )
}

/** Resolves recommended spell ids for the opened ChoiceSet; advisory only. */
export function resolveRecommendedSpellIdsForChoiceSet(args: {
  spellcasting: Spellcasting | undefined
  choiceSetId: string
  classId: string
  classLevel: number
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
      catalogSpellsById: args.catalogSpellsById,
    })) {
      recommended.add(optionId)
    }
  }

  return recommended
}

export function sortSpellPickerItemsRecommendedFirst<
  T extends { state: { isRecommended: boolean } },
>(items: readonly T[]): T[] {
  const hasRecommendations = items.some((item) => item.state.isRecommended)
  if (!hasRecommendations) return [...items]
  return [...items].sort((left, right) => {
    if (left.state.isRecommended === right.state.isRecommended) return 0
    return left.state.isRecommended ? -1 : 1
  })
}
