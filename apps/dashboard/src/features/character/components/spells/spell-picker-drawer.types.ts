import type { ChoiceSet, SpellPickerItem } from '@rpg/contracts'

import type { SpellDisplayVocabulary } from '@/features/content'

import {
  CATALOG_PICKER_SORT_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_NAME_ASC,
  CATALOG_PICKER_SORT_LABEL_NAME_DESC,
  CATALOG_PICKER_SORT_NAME_ASC,
  CATALOG_PICKER_SORT_NAME_DESC,
} from '../picker/catalog-picker-sort-modes.lib'

export type { ChoiceSet, SpellPickerItem, SpellPickerItemState } from '@rpg/contracts'

export const SPELL_PICKER_MODE_CANTRIPS = 'cantrips' as const
export const SPELL_PICKER_MODE_PREPARED_SPELLS = 'prepared-spells' as const

export type SpellPickerMode =
  | typeof SPELL_PICKER_MODE_CANTRIPS
  | typeof SPELL_PICKER_MODE_PREPARED_SPELLS

export const SPELL_PICKER_NO_RESULTS_MESSAGE = 'No spells match your search.'
export const SPELL_PICKER_NO_OPTIONS_MESSAGE = 'No spells are available for this choice.'
export const SPELL_PICKER_SELECTION_FULL_MESSAGE =
  'You have selected the maximum number of spells for this choice.'

export const SPELL_PICKER_SCHOOL_ALL = '__all__' as const
export const SPELL_PICKER_LEVELS_ALL = '__all__' as const

export const SPELL_PICKER_LEVELS_LABEL = 'Levels'
export const SPELL_PICKER_SCHOOL_LABEL = 'School'
export const SPELL_PICKER_SORT_LABEL = 'Sort'
export const SPELL_PICKER_MECHANICS_LABEL = 'Casting & mechanics'
export const SPELL_PICKER_RESET_VIEW_LABEL = 'Reset view'

export const SPELL_PICKER_SORT_BEST_MATCH = CATALOG_PICKER_SORT_BEST_MATCH
export const SPELL_PICKER_SORT_NAME_ASC = CATALOG_PICKER_SORT_NAME_ASC
export const SPELL_PICKER_SORT_NAME_DESC = CATALOG_PICKER_SORT_NAME_DESC
export const SPELL_PICKER_SORT_LEVEL_ASC = 'level_asc' as const
export const SPELL_PICKER_SORT_LEVEL_DESC = 'level_desc' as const

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
  [SPELL_PICKER_SORT_BEST_MATCH]: CATALOG_PICKER_SORT_LABEL_BEST_MATCH,
  [SPELL_PICKER_SORT_NAME_ASC]: CATALOG_PICKER_SORT_LABEL_NAME_ASC,
  [SPELL_PICKER_SORT_NAME_DESC]: CATALOG_PICKER_SORT_LABEL_NAME_DESC,
  [SPELL_PICKER_SORT_LEVEL_ASC]: 'Level: low to high',
  [SPELL_PICKER_SORT_LEVEL_DESC]: 'Level: high to low',
}

export type SpellPickerSchoolFilter = typeof SPELL_PICKER_SCHOOL_ALL | string

export type SpellPickerCastingTimeFilter =
  | 'action'
  | 'bonus-action'
  | 'reaction'
  | '1-minute'
  | '10-minutes'
  | '1-hour'

export type SpellPickerTraitFilter = 'concentration' | 'ritual'

export type SpellPickerMethodFilter = 'ranged-spell-attack' | 'melee-spell-attack'

export type SpellPickerMechanicsFilters = {
  castingTimes: SpellPickerCastingTimeFilter[]
  traits: SpellPickerTraitFilter[]
  methods: SpellPickerMethodFilter[]
}

export type SpellPickerBrowseState = {
  searchQuery: string
  activeTabId: string
  selectedLevels: number[]
  selectedSchool: SpellPickerSchoolFilter
  mechanicsFilters: SpellPickerMechanicsFilters
  sortMode: SpellPickerSortMode
}

export type SpellPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  className: string
  cantripChoiceSet?: ChoiceSet
  preparedChoiceSet?: ChoiceSet
  cantripSelectedIds: string[]
  preparedSelectedIds: string[]
  cantripItems: readonly SpellPickerItem[]
  preparedItems: readonly SpellPickerItem[]
  initialMode?: SpellPickerMode
  recommendationsEnabled?: boolean
  displayVocabulary?: SpellDisplayVocabulary
  onSelectSpell: (mode: SpellPickerMode, spellId: string) => void
  onRemoveSpell: (mode: SpellPickerMode, spellId: string) => void
}
