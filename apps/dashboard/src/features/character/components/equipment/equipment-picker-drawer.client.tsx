'use client'

import * as React from 'react'
import { CircleAlert, RotateCcw } from 'lucide-react'

import {
  Badge,
  Button,
  CatalogPickerSheet,
  Checkbox,
  EmphasisDetailLine,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Text,
  cn,
  type CatalogPickerSheetFilterContext,
} from '@rpg/ui'
import {
  formatMoney,
  formatWealthAsGold,
  getEquipmentKindLabel,
  isEquipmentPickerSupportedKind,
  isEquipmentStackable,
  type EquipmentPickerSupportedKind,
} from '@rpg/contracts'

import { buildEquipmentPickerHeaderViewModel } from '@/features/content'

import {
  countEquipmentPickerClearableCriteria,
  countEquipmentPickerStructuredFilters,
  filterEquipmentPickerItems,
  getEquipmentPickerBadge,
  getEquipmentUnaffordableAmounts,
  getEquipmentPickerItemTab,
  hasEquipmentPickerClearableCriteria,
  isEquipmentPickerItemDisabled,
  resolveEquipmentKindFilterOptions,
  sortEquipmentPickerItems,
} from './equipment-picker-drawer.lib'
import {
  EQUIPMENT_PICKER_ADDED_LABEL,
  EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL,
  EQUIPMENT_PICKER_CATEGORY_LABEL,
  EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL,
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_NO_RECOMMENDATIONS_MESSAGE,
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
  type EquipmentPickerKindFilter,
} from './equipment-picker-drawer.types'
import { EquipmentBudgetHeader } from './equipment-budget-header.client'
import { EquipmentPickerItemDetails } from './equipment-picker-item-details.client'
import {
  equipmentPickerAffordableFilterClasses,
  equipmentPickerAffordableLabelClasses,
  equipmentPickerDisabledRowClasses,
  equipmentPickerHeaderDividerClasses,
  equipmentPickerHeaderKindClasses,
  equipmentPickerHeaderTextClasses,
  equipmentPickerHeaderTitleClasses,
  equipmentPickerCategoryFilterClasses,
  equipmentPickerCategoryLabelClasses,
  equipmentPickerFiltersMainClasses,
  equipmentPickerFiltersRowClasses,
  equipmentPickerHighlightBadgeClasses,
  equipmentPickerWarningBadgeClasses,
  EQUIPMENT_PICKER_HEADER_DIVIDER,
} from './equipment-picker-drawer.variants'

export type { EquipmentPickerDrawerProps } from './equipment-picker-drawer.types'

function EquipmentPickerFilters({
  kinds,
  selectedKind,
  onSelectedKindChange,
  showAffordableOnly,
  onShowAffordableOnlyChange,
  showAffordableFilter,
  filterContext,
  onClearFilters,
  clearableCriteriaCount,
}: {
  kinds: EquipmentPickerSupportedKind[]
  selectedKind: EquipmentPickerKindFilter
  onSelectedKindChange: (kind: EquipmentPickerKindFilter) => void
  showAffordableOnly: boolean
  onShowAffordableOnlyChange: (checked: boolean) => void
  showAffordableFilter: boolean
  filterContext: CatalogPickerSheetFilterContext
  onClearFilters: () => void
  clearableCriteriaCount: number
}) {
  const showCategoryFilter = kinds.length > 1
  const hasClearableCriteria = hasEquipmentPickerClearableCriteria(clearableCriteriaCount)

  if (!showCategoryFilter && !showAffordableFilter && !hasClearableCriteria) {
    return null
  }

  const handleClear = () => {
    filterContext.clearSearchQuery()
    onClearFilters()
  }

  return (
    <div className={equipmentPickerFiltersRowClasses}>
      <div className={equipmentPickerFiltersMainClasses}>
        {showCategoryFilter ? (
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
        ) : null}

        {showAffordableFilter ? (
          <div className={equipmentPickerAffordableFilterClasses}>
            <Checkbox
              id="equipment-picker-affordable-now"
              checked={showAffordableOnly}
              onCheckedChange={(checked) => onShowAffordableOnlyChange(checked === true)}
            />
            <Text
              as="label"
              htmlFor="equipment-picker-affordable-now"
              className={equipmentPickerAffordableLabelClasses}
            >
              {EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL}
            </Text>
          </div>
        ) : null}
      </div>

      {hasClearableCriteria ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="ml-auto text-xs"
          onClick={handleClear}
        >
          <RotateCcw aria-hidden />
          {clearableCriteriaCount > 2
            ? `${EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL} (${clearableCriteriaCount})`
            : EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL}
        </Button>
      ) : null}
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
  const amounts = getEquipmentUnaffordableAmounts(item, budget)
  if (!amounts) return null

  const need = formatMoney(amounts.required)
  const have = formatWealthAsGold(amounts.remaining)

  return (
    <Text as="p" variant="warning" className="flex items-start gap-1.5 text-xs">
      <CircleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      <EmphasisDetailLine
        primary={`${need} needed`}
        secondary={`${have} remaining`}
        secondaryTone="subtle"
      />
    </Text>
  )
}

