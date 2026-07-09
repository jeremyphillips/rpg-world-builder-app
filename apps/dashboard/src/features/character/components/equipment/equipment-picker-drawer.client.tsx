'use client'

import * as React from 'react'

import { Badge, Button, CatalogPickerSheet, Text, cn } from '@rpg/ui'
import { getEquipmentKindLabel, isEquipmentStackable, type EquipmentKind } from '@rpg/contracts'

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
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
} from './equipment-picker-drawer.types'
import { EquipmentBudgetHeader } from './equipment-budget-header.client'
import { EquipmentPickerItemDetails } from './equipment-picker-item-details.client'
import {
  equipmentPickerDisabledRowClasses,
  equipmentPickerKindChipActiveClasses,
  equipmentPickerKindChipInactiveClasses,
  equipmentPickerKindFiltersClasses,
  equipmentPickerWarningBadgeClasses,
} from './equipment-picker-drawer.variants'

export type { EquipmentPickerDrawerProps } from './equipment-picker-drawer.types'

function EquipmentKindFilters({
  kinds,
  selectedKinds,
  onToggleKind,
}: {
  kinds: EquipmentKind[]
  selectedKinds: readonly EquipmentKind[]
  onToggleKind: (kind: EquipmentKind) => void
}) {
  if (kinds.length <= 1) return null

  return (
    <div className={equipmentPickerKindFiltersClasses} role="group" aria-label="Filter by kind">
      {kinds.map((kind) => {
        const active = selectedKinds.includes(kind)
        return (
          <button
            key={kind}
            type="button"
            aria-pressed={active}
            className={
              active ? equipmentPickerKindChipActiveClasses : equipmentPickerKindChipInactiveClasses
            }
            onClick={() => onToggleKind(kind)}
          >
            {getEquipmentKindLabel(kind)}
          </button>
        )
      })}
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
  const badgeLabel = getEquipmentPickerBadgeLabel(item)
  const disabledNote = getEquipmentPickerDisabledNote(item, budget)

  if (!badgeLabel && !disabledNote) return null

  return (
    <div className="space-y-1">
      {badgeLabel ? (
        <Badge variant="outline" className={equipmentPickerWarningBadgeClasses}>
          {badgeLabel}
        </Badge>
      ) : null}
      {disabledNote ? (
        <Text as="p" variant="muted" className="text-xs">
          {disabledNote}
        </Text>
      ) : null}
    </div>
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
  const kindOptions = React.useMemo(
    () => resolveEquipmentKindFilterOptions(items, allowedKinds),
    [allowedKinds, items],
  )
  const [selectedKinds, setSelectedKinds] = React.useState(kindOptions)
  const [addQuantities, setAddQuantities] = React.useState<Record<string, number>>({})

  React.useEffect(() => {
    if (!open) {
      setAddQuantities({})
      setSelectedKinds(kindOptions)
    }
  }, [kindOptions, open])

  React.useEffect(() => {
    setSelectedKinds((current) => {
      const next = current.filter((kind) => kindOptions.includes(kind))
      return next.length > 0 ? next : kindOptions
    })
  }, [kindOptions])

  const visibleItems = React.useMemo(
    () =>
      filterEquipmentPickerItems(items, {
        filterOutUnaffordable,
        filterOutNonProficient,
        selectedKinds,
      }),
    [filterOutNonProficient, filterOutUnaffordable, items, selectedKinds],
  )

  const handleToggleKind = React.useCallback(
    (kind: EquipmentKind) => {
      setSelectedKinds((current) => {
        if (current.includes(kind)) {
          const next = current.filter((entry) => entry !== kind)
          return next.length > 0 ? next : kindOptions
        }
        return [...current, kind]
      })
    },
    [kindOptions],
  )

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
        <EquipmentKindFilters
          kinds={kindOptions}
          selectedKinds={selectedKinds}
          onToggleKind={handleToggleKind}
        />
      }
      renderItemHeader={(item) => {
        const header = buildEquipmentPickerHeaderViewModel(item.equipment)
        const disabled = isEquipmentPickerItemDisabled(item)

        return (
          <div
            className={cn(
              'min-w-0 space-y-1',
              disabled ? equipmentPickerDisabledRowClasses : undefined,
            )}
          >
            <span className="truncate text-sm font-medium">{header.title}</span>
            <EquipmentPickerRowSummary item={item} budget={budget} />
          </div>
        )
      }}
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
