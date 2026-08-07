'use client'

import * as React from 'react'

import type { Location } from '@rpg/contracts'
import { getLocationKindLabel } from '@rpg/contracts'
import { Button, CatalogPickerSheet, SegmentedControl, Text } from '@rpg/ui'

import {
  CatalogPickerSelectionActions,
  catalogPickerShellProps,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { ContentEntityCard } from '../../lib/content-entity-card.client'
import type { EntityReplacementCurrentSnapshot } from '../../lib/entity-replacement/entity-replacement-current-entity'
import { EntityReplacementSection } from '../../lib/entity-replacement/entity-replacement-section.client'
import {
  buildLocationParentReplacementContext,
  canSubmitLocationParentReplacement,
  hasLocationParentReplacementContextMismatch,
  type LocationParentReplacementCurrentSnapshot,
  type LocationParentReplacementMode,
} from '../lib/location-parent-replacement'
import {
  filterLocationsByParentBrowseScope,
  LOCATION_PARENT_BROWSE_SCOPE_LABEL,
  resolveParentBrowseScopeOptions,
  shouldShowParentBrowseScopes,
  type LocationParentBrowseScope,
} from '../lib/location-parent-browse-scope'
import {
  LOCATION_PARENT_REPLACEMENT_DRAWER,
  resolveLocationParentReplacementDrawerNewHelper,
  resolveLocationParentReplacementDrawerSubmitLabel,
  resolveLocationParentReplacementDrawerTitle,
  type LocationParentReplacementDrawerSurface,
} from '../lib/location-parent-replacement-surface-copy'

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

function buildLocationSearchText(location: Location): string {
  return [location.name, getLocationKindLabel(location.kind)].join(' ')
}

function toEntityReplacementCurrentSnapshot(
  current: LocationParentReplacementCurrentSnapshot,
): EntityReplacementCurrentSnapshot {
  return {
    heading: current.heading,
    subheading: current.subheading,
    imageKey: current.imageKey,
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

function LocationParentReplacementCandidateRow({
  location,
  selectedParentId,
  onSelect,
  onClear,
}: {
  location: Location
  selectedParentId: string | null
  onSelect: (locationId: string) => void
  onClear: () => void
}) {
  const isSelected = selectedParentId === location.id
  const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

  return (
    <ContentEntityCard
      chrome="embedded"
      density="compact"
      heading={location.name}
      subheading={getLocationKindLabel(location.kind)}
      imageKey={location.imageKey}
      endSlot={
        <CatalogPickerSelectionActions
          phase={phase}
          canSelect
          addLabel={isSelected ? 'Selected' : 'Select'}
          onAdd={() => onSelect(location.id)}
          onRemove={onClear}
        />
      }
    />
  )
}

function LocationParentReplacementDrawerFooter({
  contextMismatch,
  pickerEnabled,
  hasCandidates,
  currentUnavailable,
  canSubmit,
  isSubmitting,
  surface,
  mode,
  onSubmit,
}: {
  contextMismatch: boolean
  pickerEnabled: boolean
  hasCandidates: boolean
  currentUnavailable: boolean
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

  if (currentUnavailable) {
    return (
      <Text variant="muted" className="text-sm" role="status">
        Resolve the current parent reference before choosing a replacement.
      </Text>
    )
  }

  return undefined
}

export function LocationParentReplacementDrawer(props: LocationParentReplacementDrawerProps) {
  const remountKey = props.open ? `${props.subject.id}:open` : 'closed'
  return <LocationParentReplacementDrawerContent key={remountKey} {...props} />
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
  const [parentBrowseScope, setParentBrowseScope] = React.useState<LocationParentBrowseScope>('all')

  const { mode, currentParent, candidates } = React.useMemo(
    () =>
      buildLocationParentReplacementContext({
        subject,
        campaignLocations,
      }),
    [campaignLocations, subject],
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

  const browseScopeOptions = React.useMemo(
    () => resolveParentBrowseScopeOptions(candidates),
    [candidates],
  )

  const showParentBrowseScopeControl =
    pickerEnabled && shouldShowParentBrowseScopes(browseScopeOptions)

  const pickerCandidates = React.useMemo(() => {
    if (!showParentBrowseScopeControl) {
      return candidates
    }

    return filterLocationsByParentBrowseScope(candidates, parentBrowseScope)
  }, [candidates, parentBrowseScope, showParentBrowseScopeControl])

  const handleSubmit = async () => {
    if (!selectedParentId || contextMismatch) return
    await onSubmit(selectedParentId)
  }

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={resolveLocationParentReplacementDrawerTitle({
        surface,
        mode,
        subjectName: subject.name,
      })}
      {...catalogPickerShellProps()}
      rowLayout="entity-card"
      pickerEnabled={pickerEnabled}
      searchPlaceholder={LOCATION_PARENT_REPLACEMENT_DRAWER.searchPlaceholder}
      noResultsMessage={LOCATION_PARENT_REPLACEMENT_DRAWER.noResultsMessage}
      noItemsMessage={LOCATION_PARENT_REPLACEMENT_DRAWER.noItemsMessage}
      headerBelowDescription={
        <EntityReplacementSection
          entityLabel="Parent"
          current={currentParent ? toEntityReplacementCurrentSnapshot(currentParent) : null}
          newHelper={resolveLocationParentReplacementDrawerNewHelper({
            surface,
            mode,
            subjectName: subject.name,
          })}
        >
          {showParentBrowseScopeControl ? (
            <SegmentedControl
              aria-label={LOCATION_PARENT_BROWSE_SCOPE_LABEL}
              value={parentBrowseScope}
              options={browseScopeOptions}
              onValueChange={setParentBrowseScope}
              fullWidth
            />
          ) : null}
        </EntityReplacementSection>
      }
      footer={
        <LocationParentReplacementDrawerFooter
          contextMismatch={contextMismatch}
          pickerEnabled={pickerEnabled}
          hasCandidates={candidates.length > 0}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          surface={surface}
          mode={mode}
          currentUnavailable={Boolean(currentParent?.unavailable)}
          onSubmit={() => void handleSubmit()}
        />
      }
      hasStructuredFilters={showParentBrowseScopeControl && parentBrowseScope !== 'all'}
      items={pickerEnabled ? pickerCandidates : []}
      getItemKey={(location) => location.id}
      getItemToolbarLabel={(location) => location.name}
      getSearchText={buildLocationSearchText}
      renderItemHeader={(location) => (
        <LocationParentReplacementCandidateRow
          location={location}
          selectedParentId={selectedParentId}
          onSelect={setSelectedParentId}
          onClear={() => setSelectedParentId(null)}
        />
      )}
    />
  )
}
