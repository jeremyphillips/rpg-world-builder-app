export const TOOL_PROFICIENCIES_SECTION_LABEL = 'Tool Proficiencies' as const

export const STARTING_EQUIPMENT_ITEM_TYPE_LABEL = 'Item type' as const
export const STARTING_EQUIPMENT_ITEM_SOURCE_LABEL = 'Item source' as const
export const LINKED_PROFICIENCY_CHOICE_LABEL = 'Linked proficiency choice' as const

export const CHARACTER_CREATION_TOOL_CHOICE_LABEL_PATH =
  'characterCreation.proficiencies.tools.label' as const

export const STARTING_EQUIPMENT_FIELD_NAME = 'characterCreation.startingEquipment' as const

export const PROFICIENCY_LINK_GRANT_HINT =
  'The character receives the same tool selected in Tool Proficiencies below.' as const

export const PROFICIENCY_LINK_SUMMARY = 'Linked to Tool Proficiencies' as const

export const TOOL_PROFICIENCY_CHOICE_LABEL_FIELD = 'Choice label' as const

export const CHARACTER_CREATION_TOOL_CHOICE_ID = 'class-tools' as const

export function formatProficiencyLinkEquipmentCue(choiceLabel: string): string {
  return `Linked to "${choiceLabel}" below`
}

export function formatProficiencyLinkProficiencyCue(packageLabel: string): string {
  return `The selected tool is also granted by the ${packageLabel} option.`
}

export function formatMissingProficiencyChoiceError(choiceId: string): string {
  return `Linked proficiency choice unavailable. Could not find "${choiceId}".`
}

export const INELIGIBLE_PROFICIENCY_CHOICE_ERROR =
  'Linked proficiency choice is no longer eligible. It must be a tool choice that selects exactly one option.' as const

export function formatProficiencyChoiceOptionDescription(choiceId: string): string {
  return `Choice ID: ${choiceId}`
}
