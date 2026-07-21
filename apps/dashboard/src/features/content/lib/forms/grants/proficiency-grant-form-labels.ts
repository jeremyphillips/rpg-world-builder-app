import {
  getProficiencyDomainCompactLabel,
  getProficiencyPoolAnyScopePhrase,
  getProficiencyPoolSelectedPhrase,
} from '@rpg/contracts'

const skillCompactLabel = getProficiencyDomainCompactLabel('skill').toLowerCase()

function titleCasePhrase(phrase: string): string {
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`
}

/** Top-level proficiency authoring mode — what the character receives. */
export const WEAPON_PROFICIENCY_SOURCE_LABELS = {
  specific: 'Specific weapons',
  category: 'Weapon categories',
  pool: 'Choice from weapon pool',
} as const

export const TOOL_PROFICIENCY_SOURCE_LABELS = {
  specific: 'Specific tools',
  category: 'Tool categories',
  pool: 'Choice from tool pool',
} as const

export const SKILL_PROFICIENCY_SOURCE_LABELS = {
  specific: `Specific ${skillCompactLabel}`,
  pool: 'Choice from skill pool',
} as const

export const ARMOR_TRAINING_SOURCE_LABELS = {
  specific: 'Specific armor',
  category: 'Armor categories',
  pool: 'Choice from armor pool',
} as const

/** Pool sub-mode shown in the choice inline sentence. */
export const WEAPON_PROFICIENCY_POOL_KIND_LABELS = {
  filtered: 'Weapon categories',
  explicit: 'Specific weapons',
} as const

export const TOOL_PROFICIENCY_POOL_KIND_LABELS = {
  filtered: 'Tool categories',
  explicit: 'Specific tools',
  any: 'Any tools',
} as const

export const SKILL_PROFICIENCY_POOL_KIND_LABELS = {
  explicit: titleCasePhrase(getProficiencyPoolSelectedPhrase('skill')),
  any: titleCasePhrase(getProficiencyPoolAnyScopePhrase('skill')),
} as const

export const ARMOR_TRAINING_POOL_KIND_LABELS = {
  filtered: 'Armor categories',
  explicit: 'Specific armor',
} as const
