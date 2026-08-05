'use client'

import * as React from 'react'

import type {
  Location,
  LocationConnectedPartyRow,
  Organization,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { getOrganizationKindLabel, resolveLocationConnectionEligibility } from '@rpg/contracts'
import { Button, CatalogPickerSheet, SelectField, Text } from '@rpg/ui'

import { catalogPickerShellProps } from '@/features/character'

import { toLocationConnectionEligibilityInput } from '../../lib/location-connection-eligibility-input'
import {
  buildOrganizationLocationConnectionKindOptions,
  LOCATION_CONNECTION_KIND_FIELD_LABEL,
} from '../../lib/location-connection-kind-options'
import {
  buildSubjectLocationConnectionKeySet,
  subjectLocationConnectionKey,
} from '../../lib/location-connection-duplicate-keys'
import { LocationInverseOrganizationLinkDrawerItem } from './location-inverse-organization-link-drawer-item.client'

export const LOCATION_INVERSE_ORG_LINK_DRAWER_ADD_TITLE = 'Link organization'
export const LOCATION_INVERSE_ORG_LINK_DRAWER_EDIT_TITLE = 'Edit organization connection'
export const LOCATION_INVERSE_ORG_LINK_SUBMIT_ADD_LABEL = 'Link organization'
export const LOCATION_INVERSE_ORG_LINK_SUBMIT_EDIT_LABEL = 'Save connection'
export const LOCATION_INVERSE_ORG_LINK_CHOOSE_SUBJECT_MESSAGE =
  'Choose an organization to see available connection types.'

export type LocationInverseOrganizationConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  location: Location
  organizations: readonly Organization[]
  connectedPartyRows: readonly LocationConnectedPartyRow[]
  initialConnection?: {
    relationshipId: string
    organizationId: string
    kind: OrganizationLocationConnectionKind
  }
  isSubmitting?: boolean
  onSubmit: (input: {
    organizationId: string
    kind: OrganizationLocationConnectionKind
  }) => Promise<void>
}

function organizationHasAvailableKind(
  organizationId: string,
  eligibleKinds: readonly OrganizationLocationConnectionKind[],
  existingKeys: ReadonlySet<string>,
): boolean {
  return eligibleKinds.some(
    (kind) => !existingKeys.has(subjectLocationConnectionKey(organizationId, kind)),
  )
}

export function LocationInverseOrganizationConnectionLinkDrawer(
  props: LocationInverseOrganizationConnectionLinkDrawerProps,
) {
  const remountKey = props.open
    ? `${props.mode}:${props.initialConnection?.relationshipId ?? 'add'}`
    : 'closed'

  return <LocationInverseOrganizationConnectionLinkDrawerContent key={remountKey} {...props} />
}

// fallow-ignore-next-line complexity
function LocationInverseOrganizationConnectionLinkDrawerContent({
  open,
  onOpenChange,
  mode,
  location,
  organizations,
  connectedPartyRows,
  initialConnection,
  isSubmitting = false,
  onSubmit,
}: LocationInverseOrganizationConnectionLinkDrawerProps) {
  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string | null>(
    initialConnection?.organizationId ?? null,
  )
  const [selectedKind, setSelectedKind] = React.useState<OrganizationLocationConnectionKind | null>(
    initialConnection?.kind ?? null,
  )

  const orgRows = React.useMemo(
    () => connectedPartyRows.filter((row) => row.subject.type === 'organization'),
    [connectedPartyRows],
  )

  const existingKeys = React.useMemo(
    () =>
      buildSubjectLocationConnectionKeySet(
        orgRows,
        mode === 'edit' ? initialConnection?.relationshipId : undefined,
      ),
    [initialConnection?.relationshipId, mode, orgRows],
  )

  const eligibleKinds = React.useMemo(
    () =>
      resolveLocationConnectionEligibility(toLocationConnectionEligibilityInput(location))
        .organizationKinds,
    [location],
  )

  const kindOptions = React.useMemo(() => {
    if (!selectedOrganizationId) return []
    const disabledKinds = new Set(
      eligibleKinds.filter((kind) =>
        existingKeys.has(subjectLocationConnectionKey(selectedOrganizationId, kind)),
      ),
    )
    return buildOrganizationLocationConnectionKindOptions(eligibleKinds, disabledKinds)
  }, [eligibleKinds, existingKeys, selectedOrganizationId])

  const activeKind =
    selectedKind && kindOptions.some((option) => option.value === selectedKind && !option.disabled)
      ? selectedKind
      : null

  const canSubmit = Boolean(selectedOrganizationId && activeKind && !isSubmitting)

  const handleSubmit = async () => {
    if (!selectedOrganizationId || !activeKind) return
    await onSubmit({ organizationId: selectedOrganizationId, kind: activeKind })
  }

  const title =
    mode === 'add'
      ? LOCATION_INVERSE_ORG_LINK_DRAWER_ADD_TITLE
      : LOCATION_INVERSE_ORG_LINK_DRAWER_EDIT_TITLE

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      {...catalogPickerShellProps()}
      searchPlaceholder="Search organizations"
      noResultsMessage="No matches for this search."
      noItemsMessage="No organizations are available."
      headerBelowDescription={
        selectedOrganizationId ? (
          <SelectField
            id="location-inverse-organization-connection-kind"
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
        !selectedOrganizationId ? (
          <Text variant="muted" className="text-sm" role="status">
            {LOCATION_INVERSE_ORG_LINK_CHOOSE_SUBJECT_MESSAGE}
          </Text>
        ) : undefined
      }
      footer={
        selectedOrganizationId ? (
          <div className="flex justify-end border-t border-border px-4 py-3">
            <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
              {mode === 'add'
                ? LOCATION_INVERSE_ORG_LINK_SUBMIT_ADD_LABEL
                : LOCATION_INVERSE_ORG_LINK_SUBMIT_EDIT_LABEL}
            </Button>
          </div>
        ) : null
      }
      items={organizations}
      getItemKey={(organization) => organization.id}
      getItemToolbarLabel={(organization) => organization.name}
      getSearchText={(organization) =>
        [organization.name, getOrganizationKindLabel(organization.organizationKind)].join(' ')
      }
      renderItemHeader={(organization) => (
        <LocationInverseOrganizationLinkDrawerItem
          organization={organization}
          isSelected={selectedOrganizationId === organization.id}
          hasAvailableKind={organizationHasAvailableKind(
            organization.id,
            eligibleKinds,
            existingKeys,
          )}
          onSelect={() => {
            setSelectedOrganizationId(organization.id)
            setSelectedKind(null)
          }}
          onClear={() => {
            setSelectedOrganizationId(null)
            setSelectedKind(null)
          }}
        />
      )}
    />
  )
}
