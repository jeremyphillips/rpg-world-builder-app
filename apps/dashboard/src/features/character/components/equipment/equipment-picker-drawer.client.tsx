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
  type CatalogPickerSheetToolbarContext,
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
  EQUIPMENT_PICKER_VIEW_DEFAULTS,
  filterAndSortEquipmentPickerItems,
  filterEquipmentPickerItems,
  getEquipmentPickerBadge,
  getEquipmentUnaffordableAmounts,
  getEquipmentPickerItemTab,
  hasEquipmentPickerClearableCriteria,
  hasEquipmentPickerResetViewCriteria,
  isEquipmentPickerItemDisabled,
  resolveEquipmentKindFilterOptions,
} from './equipment-picker-drawer.lib'
import {
  EQUIPMENT_PICKER_ADDED_LABEL,
  EQUIPMENT_PICKER_AFFORDABLE_NOW_LABEL,
  EQUIPMENT_PICKER_CATEGORY_LABEL,
  EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL,
  EQUIPMENT_PICKER_KIND_ALL,
  EQUIPMENT_PICKER_NO_RECOMMENDATIONS_MESSAGE,
  EQUIPMENT_PICKER_RESET_VIEW_LABEL,
  EQUIPMENT_PICKER_SORT_LABEL,
  EQUIPMENT_PICKER_SORT_LABELS,
  EQUIPMENT_PICKER_SORT_MODES,
  EQUIPMENT_PICKER_TAB_ALL,
  EQUIPMENT_PICKER_TAB_RECOMMENDED,
  type EquipmentPickerDrawerProps,
  type EquipmentPickerItem,
  type EquipmentPickerKindFilter,
  type EquipmentPickerSortMode,
  type EquipmentPickerToolbarResetMode,
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
  equipmentPickerSortActionsGroupClasses,
  equipmentPickerSortFilterClasses,
  equipmentPickerSortLabelClasses,
  equipmentPickerWarningBadgeClasses,
  EQUIPMENT_PICKER_HEADER_DIVIDER,
} from './equipment-picker-drawer.variants'

export type { EquipmentPickerDrawerProps } from './equipment-picker-drawer.types'

