import {
  assembleCharacterProficiencies,
  characterPrefersMartialWeaponBrowseOrder,
  createEmptyCharacterBuilderDraft,
  deriveEquipmentRecommendations,
  resolveEquipmentPickerItems,
  type CharacterBuildCatalogIndex,
  type CharacterBuilderDraft,
  type CharacterClass,
  type ChoiceSet,
  type Equipment,
  type EquipmentBudgetSummary,
  type EquipmentPickerBrowseSortContext,
  type EquipmentPickerItem,
  type EquipmentRecommendationContext,
} from '@rpg/contracts'

export type EquipmentPickerRecommendationSemanticInput = {
  speciesId: string
  classId: string
  level: number
}

/**
 * Canonical adapter when recommendation APIs require a draft but the consumer only
 * has species/class/level (e.g. Quick NPC Requirements). Do not scatter partial
 * draft construction outside this helper.
 */
export function buildMinimalCharacterBuilderDraftForRecommendations(
  input: EquipmentPickerRecommendationSemanticInput,
): CharacterBuilderDraft {
  const draft = createEmptyCharacterBuilderDraft()
  draft.species = { speciesId: input.speciesId }
  draft.class = { classId: input.classId, level: input.level }
  return draft
}

export type BuildEquipmentPickerRecommendationContextArgs = {
  /** Equipment universe — owned by the calling surface. */
  equipment: readonly Equipment[]
  draft: CharacterBuilderDraft
  characterClass: CharacterClass
  catalogIndex: CharacterBuildCatalogIndex
  choiceSets?: readonly ChoiceSet[]
  budget?: EquipmentBudgetSummary
  /** Max starting purse across available packages, in copper. */
  purchaseBudgetCeilingCp?: number
  recommendationContext?: EquipmentRecommendationContext
}

/** Resolved facts and recommendations for every catalog equipment row, keyed by content id. */
export type EquipmentRecommendationIndex = ReturnType<typeof deriveEquipmentRecommendations>

type EquipmentRecommendationDerivation = {
  proficiencies: ReturnType<typeof assembleCharacterProficiencies>
  recommendations: EquipmentRecommendationIndex
}

export type EquipmentPickerRecommendationContext = EquipmentRecommendationDerivation & {
  items: EquipmentPickerItem[]
  browseSortContext: EquipmentPickerBrowseSortContext
}

/** Proficiencies plus the whole-catalog recommendation index for one draft. */
export function deriveEquipmentRecommendationIndex(
  args: Omit<BuildEquipmentPickerRecommendationContextArgs, 'equipment' | 'budget'>,
): EquipmentRecommendationDerivation {
  const { draft, characterClass, catalogIndex, choiceSets = [], recommendationContext } = args
  const proficiencies = assembleCharacterProficiencies(
    draft,
    catalogIndex,
    choiceSets,
    characterClass,
  )
  const recommendations = deriveEquipmentRecommendations({
    characterClass,
    catalogIndex,
    proficiencies,
    classLevel: draft.class.level,
    draft,
    choiceSets,
    recommendationContext,
  })
  return { proficiencies, recommendations }
}

/** Surface-neutral proficiency + recommendation + picker item assembly. */
export function buildEquipmentPickerRecommendationContext(
  args: BuildEquipmentPickerRecommendationContextArgs,
): EquipmentPickerRecommendationContext {
  const { equipment, budget, purchaseBudgetCeilingCp } = args
  const { proficiencies, recommendations } = deriveEquipmentRecommendationIndex(args)
  const items = resolveEquipmentPickerItems({
    equipment,
    proficiencies,
    recommendations,
    budget,
    purchaseBudgetCeilingCp,
  })

  return {
    proficiencies,
    recommendations,
    items,
    browseSortContext: {
      preferMartialWeaponBrowseOrder: characterPrefersMartialWeaponBrowseOrder(proficiencies),
    },
  }
}
