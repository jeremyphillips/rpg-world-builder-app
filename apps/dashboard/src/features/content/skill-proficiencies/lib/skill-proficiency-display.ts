import {
  formatSkillProficiencySummarySentence,
  getAbilityLabel,
  SKILL_PROFICIENCY_SECTION_LABELS,
  type SkillProficiency,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../lib/detail/metadata/content-stat-rows'

export const SKILL_PROFICIENCY_DETAIL_STAT_LABELS = {
  governingAbility: 'Governing Ability',
  classSkillChoices: 'Class skill choices',
} as const

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

export function buildSkillProficiencyHeroStatRows(
  governingAbilityLabel: string,
): ContentStatRowData[] {
  return [
    {
      label: SKILL_PROFICIENCY_DETAIL_STAT_LABELS.governingAbility,
      value: governingAbilityLabel,
    },
  ]
}
