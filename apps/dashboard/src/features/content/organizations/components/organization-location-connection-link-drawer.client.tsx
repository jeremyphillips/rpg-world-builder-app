'use client'

import * as React from 'react'

import type { Location, OrganizationLocationConnectionKind } from '@rpg/contracts'
import { getLocationKindLabel, resolveLocationConnectionEligibility } from '@rpg/contracts'
import { Button, CatalogPickerSheet, SelectField, Text } from '@rpg/ui'

import { catalogPickerShellProps } from '@/features/character'

import { toLocationConnectionEligibilityInput } from '../../lib/location-connection-eligibility-input'
import {
  buildOrganizationLocationConnectionKindOptions,
  LOCATION_CONNECTION_KIND_FIELD_LABEL,
} from '../../lib/location-connection-kind-options'
import {
  buildOrganizationLocationConnectionKeySet,
  organizationLocationConnectionKey,
} from '../../lib/location-connection-duplicate-keys'
import { OrganizationLocationLinkDrawerItem } from './organization-location-link-drawer-item.client'

export const ORGANIZATION_LOCATION_LINK_DRAWER_ADD_TITLE = 'Link location'
export const ORGANIZATION_LOCATION_LINK_DRAWER_EDIT_TITLE = 'Edit location connection'
export const ORGANIZATION_LOCATION_LINK_SUBMIT_ADD_LABEL = 'Link location'
export const ORGANIZATION_LOCATION_LINK_SUBMIT_EDIT_LABEL = 'Save connection'
export const ORGANIZATION_LOCATION_LINK_CHOOSE_LOCATION_MESSAGE =
  'Choose a location to see available connection types.'
export const ORGANIZATION_LOCATION_LINK_SEARCH_PLACEHOLDER = 'Search locations'
export const ORGANIZATION_LOCATION_LINK_NO_RESULTS = 'No matches for this search.'
export const ORGANIZATION_LOCATION_LINK_NO_ITEMS = 'No locations are available.'

type ExistingConnection = {
  id: string
  locationId: string
  kind: OrganizationLocationConnectionKind
}

export type OrganizationLocationConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
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

function locationHasAvailableKind(location: Location, existingKeys: ReadonlySet<string>): boolean {
  const eligibility = resolveLocationConnectionEligibility(
    toLocationConnectionEligibilityInput(location),
  )
  return eligibility.organizationKinds.some(
    (kind) => !existingKeys.has(organizationLocationConnectionKey(location.id, kind)),
  )
}

export function OrganizationLocationConnectionLinkDrawer(
  props: OrganizationLocationConnectionLinkDrawerProps,
) {
  const remountKey = props.open ? `${props.mode}:${props.initialConnection?.id ?? 'add'}` : 'closed'

  return <OrganizationLocationConnectionLinkDrawerContent key={remountKey} {...props} />
}

// fallow-ignore-next-line complexity
function OrganizationLocationConnectionLinkDrawerContent({
  open,
  onOpenChange,
  mode,
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

  const selectedLocation = React.useMemo(
    () => locations.find((location) => location.id === selectedLocationId) ?? null,
    [locations, selectedLocationId],
  )

  const kindOptions = React.useMemo(() => {
    if (!selectedLocation) return []
    const eligibility = resolveLocationConnectionEligibility(
      toLocationConnectionEligibilityInput(selectedLocation),
    )
    const disabledKinds = new Set(
      eligibility.organizationKinds.filter((kind) =>
        existingKeys.has(organizationLocationConnectionKey(selectedLocation.id, kind)),
      ),
    )
    return buildOrganizationLocationConnectionKindOptions(
      eligibility.organizationKinds,
      disabledKinds,
    )
  }, [existingKeys, selectedLocation])

  const activeKind =
    selectedKind && kindOptions.some((option) => option.value === selectedKind && !option.disabled)
      ? selectedKind
      : null

  const canSubmit = Boolean(selectedLocationId && activeKind && !isSubmitting)

  const handleSubmit = async () => {
    if (!selectedLocationId || !activeKind) return
    await onSubmit({ locationId: selectedLocationId, kind: activeKind })
  }

  const title =
    mode === 'add'
      ? ORGANIZATION_LOCATION_LINK_DRAWER_ADD_TITLE
      : ORGANIZATION_LOCATION_LINK_DRAWER_EDIT_TITLE

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
          <SelectField
            id="organization-location-connection-kind"
            label={LOCATION_CONNECTION_KIND_FIELD_LABEL}
            value={activeKind ?? ''}
            placeholder="Choose connection type…"
            options={kindOptions.map((option) => ({
              value: option.value,
              label: option.label,
              disabled: option.disabled,
              description: option.disabled ? option.disabledReason : option.description,
            }))}
            onValueChange={(value) => setSelectedKind(value as OrganizationLocationConnectionKind)}
          />
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
          <div className="flex justify-end border-t border-border px-4 py-3">
            <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
              {mode === 'add'
                ? ORGANIZATION_LOCATION_LINK_SUBMIT_ADD_LABEL
                : ORGANIZATION_LOCATION_LINK_SUBMIT_EDIT_LABEL}
            </Button>
          </div>
        ) : null
      }
      items={locations}
      getItemKey={(location) => location.id}
      getItemToolbarLabel={(location) => location.name}
      getSearchText={buildLocationSearchText}
      renderItemHeader={(location) => (
        <OrganizationLocationLinkDrawerItem
          location={location}
          isSelected={selectedLocationId === location.id}
          hasAvailableKind={locationHasAvailableKind(location, existingKeys)}
          onSelect={() => {
            setSelectedLocationId(location.id)
            setSelectedKind(null)
          }}
          onClear={() => {
            setSelectedLocationId(null)
            setSelectedKind(null)
          }}
        />
      )}
    />
  )
}
