'use client'

import * as React from 'react'

import type { Location, OrganizationLocationConnectionKind } from '@rpg/contracts'
import { getLocationKindLabel } from '@rpg/contracts'
import { Button, CatalogPickerSheet, Text } from '@rpg/ui'

import { LocationConnectionKindStep } from '../../components/location-connection-kind-step.client'
import {
  CatalogPickerSelectionActions,
  catalogPickerShellProps,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { ContentEntityCard } from '../../lib/content-entity-card.client'
import { RelationshipDrawerContextHeader } from '../../lib/relationship/relationship-drawer-context-header.client'

import {
  ORGANIZATION_DRAWER_EDIT_TITLES,
  ORGANIZATION_DRAWER_FULLY_LINKED_REASONS,
  ORGANIZATION_DRAWER_KIND_FIELD_LABELS,
  ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS,
  type OrganizationConnectionDrawerIntent,
  organizationForwardLocationHasAvailableKind,
  ORGANIZATION_DRAWER_ADD_TITLES,
  resolveOrganizationKindsForDrawerIntent,
} from '../../lib/location-connection-drawer-intent'
import {
  buildOrganizationLocationConnectionKindOptions,
  resolveActiveConnectionKind,
} from '../../lib/location-connection-kind-options'
import { organizationLocationConnectionHasAvailableKind } from '../../lib/location-connection-duplicate-keys'
import {
  resolveOrganizationForwardAddDrawerInstruction,
  resolveOrganizationForwardAddDrawerTitle,
  resolveOrganizationForwardAddSubmitLabel,
} from '../lib/organization-location-connection-surface-copy'

export const ORGANIZATION_LOCATION_LINK_SEARCH_PLACEHOLDER = 'Search locations'
export const ORGANIZATION_LOCATION_LINK_NO_RESULTS = 'No matches for this search.'
export const ORGANIZATION_LOCATION_LINK_NO_ITEMS = 'No locations are available.'
export const ORGANIZATION_LOCATION_LINK_CHOOSE_LOCATION_MESSAGE =
  'Choose a location to see available connection types.'

type ExistingConnection = {
  id: string
  locationId: string
  kind: OrganizationLocationConnectionKind
}

export type OrganizationLocationConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  intent: OrganizationConnectionDrawerIntent
  addKind?: OrganizationLocationConnectionKind
  organizationId: string
  locations: readonly Location[]
  existingConnections: readonly ExistingConnection[]
  initialConnection?: ExistingConnection
  isSubmitting?: boolean
  onSubmit: (input: {
    locationId: string
    kind: OrganizationLocationConnectionKind
  }) => Promise<void>
}

function buildLocationSearchText(location: Location): string {
  return [location.name, getLocationKindLabel(location.kind)].join(' ')
}

export function OrganizationLocationConnectionLinkDrawer(
  props: OrganizationLocationConnectionLinkDrawerProps,
) {
  const remountKey = props.open
    ? `${props.mode}:${props.intent}:${props.addKind ?? 'none'}:${props.initialConnection?.id ?? 'add'}`
    : 'closed'

  return <OrganizationLocationConnectionLinkDrawerContent key={remountKey} {...props} />
}

