import type { CharacterClass } from '../../../content/classes/class'
import type { CharacterProficiencies } from '../../character/proficiencies'
import type { ChoiceSet } from '../choice-set'
import type { CharacterLanguageAssemblyContext } from './assemble-language-proficiencies'
import { assembleLanguageProficiencyEntries } from './assemble-language-proficiencies'
import { assembleArmorProficiencyEntries } from './assemble-armor-proficiencies'
import { assembleSkillProficiencyEntries } from './assemble-skill-proficiencies'
import { assembleToolProficiencyEntries } from './assemble-tool-proficiencies'
import { assembleWeaponProficiencyEntries } from './assemble-weapon-proficiencies'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft/draft'

// ---------------------------------------------------------------------------
// Proficiency aggregate assembly — composes per-domain orchestration modules.
// ---------------------------------------------------------------------------

/**
 * Merges class-fixed, grant-derived, and ChoiceSet-selected proficiency rows
 * across all domains for preview and finalize.
 */
export function assembleCharacterProficiencies(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
  characterClass: CharacterClass | undefined,
  languageContext?: CharacterLanguageAssemblyContext,
): CharacterProficiencies {
  const languages = languageContext
    ? assembleLanguageProficiencyEntries(
        draft,
        languageContext,
        catalogIndex.languages,
        choiceSets,
        characterClass,
      )
    : []

  return {
    skills: assembleSkillProficiencyEntries(draft, catalogIndex, choiceSets, characterClass),
    weapons: assembleWeaponProficiencyEntries(draft, catalogIndex, choiceSets, characterClass),
    armor: assembleArmorProficiencyEntries(draft, catalogIndex, choiceSets, characterClass),
    tools: assembleToolProficiencyEntries(draft, catalogIndex, choiceSets, characterClass),
    languages,
  }
}
