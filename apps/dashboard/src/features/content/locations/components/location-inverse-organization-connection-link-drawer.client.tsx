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
  RELATIONSHIP_DRAWER_ORGANIZATION_FIELD_LABEL,
  RELATIONSHIP_DRAWER_RELATIONSHIP_TYPE_FIELD_LABEL,
} from '../../lib/relationship/relationship-drawer-field-labels'
import { RelationshipDrawerSubjectField } from '../../lib/relationship/relationship-drawer-subject-field.client'

import {
  ORGANIZATION_DRAWER_CHANGE_KIND_SUBMIT_LABEL,
  ORGANIZATION_DRAWER_CHANGE_KIND_TITLE,
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
  buildOrganizationLocationChangeKindOptions,
  buildOrganizationLocationConnectionKindOptions,
  resolveActiveConnectionKind,
} from '../../lib/location-connection-kind-options'
import {
  resolveLocationInverseOrganizationAddDrawerInstruction,
  resolveLocationInverseOrganizationAddDrawerTitle,
  resolveLocationInverseOrganizationAddSubmitLabel,
  TERRITORIAL_AUTHORITY_DRAWER,
  LOCATION_INVERSE_ORGANIZATION_DRAWER,
  resolveTerritorialAuthorityLocationContext,
  resolveTerritorialAuthorityReplaceContext,
} from '../lib/location-connection-surface-copy'

export const LOCATION_INVERSE_ORG_LINK_CHOOSE_SUBJECT_MESSAGE =
  'Choose an organization to see available connection types.'

import type { OrganizationInverseDrawerMode } from '../../lib/relationship/relationship-mutation-mode'
export type LocationInverseOrganizationConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: OrganizationInverseDrawerMode
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
  mode: OrganizationInverseDrawerMode,
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
    resolvedAddKind ??
      (mode === 'changeKind' || mode === 'replaceOrganization'
        ? (initialConnection?.kind ?? null)
        : null),
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

    if (mode === 'changeKind' && initialConnection) {
      return buildOrganizationLocationChangeKindOptions({
        location,
        intent,
        currentKind: initialConnection.kind,
        subjectOrganizationId,
        connections,
        edgesAtLocation,
        excludeConnectionId: excludeRelationshipId,
      })
    }

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
    initialConnection,
    intent,
    location,
    mode,
    orgRows,
    resolvedAddKind,
    selectedOrganizationId,
  ])

  const activeKind = (() => {
    if (resolvedAddKind) return resolvedAddKind
    if (mode === 'replaceOrganization' && initialConnection) return initialConnection.kind
    if (mode === 'changeKind') {
      return selectedKind ?? initialConnection?.kind ?? null
    }

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

  const hasChange = mode !== 'changeKind' || activeKind !== initialConnection?.kind
  const canSubmit = Boolean(
    (mode === 'changeKind'
      ? activeKind && initialConnection?.organizationId
      : selectedOrganizationId && activeKind) &&
    hasChange &&
    !isSubmitting,
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
    if (mode === 'changeKind') {
      return ORGANIZATION_DRAWER_CHANGE_KIND_TITLE
    }
    if (mode === 'replaceOrganization') {
      return intent === 'territorial_authority'
        ? TERRITORIAL_AUTHORITY_DRAWER.replaceTitle
        : LOCATION_INVERSE_ORGANIZATION_DRAWER.replaceTitle
    }
    if (resolvedAddKind) {
      return resolveLocationInverseOrganizationAddDrawerTitle(resolvedAddKind)
    }
    return mode === 'add'
      ? ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS[intent]
      : ORGANIZATION_DRAWER_CHANGE_KIND_TITLE
  })()

  const submitLabel = (() => {
    if (mode === 'changeKind' && intent === 'territorial_authority') {
      return TERRITORIAL_AUTHORITY_DRAWER.changeKindSubmit
    }
    if (mode === 'changeKind') {
      return ORGANIZATION_DRAWER_CHANGE_KIND_SUBMIT_LABEL
    }
    if (mode === 'replaceOrganization') {
      return intent === 'territorial_authority'
        ? TERRITORIAL_AUTHORITY_DRAWER.replaceSubmit
        : LOCATION_INVERSE_ORGANIZATION_DRAWER.replaceSubmit
    }
    if (resolvedAddKind) {
      return resolveLocationInverseOrganizationAddSubmitLabel(resolvedAddKind)
    }
    return mode === 'add'
      ? ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS[intent]
      : ORGANIZATION_DRAWER_CHANGE_KIND_SUBMIT_LABEL
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

    if (mode === 'add' || mode === 'changeKind' || mode === 'replaceOrganization') {
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

  const showOrganizationPicker = mode === 'add' || mode === 'replaceOrganization'

  const sortedOrganizations = React.useMemo(() => {
    if (!showOrganizationPicker || !initialConnection || mode !== 'replaceOrganization') {
      return showOrganizationPicker ? organizations : []
    }

    const current = organizations.find(
      (organization) => organization.id === initialConnection.organizationId,
    )
    const alternatives = organizations.filter(
      (organization) => organization.id !== initialConnection.organizationId,
    )

    return current ? [current, ...alternatives] : organizations
  }, [initialConnection, mode, organizations, showOrganizationPicker])

  const availabilityKinds = React.useMemo(() => {
    const kinds =
      mode === 'replaceOrganization' && initialConnection
        ? [initialConnection.kind]
        : resolvedAddKind
          ? [resolvedAddKind]
          : eligibleKinds

    return kinds.filter((kind) => eligibleKinds.includes(kind))
  }, [eligibleKinds, initialConnection, mode, resolvedAddKind])

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      {...catalogPickerShellProps()}
      rowLayout="entity-card"
      pickerEnabled={showOrganizationPicker}
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
          {mode === 'changeKind' && lockedOrganization ? (
            <RelationshipDrawerSubjectField
              label={RELATIONSHIP_DRAWER_ORGANIZATION_FIELD_LABEL}
              value={lockedOrganization.name}
            />
          ) : null}
          {mode === 'replaceOrganization' && initialConnection ? (
            <RelationshipDrawerSubjectField
              label={RELATIONSHIP_DRAWER_RELATIONSHIP_TYPE_FIELD_LABEL}
              value={getOrganizationLocationConnectionLabel(initialConnection.kind)}
            />
          ) : null}
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
              defaultExpanded={mode === 'changeKind'}
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
      items={showOrganizationPicker ? sortedOrganizations : []}
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
