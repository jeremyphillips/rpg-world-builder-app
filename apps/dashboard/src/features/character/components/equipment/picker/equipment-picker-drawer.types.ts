import type {
  CharacterBuildCatalogIndex,
  CharacterBuildContext,
  CharacterBuilderDraft,
  EquipmentBudgetSummary,
  EquipmentPickerBrowseSortContext,
  EquipmentPickerItem,
  EquipmentPickerSupportedKind,
  MagicItemGrantProgress,
} from '@rpg/contracts'

import type { EquipmentPickerWorkflowMode } from '../../../lib/equipment/equipment-step.lib'
import type { EquipmentPickerCharacterPreviewContext } from './equipment-picker-character-preview.lib'
import type { EquipmentPickerRowActionViewModel } from './equipment-picker-action.lib'
import type { EquipmentPickerGrantManageSource } from './equipment-picker-grant.lib'
import {
  CATALOG_PICKER_SORT_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_NAME_ASC,
  CATALOG_PICKER_SORT_LABEL_NAME_DESC,
  CATALOG_PICKER_SORT_NAME_ASC,
  CATALOG_PICKER_SORT_NAME_DESC,
} from '../../picker/catalog-picker-sort-modes.lib'

export type {
  EquipmentBudgetSummary,
  EquipmentPickerBrowseSortContext,
  EquipmentPickerItem,
  EquipmentPickerItemState,
  EquipmentPickerSupportedKind,
} from '@rpg/contracts'

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

export const EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL = 'Cannot afford'
export const EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL = 'Not for sale'

export const EQUIPMENT_PICKER_MODE_PURCHASE = 'purchase' as const
export const EQUIPMENT_PICKER_MODE_MAGIC_ITEMS = 'magic_items' as const

export const EQUIPMENT_PICKER_MODE_LABELS: Record<EquipmentPickerWorkflowMode, string> = {
  purchase: 'Purchase',
  magic_items: 'Magic items',
}

export const EQUIPMENT_PICKER_ADD_PARTIAL_PREFIX = 'Add'

export const EQUIPMENT_PICKER_ADDED_LABEL = 'Added'
export const EQUIPMENT_PICKER_OWNED_QUANTITY_LABEL_PREFIX = 'Owned:'

export type EquipmentPickerCalloutIntent =
  | 'info'
  | 'recommended'
  | 'compatible'
  | 'warning'
  | 'blocking'

export type EquipmentPickerCalloutImportance = 'low' | 'medium' | 'high'

export type EquipmentPickerCallout = {
  label: string
  intent: EquipmentPickerCalloutIntent
  importance: EquipmentPickerCalloutImportance
}

export type EquipmentPickerCalloutContext = {
  isGoldShoppingPath?: boolean
  /**
   * When set, only callouts whose semantic status is listed are eligible.
   * Composition over rule-id filters — use to show proficiency warnings without
   * Essential/Standard acquisition badges (e.g. Quick NPC Requirements).
   */
  visibleStatuses?: readonly EquipmentPickerCalloutSemanticStatus[]
}

export type EquipmentPickerCalloutSemanticStatus =
  | 'not_proficient'
  | 'essential'
  | 'standard'
  | 'blocking'
  | 'compatibility'
  | 'info'

/** Sentinel for “all kinds” in the category filter (Radix Select rejects `''`). */
export const EQUIPMENT_PICKER_KIND_ALL = '__all__' as const

/** Sentinel for “all rarities” in the magic-items rarity filter. */
export const EQUIPMENT_PICKER_RARITY_ALL = '__all_rarities__' as const

export const EQUIPMENT_PICKER_CATEGORY_LABEL = 'Category'
export const EQUIPMENT_PICKER_RARITY_LABEL = 'Rarity'
export const EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL = 'Affordable now'
export const EQUIPMENT_PICKER_SORT_LABEL = 'Sort'
export const EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL = 'Clear filters'
export const EQUIPMENT_PICKER_RESET_VIEW_LABEL = 'Reset view'

