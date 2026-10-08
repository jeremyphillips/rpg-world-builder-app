import * as React from 'react'

import { resolveLocationClassificationDisplay } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

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
import { hasCatalogPickerResetViewCriteria } from '../../picker/catalog-picker-filter-state.lib'
import { CatalogToolbarResetSlot } from '../../picker/catalog-toolbar-reset-action'

import { filterAndSortResidencePickerItems } from './residence-location-picker-drawer.lib'
import {
  RESIDENCE_PICKER_DESCRIPTION,
  RESIDENCE_PICKER_NO_ITEMS_MESSAGE,
  RESIDENCE_PICKER_NO_RESULTS_MESSAGE,
  RESIDENCE_PICKER_TITLE,
  type ResidenceLocationPickerDrawerProps,
} from './residence-location-picker-drawer.types'

export type { ResidenceLocationPickerDrawerProps } from './residence-location-picker-drawer.types'

const RESIDENCE_PICKER_SUBMIT_FAILED_MESSAGE = 'Could not add this residence.'

export function ResidenceLocationPickerDrawer({
  open,
  onOpenChange,
  items,
  onAdd,
}: ResidenceLocationPickerDrawerProps) {
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
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
  const showKindFilter = relationshipCatalogFilterHasBand(
    'filterRow',
    locationFilterSchema,
    locationFilterLayout,
  )

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      if (!nextOpen) {
        locationFilters.reset()
        setSubmitError(null)
      }
      onOpenChange(nextOpen)
    },
    [locationFilters.reset, onOpenChange, pending],
  )

  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly (typeof items)[number][], context: { searchQuery: string }) =>
      filterAndSortResidencePickerItems(visibleItems, { searchQuery: context.searchQuery }),
    [],
  )

  const commitResidence = React.useCallback(
    async (locationId: string) => {
      if (pending) return

      setPending(true)
      setSubmitError(null)
      try {
        await onAdd({ locationId })
        onOpenChange(false)
      } catch (error) {
        const message =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : RESIDENCE_PICKER_SUBMIT_FAILED_MESSAGE
        setSubmitError(message)
      } finally {
        setPending(false)
      }
    },
    [onAdd, onOpenChange, pending],
  )

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={RESIDENCE_PICKER_TITLE}
      description={RESIDENCE_PICKER_DESCRIPTION}
      items={locationFilters.filteredRows}
      hasStructuredFilters={locationFilters.structuredFilterCount > 0}
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
      actions={({ searchQuery, resetSearchQuery }) => {
        const showReset = hasCatalogPickerResetViewCriteria({
          structuredFilterCount: locationFilters.structuredFilterCount,
          searchQuery,
        })
        if (!showReset) return null

        return (
          <CatalogToolbarResetSlot
            visible
            includesSort={false}
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
      searchPlaceholder="Search locations"
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
                status: selected ? [{ kind: 'badge', label: 'Added', tone: 'success' }] : undefined,
                displayImage: getContentDisplayImage(
                  buildLocationContentDisplayImageInput(location, 'compact'),
                ),
              }),
              inlineAction: selected
                ? undefined
                : {
                    label: 'Add',
                    onClick: () => {
                      void commitResidence(location.id)
                    },
                    loading: pending,
                  },
            }}
          />
        )
      }}
      renderItemDetails={({ location, selected }) => {
        if (selected) return null

        return (
          <div className="flex flex-col gap-4">
            {submitError ? (
              <Text variant="destructive" role="alert">
                {submitError}
              </Text>
            ) : null}
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={pending}
                onClick={() => {
                  void commitResidence(location.id)
                }}
              >
                Add residence
              </Button>
            </div>
          </div>
        )
      }}
    />
  )
}
