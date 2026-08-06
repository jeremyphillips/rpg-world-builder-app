'use client'

import * as React from 'react'

import type {
  Location,
  Organization,
  OrganizationLocationConnectionEdgeAtLocation,
  OrganizationLocationConnectionKind,
} from '@rpg/contracts'
import {
  getLocationKindLabel,
  getOrganizationKindLabel,
  getOrganizationLocationConnectionLabel,
} from '@rpg/contracts'
import { Button, CatalogPickerSheet, Heading, Text } from '@rpg/ui'

import { LocationConnectionKindStep } from '../../components/location-connection-kind-step.client'
import {
  CatalogPickerSelectionActions,
  catalogPickerShellProps,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { ContentEntityCard } from '../../lib/content-entity-card.client'
import { RelationshipDrawerContextHeader } from '../../lib/relationship/relationship-drawer-context-header.client'
import { RELATIONSHIP_DRAWER_LOCATION_FIELD_LABEL } from '../../lib/relationship/relationship-drawer-field-labels'
import { RelationshipDrawerSubjectField } from '../../lib/relationship/relationship-drawer-subject-field.client'
import {
  RELATIONSHIP_ALTERNATIVES_EMPTY_MESSAGES,
  resolveRelationshipAlternatives,
} from '../../lib/relationship/relationship-alternatives'

import {
  ORGANIZATION_DRAWER_ADD_TITLES,
  ORGANIZATION_DRAWER_CHANGE_KIND_SUBMIT_LABEL,
  ORGANIZATION_DRAWER_CHANGE_KIND_TITLE,
  ORGANIZATION_DRAWER_CHANGE_TARGET_SUBMIT_LABEL,
  ORGANIZATION_DRAWER_CHANGE_TARGET_TITLE,
  ORGANIZATION_DRAWER_FULLY_LINKED_REASONS,
  ORGANIZATION_DRAWER_KIND_FIELD_LABELS,
  ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS,
  type OrganizationConnectionDrawerIntent,
  filterLocationsForOrganizationKind,
  locationEligibleForOrganizationKind,
  resolveKindsForOrganizationDrawerIntent,
  resolveEdgesAtLocation,
} from '../../lib/location-connection-drawer-intent'
import {
  buildOrganizationFamilyKindOptions,
  resolveActiveConnectionKind,
  type LocationConnectionKindOption,
} from '../../lib/location-connection-kind-options'
import { organizationLocationConnectionHasAvailableKind } from '../../lib/location-connection-duplicate-keys'
import type { OrganizationForwardDrawerMode } from '../../lib/relationship/relationship-mutation-mode'
import {
  resolveOrganizationForwardAddDrawerInstruction,
  resolveOrganizationForwardAddDrawerTitle,
  resolveOrganizationForwardAddSubmitLabel,
  resolveOrganizationForwardFamilyAddDrawerHelper,
} from '../lib/organization-location-connection-surface-copy'

export const ORGANIZATION_LOCATION_LINK_SEARCH_PLACEHOLDER = 'Search locations…'
export const ORGANIZATION_LOCATION_LINK_FIELD_LABEL = 'Location'
export const ORGANIZATION_LOCATION_LINK_NO_RESULTS = 'No matches for this search.'
export const ORGANIZATION_LOCATION_LINK_NO_ITEMS = 'No locations are available.'
export const ORGANIZATION_LOCATION_LINK_CHOOSE_KIND_MESSAGE =
  'Choose a relationship type to see eligible locations.'

const ORGANIZATION_DRAWER_KIND_CHANGE_LABEL = 'Change'

type ExistingConnection = {
  id: string
  locationId: string
  kind: OrganizationLocationConnectionKind
}

export type OrganizationLocationConnectionDrawerAlternatives = {
  changeKind?: LocationConnectionKindOption[]
  changeTarget?: Location[]
}

export type OrganizationLocationConnectionLinkDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: OrganizationForwardDrawerMode
  intent: OrganizationConnectionDrawerIntent
  addKind?: OrganizationLocationConnectionKind
  organization: Pick<Organization, 'name' | 'organizationKind'>
  organizationId: string
  locations: readonly Location[]
  existingConnections: readonly ExistingConnection[]
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >
  occupancyLoaded?: boolean
  initialConnection?: ExistingConnection
  drawerAlternatives?: OrganizationLocationConnectionDrawerAlternatives
  isSubmitting?: boolean
  onSubmit: (input: {
    locationId: string
    kind: OrganizationLocationConnectionKind
  }) => Promise<void>
}

