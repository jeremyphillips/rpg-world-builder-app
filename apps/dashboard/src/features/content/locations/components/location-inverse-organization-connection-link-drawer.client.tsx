'use client'

import * as React from 'react'

import type {
  Location,
  LocationConnectedPartyRow,
  Organization,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { getOrganizationKindLabel } from '@rpg/contracts'
import { Button, CatalogPickerSheet, Text } from '@rpg/ui'

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
  organizationInverseSubjectHasAvailableKind,
  resolveLocationInverseOrganizationAddTitle,
  resolveOrganizationKindsForDrawerIntent,
} from '../../lib/location-connection-drawer-intent'
import {
  buildSubjectLocationConnectionKeySet,
  subjectLocationConnectionKey,
} from '../../lib/location-connection-duplicate-keys'
import {
  buildOrganizationLocationConnectionKindOptions,
  resolveActiveConnectionKind,
} from '../../lib/location-connection-kind-options'

export const LOCATION_INVERSE_ORG_LINK_CHOOSE_SUBJECT_MESSAGE =
  'Choose an organization to see available connection types.'

export type LocationInverseOrganizationConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  intent: OrganizationConnectionDrawerIntent
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

export function LocationInverseOrganizationConnectionLinkDrawer(
  props: LocationInverseOrganizationConnectionLinkDrawerProps,
) {
  const remountKey = props.open
    ? `${props.mode}:${props.intent}:${props.initialConnection?.relationshipId ?? 'add'}`
    : 'closed'

  return <LocationInverseOrganizationConnectionLinkDrawerContent key={remountKey} {...props} />
}

// fallow-ignore-next-line complexity
function LocationInverseOrganizationConnectionLinkDrawerContent({
  open,
  onOpenChange,
  mode,
  intent,
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
    () => resolveOrganizationKindsForDrawerIntent(location, intent),
    [intent, location],
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

  const activeKind = resolveActiveConnectionKind(
    selectedKind,
    kindOptions,
  ) as OrganizationLocationConnectionKind | null

  const canSubmit = Boolean(selectedOrganizationId && activeKind && !isSubmitting)

  const handleSubmit = async () => {
    if (!selectedOrganizationId || !activeKind) return
    await onSubmit({ organizationId: selectedOrganizationId, kind: activeKind })
  }

  const title =
    mode === 'add'
      ? resolveLocationInverseOrganizationAddTitle(intent, location)
      : ORGANIZATION_DRAWER_EDIT_TITLES[intent]

  const submitAddLabel =
    mode === 'add'
      ? intent === 'territorial_authority' && location.kind === 'settlement'
        ? 'Add governing organization'
        : ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS[intent]
      : 'Save connection'

  const fullyLinkedReason = ORGANIZATION_DRAWER_FULLY_LINKED_REASONS[intent]

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
          <LocationConnectionKindStep
            id="location-inverse-organization-connection-kind"
            label={ORGANIZATION_DRAWER_KIND_FIELD_LABELS[intent]}
            options={kindOptions}
            value={activeKind}
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
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {mode === 'add' ? submitAddLabel : 'Save connection'}
          </Button>
        ) : undefined
      }
      items={organizations}
      getItemKey={(organization) => organization.id}
      getItemToolbarLabel={(organization) => organization.name}
      getSearchText={(organization) =>
        [organization.name, getOrganizationKindLabel(organization.organizationKind)].join(' ')
      }
      renderItemHeader={(organization) => {
        const isSelected = selectedOrganizationId === organization.id
        const hasAvailableKind = organizationInverseSubjectHasAvailableKind(
          organization.id,
          eligibleKinds,
          existingKeys,
        )
        const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

        return (
          <ContentEntityPickerRow
            heading={organization.name}
            subheading={
              hasAvailableKind
                ? getOrganizationKindLabel(organization.organizationKind)
                : fullyLinkedReason
            }
            imageKey={organization.imageKey}
            disabled={!hasAvailableKind}
            endSlot={
              <CatalogPickerSelectionActions
                phase={phase}
                canSelect={hasAvailableKind}
                addLabel={isSelected ? 'Selected' : 'Select'}
                onAdd={() => {
                  setSelectedOrganizationId(organization.id)
                  setSelectedKind(null)
                }}
                onRemove={() => {
                  setSelectedOrganizationId(null)
                  setSelectedKind(null)
                }}
              />
            }
          />
        )
      }}
    />
  )
}
