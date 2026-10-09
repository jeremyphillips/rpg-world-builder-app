import * as React from 'react'

import {
  getContentTypeTerm,
  resolveLocationClassificationDisplay,
  type Location,
} from '@rpg/contracts'
import { isEmptySearchQuery, normalizeSearchQuery, scoreSearchDocument } from '@rpg/search'
import { Button, CATALOG_PICKER_ADD_LABEL, resolvePickerActionFailureStatus, Text } from '@rpg/ui'

import {
  CatalogEntityPickerSheet,
  CatalogEntitySurfaceRow,
  RelationshipCatalogFilterBand,
  RelationshipDrawerSubjectField,
  assembleLocationPickerSearchDocument,
  buildLocationContentDisplayImageInput,
  buildLocationEntityCardModelFromClassification,
  createLocationRelationshipFilterSchema,
  getContentDisplayImage,
  relationshipCatalogFilterHasBand,
  resolveLocationRelationshipFilterLayout,
  useRelationshipCatalogFilters,
} from '@/features/content'
import { comparePickerName } from '@/lib/catalog-picker/compare-picker-name'
import { resolvePickerPendingLabel } from '../../../lib/picker/picker-mutation-family'
import { hasCatalogPickerResetViewCriteria } from '../../picker/catalog-picker-filter-state.lib'
import { resolveCatalogPickerResultSummary } from '../../picker/catalog-picker-filter-state.lib'
import { CatalogToolbarResetSlot } from '../../picker/catalog-toolbar-reset-action'

import {
  chainComparators,
  scoreAndFilterPickerItems,
} from '../../picker/sort/catalog-picker-sort.lib'

import {
  buildLocationConnectionPickerEntries,
  type LocationConnectionPickerSearchContext,
} from '../../../lib/connections/location-connection-picker-items.lib'
import type {
  PlaceConnectionRoleOption,
  PropertyConnectionRoleOption,
} from '../../../lib/relationship/connection-role-catalog'
import { LocationRelationshipRoleStep } from './location-relationship-role-step'
import {
  LOCATION_CATALOG_COPY,
  LOCATION_CATALOG_SEARCH_PLACEHOLDER,
} from './residence-location-picker-drawer.types'

type LocationRelationshipRoleOption = PlaceConnectionRoleOption | PropertyConnectionRoleOption

export type LocationRelationshipAddDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  locations: readonly Location[]
  /** Full catalog map so ancestry stays searchable when `locations` is a subset. */
  locationSearchContext: LocationConnectionPickerSearchContext
  roleOptions: readonly LocationRelationshipRoleOption[]
  presetRole?: LocationRelationshipRoleOption
  onAdd: (input: {
    locationId: string
    role: LocationRelationshipRoleOption
  }) => void | Promise<void>
}

const LOCATION_ROW_CHOOSE_LABEL = 'Choose'
const LOCATION_ROW_PENDING_LABEL = resolvePickerPendingLabel('genericSelection', 'acquire')

function scoreAndSortLocationPickerItems<T extends { location: Location }>(
  items: readonly T[],
  searchContext: LocationConnectionPickerSearchContext,
  searchQuery: string,
): T[] {
  const hasQuery = !isEmptySearchQuery(normalizeSearchQuery(searchQuery))
  const scored = scoreAndFilterPickerItems(items, {
    searchQuery,
    scoreItem: (item) =>
      scoreSearchDocument(
        assembleLocationPickerSearchDocument(item.location, searchContext),
        searchQuery,
        { profile: 'forgiving' },
      ),
  })

  if (!hasQuery) return scored.map((row) => row.item)

  return scored
    .toSorted(
      chainComparators(
        (left, right) => right.searchScore - left.searchScore,
        (left, right) =>
          comparePickerName(
            { name: left.item.location.name, id: left.item.location.id },
            { name: right.item.location.name, id: right.item.location.id },
          ),
      ),
    )
    .map((row) => row.item)
}

function resolveSubmitError(error: unknown): string {
  return error instanceof Error && error.message.trim().length > 0
    ? error.message
    : resolvePickerActionFailureStatus(CATALOG_PICKER_ADD_LABEL)
}

