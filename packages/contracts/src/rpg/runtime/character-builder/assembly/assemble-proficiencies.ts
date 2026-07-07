import type { CharacterClass } from '../../../content/classes/class'
import type { CharacterProficiencies } from '../../character/proficiencies'
import type { ChoiceSet } from '../choice-set'
import type { CharacterLanguageAssemblyContext } from './assemble-language-proficiencies'
import { assembleLanguageProficiencyEntries } from './assemble-language-proficiencies'
import { assembleSkillProficiencyEntries } from './assemble-skill-proficiencies'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft'

// ---------------------------------------------------------------------------
// Proficiency aggregate assembly — composes per-domain orchestration modules.
// ---------------------------------------------------------------------------

function classFixedWeaponProficiencies(characterClass: CharacterClass) {
  return characterClass.proficiencies.weapons.categories.map((weaponCategory) => ({
    weaponCategory,
    rank: 'proficient' as const,
    sources: [
      {
        kind: 'classFeature' as const,
        sourceId: characterClass.id,
        grantId: 'weapon-proficiencies',
      },
    ],
  }))
}

function classFixedArmorProficiencies(characterClass: CharacterClass) {
  return characterClass.proficiencies.armor.categories.map((armorCategory) => ({
    armorCategory,
    sources: [
      {
        kind: 'classFeature' as const,
        sourceId: characterClass.id,
        grantId: 'armor-proficiencies',
      },
    ],
  }))
}

function classFixedToolProficiencies(characterClass: CharacterClass) {
  const tools = characterClass.proficiencies.tools ?? { categories: [], items: [] }

  const fromCategories = tools.categories.map((toolCategory) => ({
    toolCategory,
    rank: 'proficient' as const,
    sources: [
      {
        kind: 'classFeature' as const,
        sourceId: characterClass.id,
        grantId: 'tool-proficiencies',
      },
    ],
  }))

  const fromItems = tools.items.map((toolId) => ({
    toolId,
    rank: 'proficient' as const,
    sources: [
      {
        kind: 'classFeature' as const,
        sourceId: characterClass.id,
        grantId: 'tool-proficiencies',
      },
    ],
  }))

  return [...fromCategories, ...fromItems]
}

/**
 * Merges class-fixed weapon/armor proficiencies with skill and language rows from
 * domain orchestration modules. Species heritage and grant-derived proficiencies
 * from {@link resolveAvailableChoices} can extend this in follow-on work.
 */
export function assembleCharacterProficiencies(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
  characterClass: CharacterClass | undefined,
  languageContext?: CharacterLanguageAssemblyContext,
): CharacterProficiencies {
  const languages = languageContext
    ? assembleLanguageProficiencyEntries(draft, languageContext, catalogIndex.languages, choiceSets)
    : []

  if (!characterClass) {
    return { skills: [], weapons: [], armor: [], tools: [], languages }
  }

  return {
    skills: assembleSkillProficiencyEntries(draft, catalogIndex, choiceSets, characterClass),
    weapons: classFixedWeaponProficiencies(characterClass),
    armor: classFixedArmorProficiencies(characterClass),
    tools: classFixedToolProficiencies(characterClass),
    languages,
  }
}