function EquipmentPickerToolbarControls({
  kinds,
  selectedKind,
  onSelectedKindChange,
  showAffordableOnly,
  onShowAffordableOnlyChange,
  showAffordableFilter,
  sortMode,
  onSortModeChange,
  toolbarContext,
  toolbarResetMode,
  defaultTabId,
  onClearStructuredFilters,
  onResetView,
}: {
  kinds: EquipmentPickerSupportedKind[]
  selectedKind: EquipmentPickerKindFilter
  onSelectedKindChange: (kind: EquipmentPickerKindFilter) => void
  showAffordableOnly: boolean
  onShowAffordableOnlyChange: (checked: boolean) => void
  showAffordableFilter: boolean
  sortMode: EquipmentPickerSortMode
  onSortModeChange: (mode: EquipmentPickerSortMode) => void
  toolbarContext: CatalogPickerSheetToolbarContext
  toolbarResetMode: EquipmentPickerToolbarResetMode
  defaultTabId: string
  onClearStructuredFilters: () => void
  onResetView: () => void
}) {
  const showCategoryFilter = kinds.length > 1
  const clearableCriteriaCount = countEquipmentPickerClearableCriteria({
    selectedKind,
    showAffordableOnly,
    searchQuery: toolbarContext.searchQuery,
  })
  const showClearFilters =
    toolbarResetMode === 'clear_filters' &&
    hasEquipmentPickerClearableCriteria(clearableCriteriaCount)
  const showResetView =
    toolbarResetMode === 'reset_view' &&
    hasEquipmentPickerResetViewCriteria({
      selectedKind,
      showAffordableOnly,
      searchQuery: toolbarContext.searchQuery,
      sortMode,
      activeTabId: toolbarContext.activeTabId,
      defaultTabId,
    })

  const handleClearFilters = () => {
    toolbarContext.clearSearchQuery()
    onClearStructuredFilters()
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

      <div className={equipmentPickerSortActionsGroupClasses}>
        <div className={equipmentPickerSortFilterClasses} role="group" aria-label="Sort equipment">
          <Text as="span" className={equipmentPickerSortLabelClasses}>
            {EQUIPMENT_PICKER_SORT_LABEL}
          </Text>
          <Select
            value={sortMode}
            onValueChange={(value) => onSortModeChange(value as EquipmentPickerSortMode)}
          >
            <SelectTrigger size="sm" aria-label="Equipment sort order">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EQUIPMENT_PICKER_SORT_MODES.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {EQUIPMENT_PICKER_SORT_LABELS[mode]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {showClearFilters ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={handleClearFilters}
          >
            <RotateCcw aria-hidden />
            {EQUIPMENT_PICKER_CLEAR_FILTERS_LABEL}
          </Button>
        ) : null}

        {showResetView ? (
          <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={onResetView}>
            <RotateCcw aria-hidden />
            {EQUIPMENT_PICKER_RESET_VIEW_LABEL}
          </Button>
        ) : null}
      </div>
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
  toolbarResetMode = 'reset_view',
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
  const [selectedKind, setSelectedKind] = React.useState<EquipmentPickerKindFilter>(
    EQUIPMENT_PICKER_VIEW_DEFAULTS.selectedKind,
  )
  const [showAffordableOnly, setShowAffordableOnly] = React.useState<boolean>(
    EQUIPMENT_PICKER_VIEW_DEFAULTS.showAffordableOnly,
  )
  const [sortMode, setSortMode] = React.useState<EquipmentPickerSortMode>(
    EQUIPMENT_PICKER_VIEW_DEFAULTS.sortMode,
  )
  const [addQuantities, setAddQuantities] = React.useState<Record<string, number>>({})

  // Browse context (category, affordable toggle, sort) preserved across close/reopen.
  // Reset only via explicit Clear filters / Reset view or a future context-key change.
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

  const filteredItems = React.useMemo(
    () =>
      filterEquipmentPickerItems(supportedItems, {
        filterOutUnaffordable,
        filterOutNonProficient,
        selectedKind,
        showAffordableOnly,
      }),
    [
      filterOutNonProficient,
      filterOutUnaffordable,
      showAffordableOnly,
      supportedItems,
      selectedKind,
    ],
  )

  const transformVisibleItems = React.useCallback(
    (tabItems: readonly EquipmentPickerItem[], context: { searchQuery: string }) =>
      filterAndSortEquipmentPickerItems(tabItems, {
        searchQuery: context.searchQuery,
        sortMode,
        browseSortContext,
      }),
    [browseSortContext, sortMode],
  )

  const handleSelectedKindChange = React.useCallback((kind: EquipmentPickerKindFilter) => {
    setSelectedKind(kind)
  }, [])

  const handleClearStructuredFilters = React.useCallback(() => {
    setSelectedKind(EQUIPMENT_PICKER_VIEW_DEFAULTS.selectedKind)
    setShowAffordableOnly(EQUIPMENT_PICKER_VIEW_DEFAULTS.showAffordableOnly)
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
      items={filteredItems}
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
      transformVisibleItems={transformVisibleItems}
      toolbarControls={(toolbarContext) => {
        const handleResetView = () => {
          setSelectedKind(EQUIPMENT_PICKER_VIEW_DEFAULTS.selectedKind)
          setShowAffordableOnly(EQUIPMENT_PICKER_VIEW_DEFAULTS.showAffordableOnly)
          setSortMode(EQUIPMENT_PICKER_VIEW_DEFAULTS.sortMode)
          toolbarContext.clearSearchQuery()
          toolbarContext.resetActiveTab()
        }

        return (
          <EquipmentPickerToolbarControls
            kinds={kindOptions}
            selectedKind={selectedKind}
            onSelectedKindChange={handleSelectedKindChange}
            showAffordableOnly={showAffordableOnly}
            onShowAffordableOnlyChange={setShowAffordableOnly}
            showAffordableFilter={Boolean(budget)}
            sortMode={sortMode}
            onSortModeChange={setSortMode}
            toolbarContext={toolbarContext}
            toolbarResetMode={toolbarResetMode}
            defaultTabId={defaultTab}
            onClearStructuredFilters={handleClearStructuredFilters}
            onResetView={handleResetView}
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
