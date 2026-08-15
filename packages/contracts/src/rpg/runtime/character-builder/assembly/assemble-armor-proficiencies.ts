import type { CharacterClass } from '../../../content/classes/class'
import { isArmorEquipment } from '../../../content/equipment'
import { resolveEquipmentContentId } from '../../../content/starting-equipment'
import type { ArmorCategory } from '../../../vocab/armor/category'
import type { CharacterArmorProficiencyEntry } from '../../character/proficiencies'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex, CharacterBuildContext } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'
import { isBuilderLevelZeroClassless } from '../progression/character-level-policy'
import { levelZeroBaselineArmorEntries } from './level-zero-baseline-proficiency-entries'
import { assembleGrantArmorProficiencyEntries } from './assemble-grant-proficiencies'
import { selectionSourceFromChoiceSet } from './selection-source-from-choice-set'

// ---------------------------------------------------------------------------
// Character Builder armor proficiency finalization — merges class-fixed and
// grant-derived armor training with ChoiceSet selections and provenance.
// ---------------------------------------------------------------------------

const CLASS_ARMOR_PROFICIENCY_SOURCE = (classId: string) => [
  { kind: 'classFeature' as const, sourceId: classId, grantId: 'armor-proficiencies' },
]

function classFixedArmorProficiencies(
  characterClass: CharacterClass,
): CharacterArmorProficiencyEntry[] {
  return characterClass.proficiencies.armor.categories.map((armorCategory) => ({
    armorCategory,
    sources: CLASS_ARMOR_PROFICIENCY_SOURCE(characterClass.id),
  }))
}

/** Resolves armor category from a ChoiceSet option id when the pool lists armor equipment. */
export function resolveArmorCategoryFromOption(
  optionId: string,
  catalogIndex: CharacterBuildCatalogIndex,
  rulesetId: string,
): ArmorCategory | undefined {
  const equipmentId = optionId.includes(':')
    ? optionId
    : resolveEquipmentContentId(rulesetId, optionId)
  const equipment = catalogIndex.equipment.get(equipmentId)
  if (equipment && isArmorEquipment(equipment)) return equipment.category

  return undefined
}

function rulesetIdFromDraft(
  draft: CharacterBuilderDraft,
  characterClass: CharacterClass | undefined,
): string {
  if (characterClass) return characterClass.rulesetId
  const speciesId = draft.species.speciesId
  if (!speciesId) return ''
  const colonIndex = speciesId.indexOf(':')
  return colonIndex >= 0 ? speciesId.slice(0, colonIndex) : speciesId
}

function selectedArmorProficiencies(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
  rulesetId: string,
): CharacterArmorProficiencyEntry[] {
  const entries: CharacterArmorProficiencyEntry[] = []

  for (const choiceSet of choiceSets) {
    if (choiceSet.choiceType !== 'armorTraining') continue

    const selections = draft.choiceSelections[choiceSet.id] ?? []
    for (const optionId of selections) {
      const armorCategory = resolveArmorCategoryFromOption(optionId, catalogIndex, rulesetId) as
        | ArmorCategory
        | undefined
      if (!armorCategory) continue

      entries.push({
        armorCategory,
        sources: selectionSourceFromChoiceSet(choiceSet),
      })
    }
  }

  return entries
}

/** Merges armor proficiency rows, combining sources when the same category appears twice. */
export function mergeArmorProficiencyEntries(
  entries: CharacterArmorProficiencyEntry[],
): CharacterArmorProficiencyEntry[] {
  const byCategory = new Map<string, CharacterArmorProficiencyEntry>()

  for (const entry of entries) {
    const existing = byCategory.get(entry.armorCategory)
    if (!existing) {
      byCategory.set(entry.armorCategory, entry)
      continue
    }

    byCategory.set(entry.armorCategory, {
      armorCategory: entry.armorCategory,
      sources: [...(existing.sources ?? []), ...(entry.sources ?? [])],
    })
  }

  return [...byCategory.values()]
}

/** Returns finalized armor proficiency rows for preview/finalization. */
export function assembleArmorProficiencyEntries(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
  characterClass: CharacterClass | undefined,
  context?: CharacterBuildContext,
): CharacterArmorProficiencyEntry[] {
  const rulesetId = rulesetIdFromDraft(draft, characterClass)
  const classEntries = characterClass ? classFixedArmorProficiencies(characterClass) : []
  const grantEntries = assembleGrantArmorProficiencyEntries(draft, catalogIndex, characterClass)
  const selectedEntries = selectedArmorProficiencies(draft, catalogIndex, choiceSets, rulesetId)
  const levelZeroEntries =
    context && isBuilderLevelZeroClassless(draft, context)
      ? levelZeroBaselineArmorEntries(context.characterCreationRules.levelZeroNpcs)
      : []

  return mergeArmorProficiencyEntries([
    ...levelZeroEntries,
    ...classEntries,
    ...grantEntries,
    ...selectedEntries,
  ])
}
