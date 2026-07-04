import type { CharacterClass } from '../../content/classes/class'
import type {
  CharacterArmorProficiencyEntry,
  CharacterProficiencies,
  CharacterSkillProficiencyEntry,
  CharacterWeaponProficiencyEntry,
} from '../character/proficiencies'
import type { CharacterSelectionSource } from '../character/selection-sources'
import type { ChoiceSet } from './choice-set'
import type { CharacterBuildCatalogIndex } from './context'
import type { CharacterBuilderDraft } from './draft'

// ---------------------------------------------------------------------------
// Proficiency assembly — merges fixed class grants with ChoiceSet selections.
// ---------------------------------------------------------------------------

const CLASS_WEAPON_PROFICIENCY_SOURCE = (classId: string): CharacterSelectionSource[] => [
  { kind: 'classFeature', sourceId: classId, grantId: 'weapon-proficiencies' },
]

const CLASS_ARMOR_PROFICIENCY_SOURCE = (classId: string): CharacterSelectionSource[] => [
  { kind: 'classFeature', sourceId: classId, grantId: 'armor-proficiencies' },
]

function classFixedWeaponProficiencies(
  characterClass: CharacterClass,
): CharacterWeaponProficiencyEntry[] {
  return characterClass.proficiencies.weapons.categories.map((weaponCategory) => ({
    weaponCategory,
    rank: 'proficient' as const,
    sources: CLASS_WEAPON_PROFICIENCY_SOURCE(characterClass.id),
  }))
}

function classFixedArmorProficiencies(
  characterClass: CharacterClass,
): CharacterArmorProficiencyEntry[] {
  return characterClass.proficiencies.armor.map((armorCategory) => ({
    armorCategory,
    sources: CLASS_ARMOR_PROFICIENCY_SOURCE(characterClass.id),
  }))
}

function skillProficiencySource(choiceSet: ChoiceSet): CharacterSelectionSource[] {
  return [{ kind: 'classFeature', sourceId: choiceSet.sourceId, grantId: choiceSet.id }]
}

function resolveSkillSlug(optionId: string, catalogIndex: CharacterBuildCatalogIndex): string {
  const skillRow = catalogIndex.skillProficiencies.get(optionId)
  return skillRow?.slug ?? optionId
}

function selectedSkillProficiencies(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
): CharacterSkillProficiencyEntry[] {
  const entries: CharacterSkillProficiencyEntry[] = []

  for (const choiceSet of choiceSets) {
    if (choiceSet.choiceType !== 'skillProficiency') continue

    const selections = draft.choiceSelections[choiceSet.id] ?? []
    for (const optionId of selections) {
      entries.push({
        skill: resolveSkillSlug(optionId, catalogIndex),
        rank: 'proficient',
        sources: skillProficiencySource(choiceSet),
      })
    }
  }

  return entries
}

/**
 * Merges class-fixed weapon/armor proficiencies with skill proficiencies from
 * ChoiceSet selections. Species heritage and other grant sources land in
 * BENCH-087.
 */
export function assembleCharacterProficiencies(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
  characterClass: CharacterClass | undefined,
): CharacterProficiencies {
  if (!characterClass) {
    return { skills: [], weapons: [], armor: [], tools: [] }
  }

  return {
    skills: selectedSkillProficiencies(draft, catalogIndex, choiceSets),
    weapons: classFixedWeaponProficiencies(characterClass),
    armor: classFixedArmorProficiencies(characterClass),
    tools: [],
  }
}
