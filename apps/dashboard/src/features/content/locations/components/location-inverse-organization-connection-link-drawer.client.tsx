'use client'

import * as React from 'react'

import type {
  Location,
  LocationConnectedPartyRow,
  Organization,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import { getOrganizationKindLabel, getOrganizationLocationConnectionLabel } from '@rpg/contracts'
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
  organizationInverseSubjectHasAvailableKind,
  resolveOrganizationKindsForDrawerIntent,
} from '../../lib/location-connection-drawer-intent'
import {
  buildOrganizationInverseLocationConnections,
  buildOrganizationLocationConnectionEdgesAtLocation,
} from '../../lib/location-connection-duplicate-keys'
import {
  buildOrganizationLocationConnectionKindOptions,
  resolveActiveConnectionKind,
} from '../../lib/location-connection-kind-options'
import {
  resolveLocationInverseOrganizationAddDrawerInstruction,
  resolveLocationInverseOrganizationAddDrawerTitle,
  resolveLocationInverseOrganizationAddSubmitLabel,
  TERRITORIAL_AUTHORITY_DRAWER,
  resolveTerritorialAuthorityChangeKindCurrent,
  resolveTerritorialAuthorityLocationContext,
  resolveTerritorialAuthorityReplaceContext,
} from '../lib/location-connection-surface-copy'

export const LOCATION_INVERSE_ORG_LINK_CHOOSE_SUBJECT_MESSAGE =
  'Choose an organization to see available connection types.'

export type LocationInverseOrganizationDrawerMode = 'add' | 'changeKind' | 'replaceOrganization'

export type LocationInverseOrganizationConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: LocationInverseOrganizationDrawerMode
  intent: OrganizationConnectionDrawerIntent
  addKind?: OrganizationLocationConnectionKind
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
    ? `${props.mode}:${props.intent}:${props.addKind ?? 'none'}:${props.initialConnection?.relationshipId ?? 'add'}`
    : 'closed'

  return <LocationInverseOrganizationConnectionLinkDrawerContent key={remountKey} {...props} />
}

function hasResolvedAddKind(
  mode: LocationInverseOrganizationDrawerMode,
  addKind?: OrganizationLocationConnectionKind,
): addKind is OrganizationLocationConnectionKind {
  return mode === 'add' && addKind != null
}

