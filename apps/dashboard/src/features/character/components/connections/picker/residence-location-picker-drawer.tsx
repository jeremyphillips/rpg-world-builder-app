import * as React from 'react'

import { catalogNounFromContentType, resolveLocationClassificationDisplay } from '@rpg/contracts'
import { Button } from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  CatalogEntitySurfaceRow,
  RelationshipCatalogFilterBand,
  buildLocationContentDisplayImageInput,
  buildLocationEntityCardModelFromClassification,
  createLocationRelationshipFilterSchema,
  getContentDisplayImage,
  relationshipCatalogFilterHasBand,
  resolveLocationRelationshipFilterLayout,
  useRelationshipCatalogFilters,
} from '@/features/content'
import { resolvePickerPendingLabel } from '../../../lib/picker/picker-mutation-family'
import { resolvePickerSelectionStateLine } from '../../../lib/picker/picker-selection-state'
import { hasCatalogPickerResetViewCriteria } from '../../picker/catalog-picker-filter-state.lib'
import {
  hasCatalogPickerNarrowingCriteria,
  resolveCatalogPickerResultSummary,
} from '../../picker/catalog-picker-filter-state.lib'
import { CatalogToolbarResetSlot } from '../../picker/catalog-toolbar-reset-action'

import { filterAndSortResidencePickerItems } from './residence-location-picker-drawer.lib'
import {
  LOCATION_CATALOG_SEARCH_PLACEHOLDER,
  type ResidenceLocationPickerDrawerProps,
} from './residence-location-picker-drawer.types'

export type { ResidenceLocationPickerDrawerProps } from './residence-location-picker-drawer.types'

const locationNoun = catalogNounFromContentType('locations')
const RESIDENCE_PICKER_TITLE = 'Choose residence'
const RESIDENCE_PICKER_DESCRIPTION = `Choose a ${locationNoun.singular} where this character lives.`
const RESIDENCE_PICKER_NO_RESULTS_MESSAGE = `No ${locationNoun.plural} match this search.`
const RESIDENCE_PICKER_NO_ITEMS_MESSAGE = 'No residence locations are available.'
const RESIDENCE_PICKER_ADD_SUBMIT_LABEL = 'Add residence'
const RESIDENCE_PICKER_PENDING_LABEL = resolvePickerPendingLabel('genericSelection', 'acquire')

