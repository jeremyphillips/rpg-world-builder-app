import type { CharacterBuildCatalogIndex, ChoiceSet, ProficiencyPickerItem } from '@rpg/contracts'

export type { ChoiceSet, ProficiencyPickerItem, ProficiencyPickerItemState } from '@rpg/contracts'

export const PROFICIENCY_PICKER_NO_RESULTS_MESSAGE = 'No proficiencies match your search.'
export const PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE =
  'No proficiencies are available for this choice.'
export const PROFICIENCY_PICKER_SELECTION_FULL_MESSAGE =
  'You have selected the maximum number of proficiencies for this choice.'

export const PROFICIENCY_PICKER_RESET_VIEW_LABEL = 'Reset view'

export const PROFICIENCY_PICKER_SORT_BEST_MATCH = 'best_match' as const
export const PROFICIENCY_PICKER_SORT_NAME_ASC = 'name_asc' as const
export const PROFICIENCY_PICKER_SORT_NAME_DESC = 'name_desc' as const

export type ProficiencyPickerSortMode =
  | typeof PROFICIENCY_PICKER_SORT_BEST_MATCH
  | typeof PROFICIENCY_PICKER_SORT_NAME_ASC
  | typeof PROFICIENCY_PICKER_SORT_NAME_DESC

export const PROFICIENCY_PICKER_SORT_MODES = [
  PROFICIENCY_PICKER_SORT_BEST_MATCH,
  PROFICIENCY_PICKER_SORT_NAME_ASC,
  PROFICIENCY_PICKER_SORT_NAME_DESC,
] as const satisfies readonly ProficiencyPickerSortMode[]

export const PROFICIENCY_PICKER_SORT_LABELS: Record<ProficiencyPickerSortMode, string> = {
  [PROFICIENCY_PICKER_SORT_BEST_MATCH]: 'Best match',
  [PROFICIENCY_PICKER_SORT_NAME_ASC]: 'Name (A–Z)',
  [PROFICIENCY_PICKER_SORT_NAME_DESC]: 'Name (Z–A)',
}

export type ProficiencyPickerViewDefaults = {
  sortMode: ProficiencyPickerSortMode
}

export type ProficiencyPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  choiceSet: ChoiceSet
  selectedIds: string[]
  items: readonly ProficiencyPickerItem[]
  catalogIndex: CharacterBuildCatalogIndex
  onSelectOption: (optionId: string) => void
  onRemoveOption: (optionId: string) => void
}
