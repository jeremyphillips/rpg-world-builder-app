import * as React from 'react'

import type { Location } from '@rpg/contracts'
import { Button, Text } from '@rpg/ui'

import {
  CatalogToolbarResetSlot,
  hasCatalogPickerNarrowingCriteria,
  hasCatalogPickerResetViewCriteria,
  resolveCatalogPickerResultSummary,
} from '@/features/character'
import {
  CatalogEntityPickerSheet,
  RelationshipCatalogFilterBand,
  createCatalogEntityRowRenderer,
  createLocationRelationshipFilterSchema,
  relationshipCatalogFilterHasBand,
  resolveLocationRelationshipFilterLayout,
  useRelationshipCatalogFilters,
} from '@/features/content'
import { buildCatalogToggleSelectInlineAction } from '../../../lib/entity/surfaces/entity-surface-projection.lib'
import type { EntityReplacementCurrentSnapshot } from '../../../lib/entity/surfaces/drawer/replacement/entity-replacement-current.types'
import { EntityReplacementSection } from '../../../lib/entity/surfaces/drawer/replacement/entity-replacement-section'
import {
  buildLocationEntityCardModel,
  buildLocationEntitySummarySearchText,
} from '../../lib/location-display'
import {
  buildLocationParentReplacementContext,
  canSubmitLocationParentReplacement,
  hasLocationParentReplacementContextMismatch,
  type LocationParentReplacementCurrentSnapshot,
  type LocationParentReplacementMode,
} from '../../lib/hierarchy/location-parent-replacement'
import {
  LOCATION_PARENT_REPLACEMENT_DRAWER,
  resolveLocationParentReplacementDrawerNewHelper,
  resolveLocationParentReplacementDrawerSubmitLabel,
  resolveLocationParentReplacementDrawerTitle,
  type LocationParentReplacementDrawerSurface,
} from '../../lib/hierarchy/location-parent-replacement-surface-copy'

export type LocationParentReplacementDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: Location
  campaignLocations: readonly Location[]
  /** Child detail Change/Set vs parent Contained Move chrome. */
  surface?: LocationParentReplacementDrawerSurface
  /**
   * When set (Move from a parent detail), blocks picker/submit if the child’s
   * persisted `parentLocationId` no longer matches this open parent page.
   */
  expectedParentLocationId?: string
  isSubmitting?: boolean
  onSubmit: (newParentLocationId: string) => Promise<void>
}

function toEntityReplacementCurrentSnapshot(
  current: LocationParentReplacementCurrentSnapshot,
): EntityReplacementCurrentSnapshot {
  return {
    entity: current.entity,
    displayImage: current.displayImage,
    fallback: current.fallback,
    unavailable: current.unavailable,
  }
}

function resolveContextMismatch(input: {
  subject: Pick<Location, 'parentLocationId'>
  expectedParentLocationId?: string
}): boolean {
  return (
    input.expectedParentLocationId != null &&
    hasLocationParentReplacementContextMismatch({
      subject: input.subject,
      expectedParentLocationId: input.expectedParentLocationId,
    })
  )
}

function LocationParentReplacementDrawerFooter({
  contextMismatch,
  pickerEnabled,
  hasCandidates,
  canSubmit,
  isSubmitting,
  surface,
  mode,
  onSubmit,
}: {
  contextMismatch: boolean
  pickerEnabled: boolean
  hasCandidates: boolean
  canSubmit: boolean
  isSubmitting: boolean
  surface: LocationParentReplacementDrawerSurface
  mode: LocationParentReplacementMode
  onSubmit: () => void
}) {
  if (contextMismatch) {
    return (
      <Text variant="muted" className="text-sm" role="status">
        {LOCATION_PARENT_REPLACEMENT_DRAWER.mismatchStatus}
      </Text>
    )
  }

  if (pickerEnabled && hasCandidates) {
    return (
      <Button type="button" disabled={!canSubmit || isSubmitting} onClick={onSubmit}>
        {resolveLocationParentReplacementDrawerSubmitLabel({ surface, mode })}
      </Button>
    )
  }

  return undefined
}

export function LocationParentReplacementDrawer(props: LocationParentReplacementDrawerProps) {
  const remountKey = props.open ? `${props.subject.id}:open` : 'closed'
  return <LocationParentReplacementDrawerContent key={remountKey} {...props} />
}

