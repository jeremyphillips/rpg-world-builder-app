'use client'

import * as React from 'react'

import {
  Badge,
  Button,
  CatalogPickerSheet,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  cn,
} from '@rpg/ui'
import {
  getEquipmentKindLabel,
  isEquipmentPickerSupportedKind,
  isEquipmentStackable,
  type EquipmentPickerSupportedKind,
} from '@rpg/contracts'

import { buildEquipmentPickerHeaderViewModel } from '@/features/content'

import {
  filterEquipmentPickerItems,
  getEquipmentPickerBadgeLabel,
  getEquipmentPickerDisabledNote,
  getEquipmentPickerItemTab,
  isEquipmentPickerItemDisabled,
  resolveEquipmentKindFilterOptions,
} from './equipment-picker-drawer.lib'
import {
  EQUIPMENT_PICKER_ADDED_LABEL,
  EQUIPMENT_PICKER_CATEGORY_LABEL,
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
  type EquipmentPickerKindFilter,
} from './equipment-picker-drawer.types'
import { EquipmentBudgetHeader } from './equipment-budget-header.client'
import { EquipmentPickerItemDetails } from './equipment-picker-item-details.client'
import {
  equipmentPickerDisabledRowClasses,
  equipmentPickerHeaderDividerClasses,
  equipmentPickerHeaderKindClasses,
  equipmentPickerHeaderTextClasses,
  equipmentPickerHeaderTitleClasses,
  equipmentPickerCategoryFilterClasses,
  equipmentPickerCategoryLabelClasses,
  equipmentPickerWarningBadgeClasses,
  EQUIPMENT_PICKER_HEADER_DIVIDER,
} from './equipment-picker-drawer.variants'

export type { EquipmentPickerDrawerProps } from './equipment-picker-drawer.types'

