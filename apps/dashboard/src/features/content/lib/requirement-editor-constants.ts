import { ABILITY_ENTRIES, ABILITY_IDS } from '@rpg/contracts'

import { REQUIREMENT_LEAF_TYPES, type RequirementLeafType } from './requirement-editor-form'

export const ADD_CONDITION_SET_LABEL = 'Add condition set'
export const ADD_CONDITION_LABEL = 'Add condition'
export const PREVIEW_LABEL = 'Prerequisites preview'
export const CONDITION_SETS_HEADING = 'Condition sets'
export const MATCH_RULE_LABEL = 'Match rule'
export const CONDITION_TYPE_LABEL = 'Condition type'
export const CONDITION_TYPE_PLACEHOLDER = 'Choose condition'

export const MATCH_RULE_OPTIONS = [
  { value: 'all', label: 'All of these must be true' },
  { value: 'any', label: 'Any one of these must be true' },
] as const

export const LOGIC_CONNECTOR_LABELS = {
  AND: 'AND',
  OR: 'OR',
} as const

export const ABILITY_MINIMUM_OF_CONNECTOR = 'of'

export const SENTENCE_OPERATOR_LABELS = {
  minLevel: 'is at least',
  abilityMinimum: 'is at least',
} as const

export const SPELLCASTING_SENTENCE_LABEL = 'Has Spellcasting feature'

export const REQUIREMENT_LEAF_TYPE_LABELS: Record<RequirementLeafType, string> = {
  minLevel: 'Character level',
  abilityMinimum: 'Ability score',
  spellcasting: 'Spellcasting',
}

export const REQUIREMENT_LEAF_TYPE_OPTIONS = REQUIREMENT_LEAF_TYPES.map((type) => ({
  value: type,
  label: REQUIREMENT_LEAF_TYPE_LABELS[type],
}))

export const REQUIREMENT_ABILITY_OPTIONS = ABILITY_IDS.map((id) => ({
  value: id,
  label: ABILITY_ENTRIES[id].label,
}))

export const EMPTY_CONDITION_SETS_HINT = 'Define requirements by adding a condition set.'

export const MIN_LEVEL_FIELD_LABEL = 'Minimum level'
export const ABILITY_FIELD_LABEL = 'Ability'
export const MINIMUM_SCORE_FIELD_LABEL = 'Minimum score'

export function conditionSetAriaLabel(index: number): string {
  return `Condition set ${index + 1}`
}

export function removeConditionSetLabel(index: number): string {
  return `Remove condition set ${index + 1}`
}

export function removeConditionLabel(setIndex: number, conditionIndex: number): string {
  return `Remove condition ${conditionIndex + 1} from condition set ${setIndex + 1}`
}
