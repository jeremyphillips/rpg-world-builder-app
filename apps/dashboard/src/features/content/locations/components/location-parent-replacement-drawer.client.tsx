'use client'

import * as React from 'react'

import type { Location } from '@rpg/contracts'
import { getLocationKindLabel } from '@rpg/contracts'
import { Button, CatalogPickerSheet, Text } from '@rpg/ui'

import {
  CatalogPickerSelectionActions,
  catalogPickerShellProps,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { ContentEntityCard } from '../../lib/content-entity-card.client'
import type { EntityReplacementCurrentSnapshot } from '../../lib/entity-replacement/entity-replacement-current-entity'
import { EntityReplacementSection } from '../../lib/entity-replacement/entity-replacement-section.client'
import { RELATIONSHIP_DRAWER_LOCATION_FIELD_LABEL } from '../../lib/relationship/relationship-drawer-field-labels'
import {
  buildLocationParentReplacementContext,
  canSubmitLocationParentReplacement,
  hasLocationParentReplacementContextMismatch,
  type LocationParentReplacementCurrentSnapshot,
  type LocationParentReplacementMode,
} from '../lib/location-parent-replacement'
import {
  LOCATION_PARENT_REPLACEMENT_DRAWER,
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
          entityLabel={RELATIONSHIP_DRAWER_LOCATION_FIELD_LABEL}
          current={currentParent ? toEntityReplacementCurrentSnapshot(currentParent) : null}
          newHelper={LOCATION_PARENT_REPLACEMENT_DRAWER.newHelper}
        />
      }
      footer={
        <LocationParentReplacementDrawerFooter
          contextMismatch={contextMismatch}
          pickerEnabled={pickerEnabled}
          hasCandidates={candidates.length > 0}
          currentUnavailable={Boolean(currentParent?.unavailable)}
          canSubmit={canSubmit}
          isSubmitting={isSubmitting}
          surface={surface}
          mode={mode}
          onSubmit={() => void handleSubmit()}
        />
      }
      items={pickerEnabled ? candidates : []}
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
