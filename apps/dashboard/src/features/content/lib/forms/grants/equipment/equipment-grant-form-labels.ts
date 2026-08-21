export const EQUIPMENT_GRANT_ITEM_KIND_LABELS = {
  grant: 'Specific item',
  choice: 'Choice from pool',
} as const

export const EQUIPMENT_GRANT_TARGET_SOURCE_LABELS = {
  equipment: 'Specific equipment',
  proficiency_choice: 'Proficiency choice',
} as const

/** Labels for class starting-equipment grant rows (proficiency-linked authoring). */
export const STARTING_EQUIPMENT_GRANT_ITEM_KIND_LABELS = {
  grant: 'Granted item',
  choice: 'Choice from pool',
} as const

export const STARTING_EQUIPMENT_GRANT_TARGET_SOURCE_LABELS = {
  equipment: 'Catalog equipment',
  proficiency_choice: 'Tool proficiency choice',
} as const

export const EQUIPMENT_POOL_SOURCE_LABELS = {
  explicit: 'a list of specific items',
  filtered: 'a category of equipment',
} as const

export const LINKED_PROFICIENCY_CHOICE_LABEL = 'Linked proficiency choice' as const

export const PROFICIENCY_LINK_GRANT_HINT =
  'The character receives the same tool selected in Tool Proficiencies below.' as const

export const PROFICIENCY_LINK_SUMMARY = 'Linked to Tool Proficiencies' as const

export const PROFICIENCY_LINK_NO_ELIGIBLE_CHOICES_HINT =
  'No eligible proficiency choices. Add a proficiency choice that selects exactly one option.' as const

export const INELIGIBLE_PROFICIENCY_CHOICE_ERROR =
  'Linked proficiency choice is no longer eligible. It must be a tool choice that selects exactly one option.' as const

export function formatProficiencyLinkEquipmentCue(choiceLabel: string): string {
  return `Linked to "${choiceLabel}" below`
}

export function formatProficiencyLinkProficiencyCue(packageLabel: string): string {
  return `The selected tool is also granted by the ${packageLabel} option.`
}

export function formatMissingProficiencyChoiceError(choiceId: string): string {
  return `Linked proficiency choice unavailable. Could not find "${choiceId}".`
}

export function formatProficiencyChoiceOptionDescription(choiceId: string): string {
  return `Choice ID: ${choiceId}`
}
