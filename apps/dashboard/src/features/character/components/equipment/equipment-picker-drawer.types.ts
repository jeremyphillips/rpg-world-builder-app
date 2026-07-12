import type {
  EquipmentBudgetSummary,
  EquipmentPickerBrowseSortContext,
  EquipmentPickerItem,
  EquipmentPickerSupportedKind,
} from '@rpg/contracts'

import type { EquipmentPickerCharacterPreviewContext } from './equipment-picker-character-preview.lib'

export type {
  EquipmentBudgetSummary,
  EquipmentPickerBrowseSortContext,
  EquipmentPickerItem,
  EquipmentPickerItemState,
  EquipmentPickerSupportedKind,
} from '@rpg/contracts'

export const EQUIPMENT_PICKER_TAB_RECOMMENDED = 'recommended'
export const EQUIPMENT_PICKER_TAB_ALL = 'all'

export const EQUIPMENT_PICKER_NOT_PROFICIENT_LABEL = 'Not proficient'

/** Sparse recommendation badges — most rows (including proficient gear) get none. */
export const EQUIPMENT_PICKER_ESSENTIAL_LABEL = 'Essential'
export const EQUIPMENT_PICKER_STARTING_OPTION_LABEL = 'Starting option'
export const EQUIPMENT_PICKER_STANDARD_GEAR_LABEL = 'Standard gear'
export const EQUIPMENT_PICKER_CLASS_TOOL_LABEL = 'Class tool'
export const EQUIPMENT_PICKER_PROFICIENT_LABEL = 'Proficient'
export const EQUIPMENT_PICKER_PROFICIENCY_AVAILABLE_LABEL = 'Proficiency available'
export const EQUIPMENT_PICKER_COMMON_FOR_CLASS_LABEL = 'Common for your class'
/** @deprecated Use {@link EQUIPMENT_PICKER_PROFICIENT_LABEL} for badge display. */
export const EQUIPMENT_PICKER_MATCHES_PROFICIENCY_LABEL = 'Matches your proficiency'
export const EQUIPMENT_PICKER_SPELLCASTING_FOCUS_LABEL = 'Spellcasting focus'

export const EQUIPMENT_PICKER_ADDED_LABEL = 'Added'
export const EQUIPMENT_PICKER_OWNED_QUANTITY_LABEL_PREFIX = 'Owned:'

export type EquipmentPickerBadge = {
  label: string
  emphasis: 'warning' | 'highlight'
}

/** Sentinel for “all kinds” in the category filter (Radix Select rejects `''`). */
export const EQUIPMENT_PICKER_KIND_ALL = '__all__' as const

export const EQUIPMENT_PICKER_CATEGORY_LABEL = 'Category'
export const EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL = 'Affordable now'
export const EQUIPMENT_PICKER_SORT_LABEL = 'Sort'
export const EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL = 'Clear filters'
export const EQUIPMENT_PICKER_RESET_VIEW_LABEL = 'Reset view'
export const EQUIPMENT_PICKER_NO_RECOMMENDATIONS_MESSAGE = 'No recommendations match this view.'

export const EQUIPMENT_PICKER_SORT_BEST_MATCH = 'best_match' as const
export const EQUIPMENT_PICKER_SORT_PRICE_ASC = 'price_asc' as const
export const EQUIPMENT_PICKER_SORT_PRICE_DESC = 'price_desc' as const
export const EQUIPMENT_PICKER_SORT_NAME_ASC = 'name_asc' as const
export const EQUIPMENT_PICKER_SORT_NAME_DESC = 'name_desc' as const

export type EquipmentPickerSortMode =
  | typeof EQUIPMENT_PICKER_SORT_BEST_MATCH
  | typeof EQUIPMENT_PICKER_SORT_PRICE_ASC
  | typeof EQUIPMENT_PICKER_SORT_PRICE_DESC
  | typeof EQUIPMENT_PICKER_SORT_NAME_ASC
  | typeof EQUIPMENT_PICKER_SORT_NAME_DESC

export const EQUIPMENT_PICKER_SORT_MODES = [
  EQUIPMENT_PICKER_SORT_BEST_MATCH,
  EQUIPMENT_PICKER_SORT_PRICE_ASC,
  EQUIPMENT_PICKER_SORT_PRICE_DESC,
  EQUIPMENT_PICKER_SORT_NAME_ASC,
  EQUIPMENT_PICKER_SORT_NAME_DESC,
] as const satisfies readonly EquipmentPickerSortMode[]

export const EQUIPMENT_PICKER_SORT_LABELS: Record<EquipmentPickerSortMode, string> = {
  [EQUIPMENT_PICKER_SORT_BEST_MATCH]: 'Best match',
  [EQUIPMENT_PICKER_SORT_PRICE_ASC]: 'Price: Low to high',
  [EQUIPMENT_PICKER_SORT_PRICE_DESC]: 'Price: High to low',
  [EQUIPMENT_PICKER_SORT_NAME_ASC]: 'Name: A–Z',
  [EQUIPMENT_PICKER_SORT_NAME_DESC]: 'Name: Z–A',
}

export type EquipmentPickerToolbarResetMode = 'clear_filters' | 'reset_view' | 'none'

export type EquipmentPickerKindFilter =
  | typeof EQUIPMENT_PICKER_KIND_ALL
  | EquipmentPickerSupportedKind

export type EquipmentPickerViewDefaults = {
  selectedKind: EquipmentPickerKindFilter
  showAffordableOnly: boolean
  sortMode: EquipmentPickerSortMode
}

export type EquipmentPickerDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: readonly EquipmentPickerItem[]
  browseSortContext?: EquipmentPickerBrowseSortContext
  budget?: EquipmentBudgetSummary
  defaultTab?: typeof EQUIPMENT_PICKER_TAB_RECOMMENDED | typeof EQUIPMENT_PICKER_TAB_ALL
  allowedKinds?: readonly EquipmentPickerSupportedKind[]
  /** Hides rows whose cost exceeds the starting (package) budget. */
  filterOutUnaffordable?: boolean
  filterOutNonProficient?: boolean
  showCharacterPreview?: boolean
  characterPreviewContext?: EquipmentPickerCharacterPreviewContext
  /** Purchased quantities for the active source mode, keyed by equipment id. */
  ownedPurchaseQuantities?: Readonly<Record<string, number>>
  /** Mutually exclusive toolbar action — default resets full view including sort and tab. */
  toolbarResetMode?: EquipmentPickerToolbarResetMode
  /** When true, `availableInStartingOption` rows show the Standard gear badge. */
  isGoldShoppingPath?: boolean
  onAddItem: (item: EquipmentPickerItem, quantity: number) => void
  onRemoveFromInventory?: (item: EquipmentPickerItem) => void
  onRemoveOneFromInventory?: (item: EquipmentPickerItem) => void
}