// Orchestrator: location picker → role selection → confirm for place/property edges.
// fallow-ignore-next-line complexity
export function LocationRelationshipAddDrawer({
  open,
  onOpenChange,
  title,
  locations,
  locationSearchContext,
  roleOptions,
  presetRole,
  onAdd,
}: LocationRelationshipAddDrawerProps) {
  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(null)
  const [selectedRoleId, setSelectedRoleId] = React.useState<string | null>(presetRole?.id ?? null)
  const [pending, setPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const pickerEntries = React.useMemo(
    () => buildLocationConnectionPickerEntries(locations, locationSearchContext),
    [locations, locationSearchContext],
  )
  const sortedLocations = React.useMemo(
    () => pickerEntries.map((entry) => entry.location),
    [pickerEntries],
  )
  const locationFilterSchema = React.useMemo(
    () =>
      createLocationRelationshipFilterSchema({
        rows: sortedLocations,
        getKind: (location) => location.kind,
      }),
    [sortedLocations],
  )
  const locationFilterLayout = React.useMemo(
    () => resolveLocationRelationshipFilterLayout(locationFilterSchema),
    [locationFilterSchema],
  )
  const locationFilters = useRelationshipCatalogFilters({
    rows: sortedLocations,
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

  const resetSession = React.useCallback(() => {
    locationFilters.reset()
    setSelectedLocationId(null)
    setSelectedRoleId(presetRole?.id ?? null)
    setPending(false)
    setSubmitError(null)
  }, [locationFilters.reset, presetRole?.id])

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (pending) return
      if (!nextOpen) resetSession()
      onOpenChange(nextOpen)
    },
    [onOpenChange, pending, resetSession],
  )

  const selectedLocation = locations.find((location) => location.id === selectedLocationId)
  const selectedRole = roleOptions.find((role) => role.id === selectedRoleId)
  const showRoleStep = Boolean(selectedLocationId) && !presetRole && roleOptions.length > 1
  const showConfirmStep = Boolean(selectedLocationId) && Boolean(presetRole ?? selectedRole)
  const showFollowUp = showRoleStep || showConfirmStep

  const returnToBrowse = React.useCallback(() => {
    setSelectedLocationId(null)
    setSelectedRoleId(presetRole?.id ?? null)
    setSubmitError(null)
  }, [presetRole?.id])

  const commitAdd = React.useCallback(async () => {
    const role = presetRole ?? selectedRole
    if (!selectedLocationId || !role || pending) return

    setPending(true)
    setSubmitError(null)
    try {
      await onAdd({ locationId: selectedLocationId, role })
      onOpenChange(false)
    } catch (error) {
      setSubmitError(resolveSubmitError(error))
    } finally {
      setPending(false)
    }
  }, [onAdd, onOpenChange, pending, presetRole, selectedLocationId, selectedRole])

  const commitLocation = React.useCallback(
    async (locationId: string) => {
      if (roleOptions.length === 1) {
        const onlyRole = roleOptions[0]!
        setSelectedLocationId(locationId)
        await onAdd({ locationId, role: onlyRole })
        onOpenChange(false)
        return
      }

      setSelectedLocationId(locationId)
    },
    [onAdd, onOpenChange, roleOptions],
  )

  type LocationRelationshipPickerItem = { location: Location; selected: boolean }

  const pickerItems: LocationRelationshipPickerItem[] = locationFilters.filteredRows.map(
    (location) => ({
      location,
      selected: false,
    }),
  )

  const transformVisibleItems = React.useCallback(
    (visibleItems: readonly LocationRelationshipPickerItem[], context: { searchQuery: string }) =>
      scoreAndSortLocationPickerItems(visibleItems, locationSearchContext, context.searchQuery),
    [locationSearchContext],
  )

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description="Choose a location connected to this character."
      items={pickerItems}
      hasStructuredFilters={locationFilters.structuredFilterCount > 0}
      primaryControls={
        showFamilyFilter ? (
          <RelationshipCatalogFilterBand
            band="primary"
            schema={locationFilterSchema}
            layout={locationFilterLayout}
            state={locationFilters.state}
            data={sortedLocations}
            idPrefix="location-relationship-add"
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
                  data={sortedLocations}
                  idPrefix="location-relationship-picker"
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
      transformVisibleItems={transformVisibleItems}
      searchPlaceholder={LOCATION_CATALOG_SEARCH_PLACEHOLDER}
      noResultsMessage={LOCATION_CATALOG_COPY.noResultsMessage}
      noItemsMessage={LOCATION_CATALOG_COPY.noItemsMessage}
      renderEntityRow={(args) => {
        const { location } = args.item
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
                displayImage: getContentDisplayImage(
                  buildLocationContentDisplayImageInput(location, 'compact'),
                ),
              }),
              inlineAction: {
                label: LOCATION_ROW_CHOOSE_LABEL,
                pendingLabel: LOCATION_ROW_PENDING_LABEL,
                onClick: () => {
                  void commitLocation(location.id)
                },
                loading: pending,
              },
            }}
          />
        )
      }}
      bodyReplacement={
        showFollowUp ? (
          <div className="flex flex-col gap-6">
            {selectedLocation ? (
              <RelationshipDrawerSubjectField
                label={getContentTypeTerm('locations').label}
                value={selectedLocation.name}
              />
            ) : null}
            {presetRole ? (
              <RelationshipDrawerSubjectField label="Relationship" value={presetRole.label} />
            ) : null}
            {showRoleStep ? (
              <LocationRelationshipRoleStep
                roleOptions={roleOptions}
                selectedRoleId={selectedRoleId}
                onSelectedRoleIdChange={setSelectedRoleId}
              />
            ) : null}
            {submitError ? (
              <Text variant="destructive" role="alert">
                {submitError}
              </Text>
            ) : null}
          </div>
        ) : undefined
      }
      footer={
        showFollowUp ? (
          <>
            <Button type="button" variant="outline" disabled={pending} onClick={returnToBrowse}>
              Back
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={pending || !showConfirmStep || (!presetRole && !selectedRole)}
              onClick={() => {
                void commitAdd()
              }}
            >
              Add
            </Button>
          </>
        ) : undefined
      }
    />
  )
}