function EquipmentCategoryFilter({
  kinds,
  selectedKind,
  onSelectedKindChange,
}: {
  kinds: EquipmentPickerSupportedKind[]
  selectedKind: EquipmentPickerKindFilter
  onSelectedKindChange: (kind: EquipmentPickerKindFilter) => void
}) {
  if (kinds.length <= 1) return null

  return (
    <div
      className={equipmentPickerCategoryFilterClasses}
      role="group"
      aria-label="Filter by category"
    >
      <Text as="span" className={equipmentPickerCategoryLabelClasses}>
        {EQUIPMENT_PICKER_CATEGORY_LABEL}
      </Text>
      <Select value={selectedKind} onValueChange={onSelectedKindChange}>
        <SelectTrigger size="sm" aria-label="Equipment category">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EQUIPMENT_PICKER_KIND_ALL}>All</SelectItem>
          {kinds.map((kind) => (
            <SelectItem key={kind} value={kind}>
              {getEquipmentKindLabel(kind)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function EquipmentPickerRowSummary({
  item,
  budget,
}: {
  item: EquipmentPickerItem
  budget?: EquipmentPickerDrawerProps['budget']
}) {
  const disabledNote = getEquipmentPickerDisabledNote(item, budget)

  if (!disabledNote) return null

  return (
    <Text as="p" variant="muted" className="text-xs">
      {disabledNote}
    </Text>
  )
}

/** Equipment catalog drawer — thin wrapper over `CatalogPickerSheet`. */
export function EquipmentPickerDrawer({
  open,
  onOpenChange,
  items,
  budget,
  defaultTab = EQUIPMENT_PICKER_TAB_RECOMMENDED,
  allowedKinds,
  filterOutUnaffordable = true,
  filterOutNonProficient = false,
  showCharacterPreview = false,
  characterPreviewContext,
  ownedPurchaseQuantities = {},
  onAddItem,
}: EquipmentPickerDrawerProps) {
  const supportedItems = React.useMemo(
    () => items.filter((item) => isEquipmentPickerSupportedKind(item.equipment.kind)),
    [items],
  )
  const kindOptions = React.useMemo(
    () => resolveEquipmentKindFilterOptions(supportedItems, allowedKinds),
    [allowedKinds, supportedItems],
  )
  const [selectedKind, setSelectedKind] =
    React.useState<EquipmentPickerKindFilter>(EQUIPMENT_PICKER_KIND_ALL)
  const [addQuantities, setAddQuantities] = React.useState<Record<string, number>>({})

  React.useEffect(() => {
    if (!open) {
      setAddQuantities({})
      setSelectedKind(EQUIPMENT_PICKER_KIND_ALL)
    }
  }, [open])

  React.useEffect(() => {
    setSelectedKind((current) => {
      if (current === EQUIPMENT_PICKER_KIND_ALL) return current
      return kindOptions.includes(current) ? current : EQUIPMENT_PICKER_KIND_ALL
    })
  }, [kindOptions])

  const visibleItems = React.useMemo(
    () =>
      filterEquipmentPickerItems(supportedItems, {
        filterOutUnaffordable,
        filterOutNonProficient,
        selectedKind,
      }),
    [filterOutNonProficient, filterOutUnaffordable, supportedItems, selectedKind],
  )

  const handleSelectedKindChange = React.useCallback((kind: EquipmentPickerKindFilter) => {
    setSelectedKind(kind)
  }, [])

  const handleQuickAdd = React.useCallback(
    (item: EquipmentPickerItem) => {
      onAddItem(item, 1)
    },
    [onAddItem],
  )

  const handleCommitAdd = React.useCallback(
    (item: EquipmentPickerItem) => {
      const itemKey = item.equipment.id
      const quantity = addQuantities[itemKey] ?? 1
      onAddItem(item, quantity)
      if (isEquipmentStackable(item.equipment)) {
        setAddQuantities((current) => ({ ...current, [itemKey]: 1 }))
      }
    },
    [addQuantities, onAddItem],
  )

  const handleAddQuantityChange = React.useCallback((itemKey: string, quantity: number) => {
    setAddQuantities((current) => ({ ...current, [itemKey]: quantity }))
  }, [])

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add equipment"
      description="Search the catalog and add items to your loadout."
      items={visibleItems}
      getItemKey={(item) => item.equipment.id}
      getItemToolbarLabel={(item) => item.equipment.name}
      getSearchText={(item) => item.searchText}
      getItemTab={getEquipmentPickerItemTab}
      defaultTabId={defaultTab}
      tabs={[
        { id: EQUIPMENT_PICKER_TAB_RECOMMENDED, label: 'Recommended' },
        { id: EQUIPMENT_PICKER_TAB_ALL, label: 'All' },
      ]}
      headerExtra={budget ? <EquipmentBudgetHeader budget={budget} /> : undefined}
      filters={
        <EquipmentCategoryFilter
          kinds={kindOptions}
          selectedKind={selectedKind}
          onSelectedKindChange={handleSelectedKindChange}
        />
      }
      renderItemHeader={(item) => {
        const header = buildEquipmentPickerHeaderViewModel(item.equipment)
        const badgeLabel = getEquipmentPickerBadgeLabel(item)
        const disabled = isEquipmentPickerItemDisabled(item)

        return (
          <span
            className={cn(
              equipmentPickerHeaderTitleClasses,
              disabled ? equipmentPickerDisabledRowClasses : undefined,
            )}
          >
            <span className={equipmentPickerHeaderTextClasses}>
              <span>{header.name}</span>
              <span className={equipmentPickerHeaderDividerClasses} aria-hidden>
                {EQUIPMENT_PICKER_HEADER_DIVIDER}
              </span>
              <span className={equipmentPickerHeaderKindClasses}>{header.kindLabel}</span>
            </span>
            {badgeLabel ? (
              <Badge size="sm" variant="outline" className={equipmentPickerWarningBadgeClasses}>
                {badgeLabel}
              </Badge>
            ) : null}
          </span>
        )
      }}
      renderItemSummary={(item) => <EquipmentPickerRowSummary item={item} budget={budget} />}
      renderItemActions={(item) => {
        const header = buildEquipmentPickerHeaderViewModel(item.equipment)
        const owned = (ownedPurchaseQuantities[item.equipment.id] ?? 0) > 0
        const disabled = isEquipmentPickerItemDisabled(item)

        return (
          <div className="flex items-center gap-2">
            <Text as="span" variant="muted" className="shrink-0 tabular-nums">
              {header.priceLabel}
            </Text>
            {owned ? (
              <Text as="span" variant="muted">
                {EQUIPMENT_PICKER_ADDED_LABEL}
              </Text>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                onClick={() => handleQuickAdd(item)}
              >
                Add
              </Button>
            )}
          </div>
        )
      }}
      renderItemDetails={(item) => (
        <EquipmentPickerItemDetails
          equipment={item.equipment}
          itemState={item.state}
          budget={budget}
          ownedQuantity={ownedPurchaseQuantities[item.equipment.id] ?? 0}
          addQuantity={addQuantities[item.equipment.id] ?? 1}
          onAddQuantityChange={(quantity) => handleAddQuantityChange(item.equipment.id, quantity)}
          onCommit={() => handleCommitAdd(item)}
          showCharacterPreview={showCharacterPreview}
          characterPreviewContext={characterPreviewContext}
        />
      )}
    />
  )
}
