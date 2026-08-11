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
}

export type EquipmentPickerRecommendationContext = {
  proficiencies: ReturnType<typeof assembleCharacterProficiencies>
  recommendations: ReturnType<typeof deriveEquipmentRecommendations>
  items: EquipmentPickerItem[]
  browseSortContext: EquipmentPickerBrowseSortContext
}

/** Surface-neutral proficiency + recommendation + picker item assembly. */
export function buildEquipmentPickerRecommendationContext(
  args: BuildEquipmentPickerRecommendationContextArgs,
): EquipmentPickerRecommendationContext {
  const { equipment, draft, characterClass, catalogIndex, choiceSets = [], budget } = args
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
  })
  const items = resolveEquipmentPickerItems({
    equipment,
    proficiencies,
    recommendations,
    budget,
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
