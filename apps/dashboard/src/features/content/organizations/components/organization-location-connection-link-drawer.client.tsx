'use client'

import * as React from 'react'

import type { Location, OrganizationLocationConnectionKind } from '@rpg/contracts'
import { getLocationKindLabel } from '@rpg/contracts'
import { Button, CatalogPickerSheet, Heading, Text } from '@rpg/ui'

import { LocationConnectionKindStep } from '../../components/location-connection-kind-step.client'
import {
  CatalogPickerSelectionActions,
  catalogPickerShellProps,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { ContentEntityPickerRow } from '../../lib/content-entity-picker-row.client'

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
  buildOrganizationLocationConnectionKeySet,
  organizationLocationConnectionKey,
} from '../../lib/location-connection-duplicate-keys'
import {
  buildOrganizationLocationConnectionKindOptions,
  resolveActiveConnectionKind,
} from '../../lib/location-connection-kind-options'

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
    ? `${props.mode}:${props.intent}:${props.initialConnection?.id ?? 'add'}`
    : 'closed'

  return <OrganizationLocationConnectionLinkDrawerContent key={remountKey} {...props} />
}

// fallow-ignore-next-line complexity
function OrganizationLocationConnectionLinkDrawerContent({
  open,
  onOpenChange,
  mode,
  intent,
  locations,
  existingConnections,
  initialConnection,
  isSubmitting = false,
  onSubmit,
}: OrganizationLocationConnectionLinkDrawerProps) {
  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(
    initialConnection?.locationId ?? null,
  )
  const [selectedKind, setSelectedKind] = React.useState<OrganizationLocationConnectionKind | null>(
    initialConnection?.kind ?? null,
  )

  const excludeConnectionId = mode === 'edit' ? initialConnection?.id : undefined
  const existingKeys = React.useMemo(
    () => buildOrganizationLocationConnectionKeySet(existingConnections, excludeConnectionId),
    [existingConnections, excludeConnectionId],
  )

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
    if (!selectedLocation) return []
    const familyKinds = resolveOrganizationKindsForDrawerIntent(selectedLocation, intent)
    const disabledKinds = new Set(
      familyKinds.filter((kind) =>
        existingKeys.has(organizationLocationConnectionKey(selectedLocation.id, kind)),
      ),
    )
    return buildOrganizationLocationConnectionKindOptions(familyKinds, disabledKinds)
  }, [existingKeys, intent, selectedLocation])

  const activeKind = resolveActiveConnectionKind(
    selectedKind,
    kindOptions,
  ) as OrganizationLocationConnectionKind | null

  const canSubmit = Boolean(selectedLocationId && activeKind && !isSubmitting)

  const handleSubmit = async () => {
    if (!selectedLocationId || !activeKind) return
    await onSubmit({ locationId: selectedLocationId, kind: activeKind })
  }

  const title =
    mode === 'add'
      ? ORGANIZATION_DRAWER_ADD_TITLES[intent]
      : ORGANIZATION_DRAWER_EDIT_TITLES[intent]

  const fullyLinkedReason = ORGANIZATION_DRAWER_FULLY_LINKED_REASONS[intent]

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      {...catalogPickerShellProps()}
      searchPlaceholder={ORGANIZATION_LOCATION_LINK_SEARCH_PLACEHOLDER}
      noResultsMessage={ORGANIZATION_LOCATION_LINK_NO_RESULTS}
      noItemsMessage={ORGANIZATION_LOCATION_LINK_NO_ITEMS}
      headerBelowDescription={
        selectedLocation ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <Heading variant="label" as="p">
                Location
              </Heading>
              <Text>
                {selectedLocation.name} · {getLocationKindLabel(selectedLocation.kind)}
              </Text>
            </div>
            <LocationConnectionKindStep
              id="organization-location-connection-kind"
              label={ORGANIZATION_DRAWER_KIND_FIELD_LABELS[intent]}
              options={kindOptions}
              value={activeKind}
              onValueChange={(value) =>
                setSelectedKind(value as OrganizationLocationConnectionKind)
              }
            />
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
            {mode === 'add' ? ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS[intent] : 'Save connection'}
          </Button>
        ) : undefined
      }
      items={eligibleLocations}
      getItemKey={(location) => location.id}
      getItemToolbarLabel={(location) => location.name}
      getSearchText={buildLocationSearchText}
      renderItemHeader={(location) => {
        const hasAvailableKind = organizationForwardLocationHasAvailableKind(
          location,
          intent,
          existingKeys,
        )

        return (
          <ContentEntityPickerRow
            heading={location.name}
            subheading={hasAvailableKind ? getLocationKindLabel(location.kind) : fullyLinkedReason}
            imageKey={location.imageKey}
            disabled={!hasAvailableKind}
          />
        )
      }}
      renderItemActions={(location) => {
        const isSelected = selectedLocationId === location.id
        const hasAvailableKind = organizationForwardLocationHasAvailableKind(
          location,
          intent,
          existingKeys,
        )
        const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

        return (
          <CatalogPickerSelectionActions
            phase={phase}
            canSelect={hasAvailableKind}
            addLabel={isSelected ? 'Selected' : 'Select'}
            onAdd={() => {
              setSelectedLocationId(location.id)
              setSelectedKind(null)
            }}
            onRemove={() => {
              setSelectedLocationId(null)
              setSelectedKind(null)
            }}
          />
        )
      }}
    />
  )
}
