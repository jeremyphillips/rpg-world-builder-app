import {
  catalogNounFromContentType,
  formatCatalogPickerCopy,
  type EquipmentBudgetSummary,
  type EquipmentPickerBrowseSortContext,
  type EquipmentPickerItem,
  type EquipmentPickerSupportedKind,
  type MagicItemAllowance,
  type MagicItemGrantProgress,
} from '@rpg/contracts'

import type { EquipmentPickerWorkflowMode } from '../../../../lib/equipment/equipment-step.lib'
import type { EquipmentPickerRow } from '../../../../lib/equipment/equipment-picker-search.lib'
import type { EquipmentPickerOwnershipIndex } from '../../../../lib/equipment/equipment-ownership-index.lib'
import type { EquipmentPickerCharacterPreviewContext } from '../details/equipment-picker-character-preview.lib'
import type { EquipmentPickerRowActionViewModel } from '../equipment-picker-action.lib'
import {
  CATALOG_PICKER_SORT_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_BEST_MATCH,
  CATALOG_PICKER_SORT_LABEL_NAME_ASC,
  CATALOG_PICKER_SORT_LABEL_NAME_DESC,
  CATALOG_PICKER_SORT_NAME_ASC,
  CATALOG_PICKER_SORT_NAME_DESC,
} from '../../../picker/sort/catalog-picker-sort-modes.lib'

export type {
  EquipmentBudgetSummary,
  EquipmentPickerBrowseSortContext,
  EquipmentPickerItem,
  EquipmentPickerItemState,
  EquipmentPickerSupportedKind,
} from '@rpg/contracts'

export type { EquipmentPickerRow } from '../../../../lib/equipment/equipment-picker-search.lib'

const equipmentNoun = catalogNounFromContentType('equipment')
const equipmentCopy = formatCatalogPickerCopy(equipmentNoun)

export const EQUIPMENT_PICKER_CANNOT_AFFORD_LABEL = 'Cannot afford'
export const EQUIPMENT_PICKER_EXCEEDS_STARTING_BUDGET_LABEL = 'Exceeds starting budget'
export const EQUIPMENT_PICKER_NOT_PURCHASABLE_LABEL = 'Not for sale'
export const EQUIPMENT_PICKER_UNAVAILABLE_HERE_LABEL = 'Unavailable here'

export const EQUIPMENT_PICKER_SORT_GROUP_LABEL = equipmentCopy.sortGroupLabel
export const EQUIPMENT_PICKER_SORT_ORDER_LABEL = equipmentCopy.sortOrderLabel

export const EQUIPMENT_PICKER_MODE_MAGIC_ITEMS = 'magic_items' as const

/** Sentinel for “all kinds” in the category filter (Radix Select rejects `''`). */
export const EQUIPMENT_PICKER_KIND_ALL = '__all__' as const

/** Sentinel for “all rarities” in the magic-items rarity filter. */
export const EQUIPMENT_PICKER_RARITY_ALL = '__all_rarities__' as const

export const EQUIPMENT_PICKER_CATEGORY_LABEL = 'Equipment kind'
export const EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL = 'Affordable now'
export const EQUIPMENT_PICKER_SORT_LABEL = 'Sort'

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
  items: readonly EquipmentPickerRow[]
  browseSortContext?: EquipmentPickerBrowseSortContext
  budget?: EquipmentBudgetSummary
  allowedKinds?: readonly EquipmentPickerSupportedKind[]
  /** Hides rows whose cost exceeds the starting (package) budget. */
  filterOutUnaffordable?: boolean
  filterOutNonProficient?: boolean
  showCharacterPreview?: boolean
  characterPreviewContext?: EquipmentPickerCharacterPreviewContext
  /** Per-item ownership contributions — the only source the header reads. */
  ownership?: EquipmentPickerOwnershipIndex
  /** Active browse workflow — purchase vs magic-item grants. */
  workflowMode?: EquipmentPickerWorkflowMode
  /** Available workflows; segmented control renders only when length is 2. */
  workflowModes?: readonly EquipmentPickerWorkflowMode[]
  onWorkflowModeChange?: (mode: EquipmentPickerWorkflowMode) => void
  /** Grant progress for rarity chips. Paired with allowances for the magic-item summary. */
  magicItemGrantProgress?: readonly MagicItemGrantProgress[]
  /** Allowances paired with progress so slot badges keep exact vs up-to. */
  magicItemAllowances?: readonly MagicItemAllowance[]
  /** Focused allowance id — scopes magic-item browse to one rarity slot. */
  focusedAllowanceId?: string
  onFocusedAllowanceIdChange?: (allowanceId: string | undefined) => void
  /** When true, rows in another starting package show `Included in package option`. */
  isGoldShoppingPath?: boolean
  resolveRowActionViewModel?: (args: {
    equipment: EquipmentPickerItem['equipment']
    workflowMode: EquipmentPickerWorkflowMode
    requestedQuantity: number
  }) => EquipmentPickerRowActionViewModel
  /** Adds one copy through the active workflow's channel. */
  onCommitAdd: (item: EquipmentPickerItem) => boolean | void
  /** Sets the aggregate editable purchased quantity for an item. */
  onSetPurchasedQuantity?: (item: EquipmentPickerItem, total: number) => void
  onReleaseChoice?: (item: EquipmentPickerItem, allowanceId: string) => void
  onRemovePurchaseOne?: (item: EquipmentPickerItem) => void
}
