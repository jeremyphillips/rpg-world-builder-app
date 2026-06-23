import { ABILITY_ENTRIES, ABILITY_IDS } from '@rpg/contracts'

import { REQUIREMENT_LEAF_TYPES, type RequirementLeafType } from './requirement-editor-form'

export const ADD_REQUIREMENT_GROUP_LABEL = 'Add requirement group'
export const ADD_REQUIREMENT_LABEL = 'Add requirement'
export const PREVIEW_LABEL = 'Preview'
export const REQUIREMENT_GROUP_KIND_LABEL = 'Combine requirements with'
export const REQUIREMENT_TYPE_LABEL = 'Requirement type'

export const REQUIREMENT_GROUP_KIND_OPTIONS = [
  { value: 'all', label: 'All required (AND)' },
  { value: 'any', label: 'Any one (OR)' },
] as const

export const REQUIREMENT_LEAF_TYPE_LABELS: Record<RequirementLeafType, string> = {
  minLevel: 'Minimum character level',
  abilityMinimum: 'Ability score minimum',
  spellcasting: 'Spellcasting',
  feature: 'Class feature',
}

export const REQUIREMENT_LEAF_TYPE_OPTIONS = REQUIREMENT_LEAF_TYPES.map((type) => ({
  value: type,
  label: REQUIREMENT_LEAF_TYPE_LABELS[type],
}))

export const REQUIREMENT_ABILITY_OPTIONS = ABILITY_IDS.map((id) => ({
  value: id,
  label: ABILITY_ENTRIES[id].label,
}))

export function requirementGroupLegend(index: number): string {
  return `Requirement group ${index + 1}`
}

export function removeRequirementGroupLabel(index: number): string {
  return `Remove requirement group ${index + 1}`
}

export function removeRequirementLabel(groupIndex: number, requirementIndex: number): string {
  return `Remove requirement ${requirementIndex + 1} from group ${groupIndex + 1}`
}
