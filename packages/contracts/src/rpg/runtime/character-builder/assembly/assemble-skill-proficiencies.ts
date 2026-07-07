import type { CharacterClass } from '../../../content/classes/class'
import type { CharacterSkillProficiencyEntry } from '../../character/proficiencies'
import type { CharacterSelectionSource } from '../../character/selection-sources'
import type { ChoiceSet } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'
import type { CharacterBuilderDraft } from '../draft'

// ---------------------------------------------------------------------------
// Character Builder skill proficiency finalization — merges class-fixed skills
// with ChoiceSet selections and provenance.
// ---------------------------------------------------------------------------

const CLASS_SKILL_PROFICIENCY_SOURCE = (classId: string): CharacterSelectionSource[] => [
  { kind: 'classFeature', sourceId: classId, grantId: 'skill-proficiencies' },
]

function classFixedSkillProficiencies(
  characterClass: CharacterClass,
): CharacterSkillProficiencyEntry[] {
  return characterClass.proficiencies.skills.items.map((skill) => ({
    skill,
    rank: 'proficient' as const,
    sources: CLASS_SKILL_PROFICIENCY_SOURCE(characterClass.id),
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

/** Returns finalized skill proficiency rows from class-fixed grants and ChoiceSet picks. */
export function assembleSkillProficiencyEntries(
  draft: CharacterBuilderDraft,
  catalogIndex: CharacterBuildCatalogIndex,
  choiceSets: readonly ChoiceSet[],
  characterClass: CharacterClass | undefined,
): CharacterSkillProficiencyEntry[] {
  if (!characterClass) return []

  return [
    ...classFixedSkillProficiencies(characterClass),
    ...selectedSkillProficiencies(draft, catalogIndex, choiceSets),
  ]
}