export const EQUIPMENT_PICKER_SORT_BEST_MATCH = CATALOG_PICKER_SORT_BEST_MATCH
export const EQUIPMENT_PICKER_SORT_PRICE_ASC = 'price_asc' as const
export const EQUIPMENT_PICKER_SORT_PRICE_DESC = 'price_desc' as const
export const EQUIPMENT_PICKER_SORT_NAME_ASC = CATALOG_PICKER_SORT_NAME_ASC
export const EQUIPMENT_PICKER_SORT_NAME_DESC = CATALOG_PICKER_SORT_NAME_DESC

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
  [EQUIPMENT_PICKER_SORT_BEST_MATCH]: CATALOG_PICKER_SORT_LABEL_BEST_MATCH,
  [EQUIPMENT_PICKER_SORT_PRICE_ASC]: 'Price: Low to high',
  [EQUIPMENT_PICKER_SORT_PRICE_DESC]: 'Price: High to low',
  [EQUIPMENT_PICKER_SORT_NAME_ASC]: CATALOG_PICKER_SORT_LABEL_NAME_ASC,
  [EQUIPMENT_PICKER_SORT_NAME_DESC]: CATALOG_PICKER_SORT_LABEL_NAME_DESC,
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
  allowedKinds?: readonly EquipmentPickerSupportedKind[]
  /** Hides rows whose cost exceeds the starting (package) budget. */
  filterOutUnaffordable?: boolean
  filterOutNonProficient?: boolean
  showCharacterPreview?: boolean
  characterPreviewContext?: EquipmentPickerCharacterPreviewContext
  /** Purchased quantities for the active source mode, keyed by equipment id. */
  ownedPurchaseQuantities?: Readonly<Record<string, number>>
  /** Grant-selected quantities keyed by equipment id (magic-items workflow). */
  ownedGrantQuantities?: Readonly<Record<string, number>>
  /** Active browse workflow — purchase vs magic-item grants. */
  workflowMode?: EquipmentPickerWorkflowMode
  /** Available workflows; segmented control renders only when length is 2. */
  workflowModes?: readonly EquipmentPickerWorkflowMode[]
  onWorkflowModeChange?: (mode: EquipmentPickerWorkflowMode) => void
  /** Magic-item grant allowances for rarity chip filtering in magic-items workflow. */
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
  /** Focused allowance id — scopes magic-item browse to one rarity slot. */
  focusedAllowanceId?: string
  onFocusedAllowanceIdChange?: (allowanceId: string | undefined) => void
  /** Mutually exclusive toolbar action — default resets full view including sort. */
  toolbarResetMode?: EquipmentPickerToolbarResetMode
  /** When true, `availableInStartingOption` rows show the Standard gear badge. */
  isGoldShoppingPath?: boolean
  resolveRowActionViewModel?: (args: {
    equipment: EquipmentPickerItem['equipment']
    workflowMode: EquipmentPickerWorkflowMode
    requestedQuantity: number
  }) => EquipmentPickerRowActionViewModel
  resolveGrantManageSources?: (equipmentId: string) => EquipmentPickerGrantManageSource
  draft?: CharacterBuilderDraft
  context?: CharacterBuildContext
  catalogIndex?: CharacterBuildCatalogIndex
  onApplyMagicItemAcquisition?: (args: {
    equipmentId: string
    requestedQuantity: number
  }) => boolean
  onApplyPurchase?: (args: { equipmentId: string; requestedQuantity: number }) => void
  onReleaseGrant?: (args: { allowanceId: string; equipmentId: string; quantity: number }) => void
  onRemovePurchase?: (args: { purchaseId: string; quantity: number }) => void
  onAddItem: (item: EquipmentPickerItem, quantity: number) => void
  onAddPartialItem?: (item: EquipmentPickerItem, quantity: number) => void
  onRemoveFromInventory?: (item: EquipmentPickerItem) => void
  onRemoveOneFromInventory?: (item: EquipmentPickerItem) => void
}
