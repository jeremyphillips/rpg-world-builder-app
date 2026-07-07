import type { ChoiceSet, ProficiencyPickerItem } from '@rpg/contracts'

export type { ChoiceSet, ProficiencyPickerItem, ProficiencyPickerItemState } from '@rpg/contracts'

export const PROFICIENCY_PICKER_NO_RESULTS_MESSAGE = 'No proficiencies match your search.'
export const PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE =
  'No proficiencies are available for this choice.'
export const PROFICIENCY_PICKER_SELECTION_FULL_MESSAGE =
  'You have selected the maximum number of proficiencies for this choice.'

export type ProficiencyPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  choiceSet: ChoiceSet
  selectedIds: string[]
  items: readonly ProficiencyPickerItem[]
  onSelectOption: (optionId: string) => void
  onRemoveOption: (optionId: string) => void
}