/** Equipment catalog drawer — thin wrapper over `CatalogPickerSheet`. */
export function EquipmentPickerDrawer({
  open,
  onOpenChange,
  items,
  browseSortContext,
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
  const [showAffordableOnly, setShowAffordableOnly] = React.useState(false)
  const [addQuantities, setAddQuantities] = React.useState<Record<string, number>>({})

  // Browse context (category, affordable toggle) preserved across close/reopen.
  // Reset only via explicit Clear filters or a future context-key change.
  React.useEffect(() => {
    if (!open) {
      setAddQuantities({})
    }
  }, [open])

  React.useEffect(() => {
    setSelectedKind((current) => {
      if (current === EQUIPMENT_PICKER_KIND_ALL) return current
      return kindOptions.includes(current) ? current : EQUIPMENT_PICKER_KIND_ALL
    })
  }, [kindOptions])

  const structuredFilterCount = countEquipmentPickerStructuredFilters({
    selectedKind,
    showAffordableOnly,
  })

  const visibleItems = React.useMemo(
    () =>
      sortEquipmentPickerItems(
        filterEquipmentPickerItems(supportedItems, {
          filterOutUnaffordable,
          filterOutNonProficient,
          selectedKind,
          showAffordableOnly,
        }),
        browseSortContext,
      ),
    [
      browseSortContext,
      filterOutNonProficient,
      filterOutUnaffordable,
      showAffordableOnly,
      supportedItems,
      selectedKind,
    ],
  )

  const handleSelectedKindChange = React.useCallback((kind: EquipmentPickerKindFilter) => {
    setSelectedKind(kind)
  }, [])

  const handleClearStructuredFilters = React.useCallback(() => {
    setSelectedKind(EQUIPMENT_PICKER_KIND_ALL)
    setShowAffordableOnly(false)
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
      noScopedItemsMessage={EQUIPMENT_PICKER_NO_RECOMMENDATIONS_MESSAGE}
      hasStructuredFilters={structuredFilterCount > 0}
      headerExtra={budget ? <EquipmentBudgetHeader budget={budget} /> : undefined}
      filters={(filterContext) => {
        const clearableCriteriaCount = countEquipmentPickerClearableCriteria({
          selectedKind,
          showAffordableOnly,
          searchQuery: filterContext.searchQuery,
        })

        return (
          <EquipmentPickerFilters
            kinds={kindOptions}
            selectedKind={selectedKind}
            onSelectedKindChange={handleSelectedKindChange}
            showAffordableOnly={showAffordableOnly}
            onShowAffordableOnlyChange={setShowAffordableOnly}
            showAffordableFilter={Boolean(budget)}
            filterContext={filterContext}
            onClearFilters={handleClearStructuredFilters}
            clearableCriteriaCount={clearableCriteriaCount}
          />
        )
      }}
      renderItemHeader={(item) => {
        const header = buildEquipmentPickerHeaderViewModel(item.equipment)
        const badge = getEquipmentPickerBadge(item)
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
            {badge ? (
              <Badge
                size="sm"
                variant="outline"
                className={
                  badge.emphasis === 'warning'
                    ? equipmentPickerWarningBadgeClasses
                    : equipmentPickerHighlightBadgeClasses
                }
              >
                {badge.label}
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
