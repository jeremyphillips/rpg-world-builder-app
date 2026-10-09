import {
  catalogNounFromContentType,
  formatCatalogPickerCopy,
  getSpellCollectionKindLabel,
  type ChoiceSet,
  type SpellPickerItem,
} from '@rpg/contracts'
import type { SearchDocument } from '@rpg/search'

import type { SpellDisplayVocabulary } from '@/features/content'

import {
  CATALOG_PICKER_SORT_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_NAME_ASC,
  CATALOG_PICKER_SORT_LABEL_NAME_DESC,
  CATALOG_PICKER_SORT_NAME_ASC,
  CATALOG_PICKER_SORT_NAME_DESC,
} from '../../picker/sort/catalog-picker-sort-modes.lib'

export type { ChoiceSet, SpellPickerItem, SpellPickerItemState } from '@rpg/contracts'

/** Resolver row plus the dashboard-assembled search document. The document is required. */
export type SpellPickerRow = SpellPickerItem & { searchDocument: SearchDocument }

export const SPELL_PICKER_MODE_CANTRIPS = 'cantrips' as const
export const SPELL_PICKER_MODE_SPELLS = 'spells' as const

export type SpellPickerMode = typeof SPELL_PICKER_MODE_CANTRIPS | typeof SPELL_PICKER_MODE_SPELLS

const spellNoun = catalogNounFromContentType('spells')
const spellCopy = formatCatalogPickerCopy(spellNoun)

export const SPELL_PICKER_CANTRIPS_LABEL = getSpellCollectionKindLabel('cantrips')
export const SPELL_PICKER_SEARCH_PLACEHOLDER = spellCopy.searchPlaceholder
export const SPELL_PICKER_SORT_GROUP_LABEL = spellCopy.sortGroupLabel
export const SPELL_PICKER_SORT_ORDER_LABEL = spellCopy.sortOrderLabel

export const SPELL_PICKER_NO_RESULTS_MESSAGE = spellCopy.noResultsMessage
export const SPELL_PICKER_NO_OPTIONS_MESSAGE = spellCopy.noOptionsMessage
export const SPELL_PICKER_SELECTION_FULL_MESSAGE = spellCopy.selectionFullMessage

export const SPELL_PICKER_SCHOOL_ALL = '__all__' as const
export const SPELL_PICKER_LEVELS_ALL = '__all__' as const

export const SPELL_PICKER_MECHANICS_LABEL = 'Casting & mechanics'
export const SPELL_PICKER_MECHANICS_FILTER_TRIGGER_ARIA_LABEL = `${SPELL_PICKER_MECHANICS_LABEL} filters`

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
  characterClassName: string
  cantripChoiceSet?: ChoiceSet
  spellChoiceSet?: ChoiceSet
  cantripSelectedIds: string[]
  spellSelectedIds: string[]
  cantripItems: readonly SpellPickerRow[]
  spellItems: readonly SpellPickerRow[]
  initialMode?: SpellPickerMode
  /** Pre-filter prepared-spell browse to a single spell level when opened from a level tab. */
  initialSpellLevel?: number
  recommendationsEnabled?: boolean
  displayVocabulary?: SpellDisplayVocabulary
  onSelectSpell: (mode: SpellPickerMode, spellId: string) => void
  onRemoveSpell: (mode: SpellPickerMode, spellId: string) => void
}
