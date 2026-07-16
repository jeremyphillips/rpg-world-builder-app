import type { ChoiceSet, SpellPickerItem } from '@rpg/contracts'

import type { SpellDisplayVocabulary } from '@/features/content'

export type { ChoiceSet, SpellPickerItem, SpellPickerItemState } from '@rpg/contracts'

export const SPELL_PICKER_NO_RESULTS_MESSAGE = 'No spells match your search.'
export const SPELL_PICKER_NO_OPTIONS_MESSAGE = 'No spells are available for this choice.'
export const SPELL_PICKER_SELECTION_FULL_MESSAGE =
  'You have selected the maximum number of spells for this choice.'

export const SPELL_PICKER_LEVEL_ALL = '__all__' as const
export const SPELL_PICKER_SCHOOL_ALL = '__all__' as const

export const SPELL_PICKER_LEVEL_LABEL = 'Level'
export const SPELL_PICKER_SCHOOL_LABEL = 'School'
export const SPELL_PICKER_SORT_LABEL = 'Sort'
export const SPELL_PICKER_CLEAR_FILTERS_LABEL = 'Clear filters'
export const SPELL_PICKER_RESET_VIEW_LABEL = 'Reset view'

export const SPELL_PICKER_SORT_BEST_MATCH = 'best_match' as const
export const SPELL_PICKER_SORT_NAME_ASC = 'name_asc' as const
export const SPELL_PICKER_SORT_NAME_DESC = 'name_desc' as const
export const SPELL_PICKER_SORT_LEVEL_ASC = 'level_asc' as const
export const SPELL_PICKER_SORT_LEVEL_DESC = 'level_desc' as const

export type SpellPickerLevelFilter = typeof SPELL_PICKER_LEVEL_ALL | number
export type SpellPickerSchoolFilter = typeof SPELL_PICKER_SCHOOL_ALL | string

export type SpellPickerSortMode =
  | typeof SPELL_PICKER_SORT_BEST_MATCH
  | typeof SPELL_PICKER_SORT_NAME_ASC
  | typeof SPELL_PICKER_SORT_NAME_DESC
  | typeof SPELL_PICKER_SORT_LEVEL_ASC
  | typeof SPELL_PICKER_SORT_LEVEL_DESC

export const SPELL_PICKER_SORT_MODES = [
  SPELL_PICKER_SORT_BEST_MATCH,
  SPELL_PICKER_SORT_NAME_ASC,
  SPELL_PICKER_SORT_NAME_DESC,
  SPELL_PICKER_SORT_LEVEL_ASC,
  SPELL_PICKER_SORT_LEVEL_DESC,
] as const satisfies readonly SpellPickerSortMode[]

export const SPELL_PICKER_SORT_LABELS: Record<SpellPickerSortMode, string> = {
  [SPELL_PICKER_SORT_BEST_MATCH]: 'Best match',
  [SPELL_PICKER_SORT_NAME_ASC]: 'Name (A–Z)',
  [SPELL_PICKER_SORT_NAME_DESC]: 'Name (Z–A)',
  [SPELL_PICKER_SORT_LEVEL_ASC]: 'Level (low–high)',
  [SPELL_PICKER_SORT_LEVEL_DESC]: 'Level (high–low)',
}

export type SpellPickerViewDefaults = {
  selectedLevel: SpellPickerLevelFilter
  selectedSchool: SpellPickerSchoolFilter
  sortMode: SpellPickerSortMode
}

export type SpellPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  choiceSet: ChoiceSet
  selectedIds: string[]
  items: readonly SpellPickerItem[]
  displayVocabulary?: SpellDisplayVocabulary
  onSelectSpell: (spellId: string) => void
  onRemoveSpell: (spellId: string) => void
}