function LocationParentReplacementDrawerHeader({
  subject,
  surface,
  mode,
  currentParent,
}: {
  subject: Location
  surface: LocationParentReplacementDrawerSurface
  mode: LocationParentReplacementMode
  currentParent: LocationParentReplacementCurrentSnapshot | null
}) {
  return (
    <div className="space-y-4">
      <EntityReplacementSection
        entityLabel="Parent"
        current={currentParent ? toEntityReplacementCurrentSnapshot(currentParent) : null}
        newHelper={resolveLocationParentReplacementDrawerNewHelper({
          surface,
          mode,
          subjectName: subject.name,
        })}
      />
    </div>
  )
}

function resolveParentReplacementCampaignId(
  subject: Location,
  campaignLocations: readonly Location[],
): string {
  return subject.campaignId ?? campaignLocations[0]?.campaignId ?? ''
}

function LocationParentReplacementDrawerContent({
  open,
  onOpenChange,
  subject,
  campaignLocations,
  surface = 'child',
  expectedParentLocationId,
  isSubmitting = false,
  onSubmit,
}: LocationParentReplacementDrawerProps) {
  const [selectedParentId, setSelectedParentId] = React.useState<string | null>(null)

  const campaignId = resolveParentReplacementCampaignId(subject, campaignLocations)
  const { mode, currentParent, candidates, candidateSummaries } = React.useMemo(
    () =>
      buildLocationParentReplacementContext({
        subject,
        campaignLocations,
        campaignId,
      }),
    [campaignId, campaignLocations, subject],
  )

  const contextMismatch = resolveContextMismatch({ subject, expectedParentLocationId })
  const pickerEnabled = !currentParent?.unavailable && !contextMismatch
  const canSubmit =
    !contextMismatch &&
    canSubmitLocationParentReplacement({
      mode,
      subject,
      selectedParentId,
    })

  const locationFilterSchema = React.useMemo(
    () =>
      createLocationRelationshipFilterSchema({
        rows: candidates,
        getKind: (location) => location.kind,
      }),
    [candidates],
  )
  const locationFilterLayout = React.useMemo(
    () => resolveLocationRelationshipFilterLayout(locationFilterSchema),
    [locationFilterSchema],
  )
  const locationFilters = useRelationshipCatalogFilters({
    rows: candidates,
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
  const filteredPickerCandidates = React.useMemo(() => {
    const visibleIds = new Set(locationFilters.filteredRows.map((location) => location.id))
    return candidateSummaries.filter((summary) => visibleIds.has(summary.id))
  }, [candidateSummaries, locationFilters.filteredRows])

  const handleSubmit = async () => {
    if (!selectedParentId || contextMismatch) return
    await onSubmit(selectedParentId)
  }

  return (
    <CatalogEntityPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={resolveLocationParentReplacementDrawerTitle({
        surface,
        mode,
        subjectName: subject.name,
      })}
      pickerEnabled={pickerEnabled}
      searchPlaceholder={LOCATION_PARENT_REPLACEMENT_DRAWER.searchPlaceholder}
      noResultsMessage={LOCATION_PARENT_REPLACEMENT_DRAWER.noResultsMessage}
      noItemsMessage={LOCATION_PARENT_REPLACEMENT_DRAWER.noItemsMessage}
      headerBelowDescription={
        <LocationParentReplacementDrawerHeader
          subject={subject}
          surface={surface}
          mode={mode}
          currentParent={currentParent}
        />
      }
      footer={
        <LocationParentReplacementDrawerFooter
          contextMismatch={contextMismatch}
          pickerEnabled={pickerEnabled}
          hasCandidates={candidateSummaries.length > 0}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          surface={surface}
          mode={mode}
          onSubmit={() => void handleSubmit()}
        />
      }
      hasStructuredFilters={locationFilters.structuredFilterCount > 0}
      items={pickerEnabled ? filteredPickerCandidates : []}
      primaryControls={
        showFamilyFilter ? (
          <RelationshipCatalogFilterBand
            band="primary"
            schema={locationFilterSchema}
            layout={locationFilterLayout}
            state={locationFilters.state}
            data={candidates}
            idPrefix="location-parent-replacement"
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
                  data={candidates}
                  idPrefix="location-parent-replacement"
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
      getItemKey={(summary) => summary.id}
      getItemToolbarLabel={(summary) => summary.name}
      getSearchText={buildLocationEntitySummarySearchText}
      renderEntityRow={createCatalogEntityRowRenderer({
        buildSurface: (summary) => ({
          identity: buildLocationEntityCardModel(summary),
          inlineAction: buildCatalogToggleSelectInlineAction({
            isSelected: selectedParentId === summary.id,
            onSelect: () => setSelectedParentId(summary.id),
            onDeselect: () => setSelectedParentId(null),
          }),
        }),
      })}
    />
  )
}