// fallow-ignore-next-line complexity
function OrganizationLocationConnectionLinkDrawerContent({
  open,
  onOpenChange,
  mode,
  intent,
  addKind,
  organizationId,
  locations,
  existingConnections,
  initialConnection,
  isSubmitting = false,
  onSubmit,
}: OrganizationLocationConnectionLinkDrawerProps) {
  const resolvedAddKind = mode === 'add' && addKind != null ? addKind : undefined

  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(
    initialConnection?.locationId ?? null,
  )
  const [selectedKind, setSelectedKind] = React.useState<OrganizationLocationConnectionKind | null>(
    resolvedAddKind ?? initialConnection?.kind ?? null,
  )

  const excludeConnectionId = mode === 'edit' ? initialConnection?.id : undefined

  const eligibleLocations = React.useMemo(
    () =>
      locations.filter(
        (location) => resolveOrganizationKindsForDrawerIntent(location, intent).length > 0,
      ),
    [intent, locations],
  )

  const selectedLocation = React.useMemo(
    () => eligibleLocations.find((location) => location.id === selectedLocationId) ?? null,
    [eligibleLocations, selectedLocationId],
  )

  const kindOptions = React.useMemo(() => {
    if (!selectedLocation || resolvedAddKind) return []
    const familyKinds = resolveOrganizationKindsForDrawerIntent(selectedLocation, intent)
    return buildOrganizationLocationConnectionKindOptions({
      locationId: selectedLocation.id,
      kinds: familyKinds,
      subjectOrganizationId: organizationId,
      connections: existingConnections,
      excludeConnectionId,
    })
  }, [
    excludeConnectionId,
    existingConnections,
    intent,
    organizationId,
    resolvedAddKind,
    selectedLocation,
  ])

  const activeKind = (() => {
    if (resolvedAddKind) return resolvedAddKind
    return resolveActiveConnectionKind(
      selectedKind,
      kindOptions,
    ) as OrganizationLocationConnectionKind | null
  })()

  const showKindStep = mode === 'add' && !resolvedAddKind && Boolean(selectedLocation)

  const canSubmit = Boolean(selectedLocationId && activeKind && !isSubmitting)

  const handleSubmit = async () => {
    if (!selectedLocationId || !activeKind) return
    await onSubmit({ locationId: selectedLocationId, kind: activeKind })
  }

  const title =
    mode === 'add' && resolvedAddKind
      ? resolveOrganizationForwardAddDrawerTitle(resolvedAddKind)
      : mode === 'add'
        ? ORGANIZATION_DRAWER_ADD_TITLES[intent]
        : ORGANIZATION_DRAWER_EDIT_TITLES[intent]

  const fullyLinkedReason = ORGANIZATION_DRAWER_FULLY_LINKED_REASONS[intent]
  const instructionCopy =
    mode === 'add' && resolvedAddKind
      ? resolveOrganizationForwardAddDrawerInstruction(resolvedAddKind)
      : null

  const submitLabel =
    mode === 'add' && resolvedAddKind
      ? resolveOrganizationForwardAddSubmitLabel(resolvedAddKind)
      : mode === 'add'
        ? ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS[intent]
        : 'Save connection'

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      {...catalogPickerShellProps()}
      rowLayout="entity-card"
      searchPlaceholder={ORGANIZATION_LOCATION_LINK_SEARCH_PLACEHOLDER}
      noResultsMessage={ORGANIZATION_LOCATION_LINK_NO_RESULTS}
      noItemsMessage={ORGANIZATION_LOCATION_LINK_NO_ITEMS}
      headerBelowDescription={
        selectedLocation ? (
          <div className="space-y-4">
            <RelationshipDrawerContextHeader
              context={`${selectedLocation.name} · ${getLocationKindLabel(selectedLocation.kind)}`}
            />
            {instructionCopy ? (
              <Text variant="muted" className="text-sm">
                {instructionCopy}
              </Text>
            ) : null}
            {showKindStep ? (
              <LocationConnectionKindStep
                id="organization-location-connection-kind"
                label={ORGANIZATION_DRAWER_KIND_FIELD_LABELS[intent]}
                options={kindOptions}
                value={activeKind}
                onValueChange={(value) =>
                  setSelectedKind(value as OrganizationLocationConnectionKind)
                }
              />
            ) : null}
          </div>
        ) : null
      }
      emptyState={
        !selectedLocation ? (
          <Text variant="muted" className="text-sm" role="status">
            {ORGANIZATION_LOCATION_LINK_CHOOSE_LOCATION_MESSAGE}
          </Text>
        ) : undefined
      }
      footer={
        selectedLocation ? (
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {submitLabel}
          </Button>
        ) : undefined
      }
      items={eligibleLocations}
      getItemKey={(location) => location.id}
      getItemToolbarLabel={(location) => location.name}
      getSearchText={buildLocationSearchText}
      renderItemHeader={(location) => {
        const isSelected = selectedLocationId === location.id
        const hasAvailableKind = organizationForwardLocationHasAvailableKind(
          location,
          intent,
          organizationId,
          existingConnections,
          undefined,
          excludeConnectionId,
        )
        const kindAvailable =
          resolvedAddKind == null ||
          (resolveOrganizationKindsForDrawerIntent(location, intent).includes(resolvedAddKind) &&
            organizationLocationConnectionHasAvailableKind({
              locationId: location.id,
              kinds: [resolvedAddKind],
              subjectOrganizationId: organizationId,
              connections: existingConnections,
              excludeConnectionId,
            }))
        const canSelectLocation = resolvedAddKind ? kindAvailable : hasAvailableKind
        return (
          <ContentEntityCard
            chrome="embedded"
            density="compact"
            heading={location.name}
            subheading={canSelectLocation ? getLocationKindLabel(location.kind) : fullyLinkedReason}
            imageKey={location.imageKey}
            disabled={!canSelectLocation}
            endSlot={
              <CatalogPickerSelectionActions
                phase={resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })}
                canSelect={canSelectLocation}
                addLabel={isSelected ? 'Selected' : 'Select'}
                onAdd={() => {
                  setSelectedLocationId(location.id)
                  if (!resolvedAddKind) {
                    setSelectedKind(null)
                  }
                }}
                onRemove={() => {
                  setSelectedLocationId(null)
                  if (!resolvedAddKind) {
                    setSelectedKind(null)
                  }
                }}
              />
            }
          />
        )
      }}
    />
  )
}
