import {
  catalogNounFromTerm,
  formatCatalogPickerCopy,
  PROFICIENCY_TERM,
  type CharacterBuildCatalogIndex,
  type ChoiceSet,
  type ProficiencyPickerItem,
} from '@rpg/contracts'

import {
  CATALOG_PICKER_SORT_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_NAME_ASC,
  CATALOG_PICKER_SORT_LABEL_NAME_DESC,
  CATALOG_PICKER_SORT_NAME_ASC,
  CATALOG_PICKER_SORT_NAME_DESC,
} from '../../picker/sort/catalog-picker-sort-modes.lib'

export type { ChoiceSet, ProficiencyPickerItem, ProficiencyPickerItemState } from '@rpg/contracts'

const proficiencyCopy = formatCatalogPickerCopy(catalogNounFromTerm(PROFICIENCY_TERM))

export const PROFICIENCY_PICKER_NO_RESULTS_MESSAGE = proficiencyCopy.noResultsMessage
export const PROFICIENCY_PICKER_NO_OPTIONS_MESSAGE = proficiencyCopy.noOptionsMessage
export const PROFICIENCY_PICKER_SELECTION_FULL_MESSAGE = proficiencyCopy.selectionFullMessage

export const PROFICIENCY_PICKER_SORT_BEST_MATCH = CATALOG_PICKER_SORT_BEST_MATCH
export const PROFICIENCY_PICKER_SORT_NAME_ASC = CATALOG_PICKER_SORT_NAME_ASC
export const PROFICIENCY_PICKER_SORT_NAME_DESC = CATALOG_PICKER_SORT_NAME_DESC

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
  [PROFICIENCY_PICKER_SORT_BEST_MATCH]: CATALOG_PICKER_SORT_LABEL_BEST_MATCH,
  [PROFICIENCY_PICKER_SORT_NAME_ASC]: CATALOG_PICKER_SORT_LABEL_NAME_ASC,
  [PROFICIENCY_PICKER_SORT_NAME_DESC]: CATALOG_PICKER_SORT_LABEL_NAME_DESC,
}

export const PROFICIENCY_PICKER_SORT_TRIGGER_LABELS: Record<ProficiencyPickerSortMode, string> = {
  [PROFICIENCY_PICKER_SORT_BEST_MATCH]: CATALOG_PICKER_SORT_LABEL_BEST_MATCH,
  [PROFICIENCY_PICKER_SORT_NAME_ASC]: 'A–Z',
  [PROFICIENCY_PICKER_SORT_NAME_DESC]: 'Z–A',
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
