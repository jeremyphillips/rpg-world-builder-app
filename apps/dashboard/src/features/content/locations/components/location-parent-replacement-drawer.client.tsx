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
} from '../lib/location-parent-replacement'
import {
  LOCATION_PARENT_REPLACEMENT_DRAWER,
  resolveLocationParentReplacementDrawerSubmitLabel,
  resolveLocationParentReplacementDrawerTitle,
} from '../lib/location-parent-replacement-surface-copy'

export type LocationParentReplacementDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject: Location
  campaignLocations: readonly Location[]
  isSubmitting?: boolean
  onSubmit: (newParentLocationId: string) => Promise<void>
}

function buildLocationSearchText(location: Location): string {
  return [location.name, getLocationKindLabel(location.kind)].join(' ')
}

function toEntityReplacementCurrentSnapshot(input: {
  heading: string
  subheading?: string
  imageKey?: string
  unavailable?: boolean
}): EntityReplacementCurrentSnapshot {
  return {
    heading: input.heading,
    subheading: input.subheading,
    imageKey: input.imageKey,
    unavailable: input.unavailable,
  }
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

  const pickerEnabled = !currentParent?.unavailable
  const canSubmit = canSubmitLocationParentReplacement({
    mode,
    subject,
    selectedParentId,
  })

  const handleSubmit = async () => {
    if (!selectedParentId) return
    await onSubmit(selectedParentId)
  }

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={resolveLocationParentReplacementDrawerTitle(mode)}
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
        pickerEnabled && candidates.length > 0 ? (
          <Button
            type="button"
            disabled={!canSubmit || isSubmitting}
            onClick={() => void handleSubmit()}
          >
            {resolveLocationParentReplacementDrawerSubmitLabel(mode)}
          </Button>
        ) : currentParent?.unavailable ? (
          <Text variant="muted" className="text-sm" role="status">
            Resolve the current parent reference before choosing a replacement.
          </Text>
        ) : undefined
      }
      items={pickerEnabled ? candidates : []}
      getItemKey={(location) => location.id}
      getItemToolbarLabel={(location) => location.name}
      getSearchText={buildLocationSearchText}
      renderItemHeader={(location) => {
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
                onAdd={() => setSelectedParentId(location.id)}
                onRemove={() => setSelectedParentId(null)}
              />
            }
          />
        )
      }}
    />
  )
}