function buildLocationSearchText(location: Location): string {
  return [location.name, getLocationKindLabel(location.kind)].join(' ')
}

function resolveDefaultAddKind(
  intent: OrganizationConnectionDrawerIntent,
): OrganizationLocationConnectionKind | null {
  if (intent === 'geographic_presence') {
    return 'operates_in'
  }
  return null
}

function shouldShowFamilyKindStep(
  mode: OrganizationForwardDrawerMode,
  intent: OrganizationConnectionDrawerIntent,
  resolvedAddKind?: OrganizationLocationConnectionKind,
): boolean {
  if (resolvedAddKind || mode === 'changeKind' || mode === 'changeTarget') {
    return false
  }
  return resolveKindsForOrganizationDrawerIntent(intent).length > 1
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
  organization,
  organizationId,
  locations,
  existingConnections,
  edgesByLocationId,
  occupancyLoaded = true,
  initialConnection,
  drawerAlternatives,
  isSubmitting = false,
  onSubmit,
}: OrganizationLocationConnectionLinkDrawerProps) {
  const resolvedAddKind = mode === 'add' && addKind != null ? addKind : undefined
  const defaultAddKind = mode === 'add' ? resolveDefaultAddKind(intent) : null

  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(
    mode === 'changeTarget' ? null : (initialConnection?.locationId ?? null),
  )
  const [selectedKind, setSelectedKind] = React.useState<OrganizationLocationConnectionKind | null>(
    resolvedAddKind ?? defaultAddKind ?? initialConnection?.kind ?? null,
  )

  const excludeConnectionId =
    mode === 'changeKind' || mode === 'changeTarget' ? initialConnection?.id : undefined
  const showKindStep = shouldShowFamilyKindStep(mode, intent, resolvedAddKind)

  const mutationAlternatives = React.useMemo(() => {
    if (drawerAlternatives) {
      return drawerAlternatives
    }
    if ((mode === 'changeKind' || mode === 'changeTarget') && initialConnection && organizationId) {
      return resolveRelationshipAlternatives({
        surface: 'organization_forward',
        canManage: true,
        occupancyLoaded,
        relationship: {
          connectionId: initialConnection.id,
          locationId: initialConnection.locationId,
          kind: initialConnection.kind,
          subjectOrganizationId: organizationId,
        },
        locations,
        connections: existingConnections,
        edgesByLocationId,
      }).alternatives
    }
    return undefined
  }, [
    drawerAlternatives,
    edgesByLocationId,
    existingConnections,
    initialConnection,
    locations,
    mode,
    occupancyLoaded,
    organizationId,
  ])

  const kindOptions = React.useMemo(() => {
    if (!showKindStep) return []
    return buildOrganizationFamilyKindOptions({
      intent,
      locations,
      subjectOrganizationId: organizationId,
      connections: existingConnections,
      edgesByLocationId,
      excludeConnectionId,
      occupancyLoaded,
    })
  }, [
    edgesByLocationId,
    existingConnections,
    excludeConnectionId,
    intent,
    locations,
    occupancyLoaded,
    organizationId,
    showKindStep,
  ])

  const editKindOptions = mutationAlternatives?.changeKind ?? []
  const changeTargetLocations = mutationAlternatives?.changeTarget ?? []

  const activeKind = (() => {
    if (resolvedAddKind) return resolvedAddKind
    if (defaultAddKind) return defaultAddKind
    if (mode === 'changeKind' || mode === 'changeTarget') {
      return selectedKind ?? initialConnection?.kind ?? null
    }
    return resolveActiveConnectionKind(
      selectedKind,
      kindOptions,
    ) as OrganizationLocationConnectionKind | null
  })()

  const eligibleLocations = React.useMemo(() => {
    if (mode === 'changeTarget') {
      return changeTargetLocations
    }
    if (!activeKind) return []
    return filterLocationsForOrganizationKind(
      locations,
      activeKind,
      organizationId,
      existingConnections,
      edgesByLocationId,
      excludeConnectionId,
    )
  }, [
    activeKind,
    changeTargetLocations,
    edgesByLocationId,
    existingConnections,
    excludeConnectionId,
    locations,
    mode,
    organizationId,
  ])

  const lockedLocation = React.useMemo(
    () =>
      mode === 'changeKind'
        ? (locations.find((location) => location.id === initialConnection?.locationId) ?? null)
        : null,
    [initialConnection?.locationId, locations, mode],
  )

  const showLocationPicker = (mode === 'add' && Boolean(activeKind)) || mode === 'changeTarget'
  const canSubmit = Boolean(selectedLocationId && activeKind && !isSubmitting)

  const handleKindChange = (value: string) => {
    const nextKind = value as OrganizationLocationConnectionKind
    setSelectedKind(nextKind)
    if (!selectedLocationId) return

    const locationForSelection = locations.find((location) => location.id === selectedLocationId)
    if (
      locationForSelection &&
      !locationEligibleForOrganizationKind(
        locationForSelection,
        nextKind,
        organizationId,
        existingConnections,
        edgesByLocationId,
        excludeConnectionId,
      )
    ) {
      setSelectedLocationId(null)
    }
  }

  const handleSubmit = async () => {
    if (!selectedLocationId || !activeKind) return
    await onSubmit({ locationId: selectedLocationId, kind: activeKind })
  }

  const title = (() => {
    if (mode === 'changeTarget') return ORGANIZATION_DRAWER_CHANGE_TARGET_TITLE
    if (mode === 'add' && resolvedAddKind) {
      return resolveOrganizationForwardAddDrawerTitle(resolvedAddKind)
    }
    if (mode === 'add') return ORGANIZATION_DRAWER_ADD_TITLES[intent]
    return ORGANIZATION_DRAWER_CHANGE_KIND_TITLE
  })()

  const instructionCopy =
    mode === 'add' && resolvedAddKind
      ? resolveOrganizationForwardAddDrawerInstruction(resolvedAddKind)
      : null

  const familyAddDrawerHelper =
    mode === 'add' && !resolvedAddKind
      ? resolveOrganizationForwardFamilyAddDrawerHelper(intent)
      : undefined

  const submitLabel = (() => {
    if (mode === 'changeTarget') return ORGANIZATION_DRAWER_CHANGE_TARGET_SUBMIT_LABEL
    if (mode === 'add' && resolvedAddKind) {
      return resolveOrganizationForwardAddSubmitLabel(resolvedAddKind)
    }
    if (mode === 'add') return ORGANIZATION_DRAWER_SUBMIT_ADD_LABELS[intent]
    return ORGANIZATION_DRAWER_CHANGE_KIND_SUBMIT_LABEL
  })()

  const fullyLinkedReason = ORGANIZATION_DRAWER_FULLY_LINKED_REASONS[intent]
  const organizationContext = `${organization.name} · ${getOrganizationKindLabel(organization.organizationKind)}`

  const mutationEmptyMessage =
    mode === 'changeTarget'
      ? RELATIONSHIP_ALTERNATIVES_EMPTY_MESSAGES.changeTarget
      : mode === 'changeKind'
        ? RELATIONSHIP_ALTERNATIVES_EMPTY_MESSAGES.changeKind
        : null

  const showMutationEmptyState =
    (mode === 'changeKind' && editKindOptions.length === 0) ||
    (mode === 'changeTarget' && changeTargetLocations.length === 0)

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      {...catalogPickerShellProps()}
      rowLayout="entity-card"
      pickerEnabled={showLocationPicker && !showMutationEmptyState}
      searchPlaceholder={ORGANIZATION_LOCATION_LINK_SEARCH_PLACEHOLDER}
      noResultsMessage={ORGANIZATION_LOCATION_LINK_NO_RESULTS}
      noItemsMessage={ORGANIZATION_LOCATION_LINK_NO_ITEMS}
      headerBelowDescription={
        <div className="space-y-4">
          <RelationshipDrawerContextHeader context={organizationContext} />
          {instructionCopy ? (
            <Text variant="muted" className="text-sm">
              {instructionCopy}
            </Text>
          ) : familyAddDrawerHelper ? (
            <Text variant="muted" className="text-sm">
              {familyAddDrawerHelper}
            </Text>
          ) : null}
          {showKindStep ? (
            <LocationConnectionKindStep
              id="organization-location-connection-kind"
              label={ORGANIZATION_DRAWER_KIND_FIELD_LABELS[intent]}
              options={kindOptions}
              value={activeKind}
              onValueChange={handleKindChange}
              changeLabel={ORGANIZATION_DRAWER_KIND_CHANGE_LABEL}
            />
          ) : null}
          {mode === 'changeKind' && lockedLocation ? (
            <RelationshipDrawerSubjectField
              label={RELATIONSHIP_DRAWER_LOCATION_FIELD_LABEL}
              value={lockedLocation.name}
            />
          ) : null}
          {mode === 'changeKind' && activeKind ? (
            <RelationshipDrawerSubjectField
              label={ORGANIZATION_DRAWER_KIND_FIELD_LABELS[intent]}
              value={getOrganizationLocationConnectionLabel(activeKind)}
            />
          ) : null}
          {mode === 'changeTarget' && activeKind ? (
            <RelationshipDrawerSubjectField
              label={ORGANIZATION_DRAWER_KIND_FIELD_LABELS[intent]}
              value={getOrganizationLocationConnectionLabel(activeKind)}
            />
          ) : null}
          {mode === 'changeKind' && lockedLocation && editKindOptions.length > 0 ? (
            <LocationConnectionKindStep
              id="organization-location-connection-edit-kind"
              label={ORGANIZATION_DRAWER_KIND_FIELD_LABELS[intent]}
              options={editKindOptions}
              value={activeKind}
              onValueChange={(value) =>
                setSelectedKind(value as OrganizationLocationConnectionKind)
              }
              changeLabel={ORGANIZATION_DRAWER_KIND_CHANGE_LABEL}
              defaultExpanded
            />
          ) : null}
          {showLocationPicker && !showMutationEmptyState ? (
            <Heading variant="label" as="p">
              {ORGANIZATION_LOCATION_LINK_FIELD_LABEL}
            </Heading>
          ) : null}
          {!showLocationPicker && mode === 'add' && !activeKind ? (
            <Text variant="muted" className="text-sm" role="status">
              {ORGANIZATION_LOCATION_LINK_CHOOSE_KIND_MESSAGE}
            </Text>
          ) : null}
          {showMutationEmptyState && mutationEmptyMessage ? (
            <Text variant="muted" className="text-sm" role="status">
              {mutationEmptyMessage}
            </Text>
          ) : null}
        </div>
      }
      emptyState={
        showLocationPicker && mode === 'add' && !activeKind ? (
          <Text variant="muted" className="text-sm" role="status">
            {ORGANIZATION_LOCATION_LINK_CHOOSE_KIND_MESSAGE}
          </Text>
        ) : undefined
      }
      footer={
        !showMutationEmptyState && (showLocationPicker || mode === 'changeKind') && activeKind ? (
          <Button type="button" disabled={!canSubmit} onClick={() => void handleSubmit()}>
            {submitLabel}
          </Button>
        ) : undefined
      }
      items={showLocationPicker && !showMutationEmptyState ? eligibleLocations : []}
      getItemKey={(location) => location.id}
      getItemToolbarLabel={(location) => location.name}
      getSearchText={buildLocationSearchText}
      renderItemHeader={(location) => {
        const isSelected = selectedLocationId === location.id
        const edgesAtLocation = resolveEdgesAtLocation(location.id, edgesByLocationId)
        const kindAvailable =
          activeKind != null &&
          organizationLocationConnectionHasAvailableKind({
            locationId: location.id,
            kinds: [activeKind],
            subjectOrganizationId: organizationId,
            connections: existingConnections,
            edgesAtLocation,
            excludeConnectionId,
          })
        return (
          <ContentEntityCard
            chrome="embedded"
            density="compact"
            heading={location.name}
            subheading={kindAvailable ? getLocationKindLabel(location.kind) : fullyLinkedReason}
            imageKey={location.imageKey}
            disabled={!kindAvailable}
            endSlot={
              <CatalogPickerSelectionActions
                phase={resolveCatalogPickerRowActionPhase({ isSelected, isSuccess: false })}
                canSelect={kindAvailable}
                addLabel={isSelected ? 'Selected' : 'Select'}
                onAdd={() => setSelectedLocationId(location.id)}
                onRemove={() => setSelectedLocationId(null)}
              />
            }
          />
        )
      }}
    />
  )
}