export function ResidenceLocationPickerDrawer({
  open,
  onOpenChange,
  items,
  onAdd,
}: ResidenceLocationPickerDrawerProps) {
  const [pendingId, setPendingId] = React.useState<string | null>(null)
  const [failedId, setFailedId] = React.useState<string | null>(null)
  const locationFilterSchema = React.useMemo(
    () =>
      createLocationRelationshipFilterSchema({
        rows: items,
        getKind: (item) => item.location.kind,
      }),
    [items],
  )
  const locationFilterLayout = React.useMemo(
    () => resolveLocationRelationshipFilterLayout(locationFilterSchema),
    [locationFilterSchema],
  )
  const locationFilters = useRelationshipCatalogFilters({
    rows: items,
    schema: locationFilterSchema,
  })
  const showFamilyFilter = relationshipCatalogFilterHasBand(
    'primary',
    locationFilterSchema,
    locationFilterLayout,
  )
  const showKindFilter = relationshipCatalogFilterHasBand(
    'filterRow',
    locationFilterSchema,
    locationFilterLayout,
  )

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pendingId) return
      if (!nextOpen) {
        locationFilters.reset()
        setFailedId(null)
      }
      onOpenChange(nextOpen)
    },
    [locationFilters.reset, onOpenChange, pendingId],
  )

  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly (typeof items)[number][], context: { searchQuery: string }) =>
      filterAndSortResidencePickerItems(visibleItems, { searchQuery: context.searchQuery }),
    [],
  )

  const commitResidence = React.useCallback(
    async (locationId: string) => {
      if (pendingId) return

      setPendingId(locationId)
      setFailedId(null)
      try {
        await onAdd({ locationId })
        onOpenChange(false)
      } catch {
        setFailedId(locationId)
      } finally {
        setPendingId(null)
      }
    },
    [onAdd, onOpenChange, pendingId],
  )

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={RESIDENCE_PICKER_TITLE}
      description={RESIDENCE_PICKER_DESCRIPTION}
      items={locationFilters.filteredRows}
      hasStructuredFilters={locationFilters.structuredFilterCount > 0}
      primaryControls={
        showFamilyFilter ? (
          <RelationshipCatalogFilterBand
            band="primary"
            schema={locationFilterSchema}
            layout={locationFilterLayout}
            state={locationFilters.state}
            data={items}
            idPrefix="residence-location-picker"
            onValueChange={locationFilters.setValue}
          />
        ) : undefined
      }
      filterRow={
        showKindFilter
          ? {
              controls: (
                <RelationshipCatalogFilterBand
                  band="filterRow"
                  schema={locationFilterSchema}
                  layout={locationFilterLayout}
                  state={locationFilters.state}
                  data={items}
                  idPrefix="residence-location-picker"
                  onValueChange={locationFilters.setValue}
                />
              ),
            }
          : undefined
      }
      actions={({ searchQuery, resetSearchQuery, visibleItemCount }) => {
        const showReset = hasCatalogPickerResetViewCriteria({
          structuredFilterCount: locationFilters.structuredFilterCount,
          searchQuery,
        })
        return (
          <CatalogToolbarResetSlot
            visible={showReset}
            reserve={showKindFilter}
            includesSort={false}
            {...resolveCatalogPickerResultSummary({
              visible: visibleItemCount,
              total: locationFilters.sourceCount,
              narrowing: hasCatalogPickerNarrowingCriteria({
                structuredFilterCount: locationFilters.structuredFilterCount,
                searchQuery,
              }),
            })}
            onClick={() => {
              locationFilters.reset()
              resetSearchQuery()
            }}
          />
        )
      }}
      getItemKey={({ location }) => location.id}
      getItemToolbarLabel={({ location }) => location.name}
      getSearchText={({ location }) => location.name}
      searchPlaceholder={LOCATION_CATALOG_SEARCH_PLACEHOLDER}
      noResultsMessage={RESIDENCE_PICKER_NO_RESULTS_MESSAGE}
      noItemsMessage={RESIDENCE_PICKER_NO_ITEMS_MESSAGE}
      transformVisibleItems={transformVisibleItems}
      renderEntityRow={(args) => {
        const { location, selected } = args.item
        const classification = resolveLocationClassificationDisplay(location)

        return (
          <CatalogEntitySurfaceRow
            toolbarLabel={args.toolbarLabel}
            domIds={args.domIds}
            collapsible={args.collapsible}
            collapsed={args.collapsed}
            onToggleCollapse={args.onToggleCollapse}
            summary={args.summary}
            details={args.details}
            surface={{
              identity: buildLocationEntityCardModelFromClassification({
                name: location.name,
                classificationText: classification.text,
                ...(selected
                  ? { selectionState: resolvePickerSelectionStateLine({ kind: 'selected' }) }
                  : {}),
                displayImage: getContentDisplayImage(
                  buildLocationContentDisplayImageInput(location, 'compact'),
                ),
              }),
              inlineAction: selected
                ? undefined
                : {
                    label: 'Add',
                    pendingLabel: RESIDENCE_PICKER_PENDING_LABEL,
                    entityKey: location.id,
                    failed: failedId === location.id,
                    onClick: () => {
                      void commitResidence(location.id)
                    },
                    loading: pendingId === location.id,
                  },
            }}
          />
        )
      }}
      renderItemDetails={({ location, selected }) => {
        if (selected) return null

        return (
          <div className="flex justify-end">
            <Button
              type="button"
              disabled={pendingId === location.id}
              onClick={() => {
                void commitResidence(location.id)
              }}
            >
              {RESIDENCE_PICKER_ADD_SUBMIT_LABEL}
            </Button>
          </div>
        )
      }}
    />
  )
}
