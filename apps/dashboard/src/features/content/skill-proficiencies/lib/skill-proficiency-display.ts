import {
  formatSkillProficiencySummarySentence,
  getAbilityLabel,
  SKILL_PROFICIENCY_SECTION_LABELS,
  type SkillProficiency,
} from '@rpg/contracts'

export type SkillProficiencyDetailViewModel = {
  governingAbilityLabel: string
  summarySentence?: string
  examples: string[]
  examplesSectionTitle: string
}

export function buildSkillProficiencyDetailViewModel(
  skill: SkillProficiency,
): SkillProficiencyDetailViewModel {
  return {
    governingAbilityLabel: getAbilityLabel(skill.ability),
    summarySentence: formatSkillProficiencySummarySentence(skill),
    examples: skill.examples,
    examplesSectionTitle: SKILL_PROFICIENCY_SECTION_LABELS.examples,
  }
}