// fallow-ignore-next-line complexity
function LocationInverseOrganizationConnectionLinkDrawerContent({
  open,
  onOpenChange,
  mode,
  intent,
  addKind,
  location,
  organizations,
  connectedPartyRows,
  initialConnection,
  isSubmitting = false,
  onSubmit,
}: LocationInverseOrganizationConnectionLinkDrawerProps) {
  const resolvedAddKind = hasResolvedAddKind(mode, addKind) ? addKind : undefined

  const [selectedOrganizationId, setSelectedOrganizationId] = React.useState<string | null>(
    mode === 'replaceOrganization' || mode === 'changeKind'
      ? (initialConnection?.organizationId ?? null)
      : null,
  )
  const [selectedKind, setSelectedKind] = React.useState<OrganizationLocationConnectionKind | null>(
    resolvedAddKind ?? (mode === 'replaceOrganization' ? (initialConnection?.kind ?? null) : null),
  )

  const orgRows = React.useMemo(
    () => connectedPartyRows.filter((row) => row.subject.type === 'organization'),
    [connectedPartyRows],
  )

  const excludeRelationshipId =
    mode === 'changeKind' || mode === 'replaceOrganization'
      ? initialConnection?.relationshipId
      : undefined

  const eligibleKinds = React.useMemo(
    () => resolveOrganizationKindsForDrawerIntent(location, intent),
    [intent, location],
  )

  const edgesAtLocation = React.useMemo(
    () =>
      buildOrganizationLocationConnectionEdgesAtLocation(
        orgRows.filter((row): row is typeof row & { relationshipId: string } =>
          Boolean(row.relationshipId),
        ),
        location.id,
      ),
    [location.id, orgRows],
  )

  const kindOptions = React.useMemo(() => {
    if (mode === 'replaceOrganization' || resolvedAddKind) {
      return []
    }

    const subjectOrganizationId =
      selectedOrganizationId ??
      (mode === 'changeKind' ? initialConnection?.organizationId : undefined)

    if (!subjectOrganizationId) {
      return []
    }

    const connections = buildOrganizationInverseLocationConnections(
      orgRows,
      location.id,
      subjectOrganizationId,
      excludeRelationshipId,
    )

    return buildOrganizationLocationConnectionKindOptions({
      locationId: location.id,
      kinds: eligibleKinds,
      subjectOrganizationId,
      connections,
      edgesAtLocation,
      excludeConnectionId: excludeRelationshipId,
    })
  }, [
    edgesAtLocation,
    eligibleKinds,
    excludeRelationshipId,
    initialConnection?.organizationId,
    location.id,
    mode,
    orgRows,
    resolvedAddKind,
    selectedOrganizationId,
  ])

  const activeKind = (() => {
    if (resolvedAddKind) return resolvedAddKind
    if (mode === 'replaceOrganization' && initialConnection) return initialConnection.kind

    return resolveActiveConnectionKind(
      selectedKind,
      kindOptions,
    ) as OrganizationLocationConnectionKind | null
  })()

  const showKindStep =
    mode === 'changeKind' || (mode === 'add' && !resolvedAddKind && selectedOrganizationId)

  const lockedOrganization =
    mode === 'changeKind' || mode === 'replaceOrganization'
      ? organizations.find((organization) => organization.id === initialConnection?.organizationId)
      : undefined

  const canSubmit = Boolean(
    (mode === 'changeKind'
      ? activeKind && initialConnection?.organizationId
      : selectedOrganizationId && activeKind) && !isSubmitting,
  )

  const handleSubmit = async () => {
    const organizationId =
      mode === 'changeKind' ? initialConnection?.organizationId : selectedOrganizationId
    if (!organizationId || !activeKind) return
    await onSubmit({ organizationId, kind: activeKind })
  }

  const title = (() => {
    if (mode === 'changeKind' && intent === 'territorial_authority') {
      return TERRITORIAL_AUTHORITY_DRAWER.changeKindTitle
    }
    if (mode === 'replaceOrganization' && intent === 'territorial_authority') {
      return TERRITORIAL_AUTHORITY_DRAWER.replaceTitle
    }
    if (resolvedAddKind) {
      return resolveLocationInverseOrganizationAddDrawerTitle(resolvedAddKind)
    }
    return mode === 'add'
      ? ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS[intent]
      : ORGANIZATION_DRAWER_EDIT_TITLES[intent]
  })()

  const submitLabel = (() => {
    if (mode === 'changeKind' && intent === 'territorial_authority') {
      return TERRITORIAL_AUTHORITY_DRAWER.changeKindSubmit
    }
    if (mode === 'replaceOrganization' && intent === 'territorial_authority') {
      return TERRITORIAL_AUTHORITY_DRAWER.replaceSubmit
    }
    if (resolvedAddKind) {
      return resolveLocationInverseOrganizationAddSubmitLabel(resolvedAddKind)
    }
    return mode === 'add' ? ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS[intent] : 'Save connection'
  })()

  const instructionCopy = resolvedAddKind
    ? resolveLocationInverseOrganizationAddDrawerInstruction(resolvedAddKind)
    : null

  const contextHeader = (() => {
    if (mode === 'replaceOrganization' && initialConnection && intent === 'territorial_authority') {
      return (
        <RelationshipDrawerContextHeader
          context={resolveTerritorialAuthorityReplaceContext(location, initialConnection.kind)}
        />
      )
    }

    if (mode === 'changeKind' && initialConnection && lockedOrganization) {
      if (intent === 'territorial_authority') {
        return (
          <RelationshipDrawerContextHeader
            context={resolveTerritorialAuthorityLocationContext(location)}
            current={resolveTerritorialAuthorityChangeKindCurrent({
              organizationName: lockedOrganization.name,
              kind: initialConnection.kind,
            })}
          />
        )
      }

      return (
        <RelationshipDrawerContextHeader
          context={resolveTerritorialAuthorityLocationContext(location)}
          current={`${lockedOrganization.name} · ${getOrganizationLocationConnectionLabel(initialConnection.kind)}`}
        />
      )
    }

    if (mode === 'add') {
      return (
        <RelationshipDrawerContextHeader
          context={resolveTerritorialAuthorityLocationContext(location)}
        />
      )
    }

    return null
  })()

  const fullyLinkedReason = ORGANIZATION_DRAWER_FULLY_LINKED_REASONS[intent]
  const kindFieldLabel =
    intent === 'territorial_authority'
      ? 'Authority type'
      : ORGANIZATION_DRAWER_KIND_FIELD_LABELS[intent]

  const sortedOrganizations = React.useMemo(() => {
    if (mode !== 'replaceOrganization' || !initialConnection) {
      return organizations
    }

    const current = organizations.find(
      (organization) => organization.id === initialConnection.organizationId,
    )
    const alternatives = organizations.filter(
      (organization) => organization.id !== initialConnection.organizationId,
    )

    return current ? [current, ...alternatives] : organizations
  }, [initialConnection, mode, organizations])

  const availabilityKinds = resolvedAddKind ? [resolvedAddKind] : eligibleKinds

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      {...catalogPickerShellProps()}
      rowLayout="entity-card"
      searchPlaceholder={
        intent === 'territorial_authority'
          ? TERRITORIAL_AUTHORITY_DRAWER.organizationSearchPlaceholder
          : 'Search organizations'
      }
      noResultsMessage={
        intent === 'territorial_authority'
          ? TERRITORIAL_AUTHORITY_DRAWER.organizationNoResults
          : 'No matches for this search.'
      }
      noItemsMessage="No organizations are available."
      headerBelowDescription={
        <div className="space-y-4">
          {contextHeader}
          {instructionCopy ? (
            <Text variant="muted" className="text-sm">
              {instructionCopy}
            </Text>
          ) : null}
          {showKindStep ? (
            <LocationConnectionKindStep
              id="location-inverse-organization-connection-kind"
              label={kindFieldLabel}
              options={kindOptions}
              value={activeKind}
              onValueChange={(value) =>
                setSelectedKind(value as OrganizationLocationConnectionKind)
              }
            />
          ) : null}
          {mode === 'replaceOrganization' ? (
            <Text variant="muted" className="text-sm">
              {TERRITORIAL_AUTHORITY_DRAWER.replaceHelper}
            </Text>
          ) : null}
        </div>
      }
      emptyState={
        mode === 'add' && !resolvedAddKind && !selectedOrganizationId ? (
          <Text variant="muted" className="text-sm" role="status">
            {LOCATION_INVERSE_ORG_LINK_CHOOSE_SUBJECT_MESSAGE}
          </Text>
        ) : undefined
      }
      footer={
        (mode === 'changeKind' || selectedOrganizationId) && activeKind ? (
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {submitLabel}
          </Button>
        ) : undefined
      }
      items={mode === 'changeKind' ? [] : sortedOrganizations}
      getItemKey={(organization) => organization.id}
      getItemToolbarLabel={(organization) => organization.name}
      getSearchText={(organization) =>
        [organization.name, getOrganizationKindLabel(organization.organizationKind)].join(' ')
      }
      renderItemHeader={(organization) => {
        const isCurrentPinned =
          mode === 'replaceOrganization' && organization.id === initialConnection?.organizationId

        if (isCurrentPinned && lockedOrganization) {
          return (
            <ContentEntityCard
              chrome="embedded"
              density="compact"
              heading={lockedOrganization.name}
              subheading={getOrganizationKindLabel(lockedOrganization.organizationKind)}
              imageKey={lockedOrganization.imageKey}
              disabled
              endSlot={
                <CatalogPickerSelectionActions
                  phase={resolveCatalogPickerRowActionPhase({ isSelected: true, isSuccess: false })}
                  canSelect={false}
                  addLabel={TERRITORIAL_AUTHORITY_DRAWER.replaceSelectedLabel}
                  onAdd={() => undefined}
                  onRemove={() => undefined}
                />
              }
            />
          )
        }

        const isSelected = selectedOrganizationId === organization.id
        const hasAvailableKind = organizationInverseSubjectHasAvailableKind(
          organization.id,
          location.id,
          availabilityKinds,
          orgRows,
          excludeRelationshipId,
        )
        const phase = resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })

        return (
          <ContentEntityCard
            chrome="embedded"
            density="compact"
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
                  if (!resolvedAddKind) {
                    setSelectedKind(null)
                  }
                }}
                onRemove={() => {
                  setSelectedOrganizationId(null)
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
