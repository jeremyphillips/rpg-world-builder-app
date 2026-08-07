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
import { Button, CatalogPickerSheet, Heading, SegmentedControl, Text } from '@rpg/ui'

import { LocationConnectionKindStep } from '../../components/location-connection-kind-step.client'
import {
  CatalogPickerSelectionActions,
  catalogPickerShellProps,
  resolveCatalogPickerRowActionPhase,
} from '@/features/character'

import { ContentEntityCard } from '../../lib/content-entity-card.client'
import { EntityReplacementSection } from '../../lib/entity-replacement/entity-replacement-section.client'
import { RelationshipDrawerContextHeader } from '../../lib/relationship/relationship-drawer-context-header.client'
import type { EntityReplacementCurrentSnapshot } from '../../lib/entity-replacement/entity-replacement-current-entity'
import { RELATIONSHIP_DRAWER_LOCATION_FIELD_LABEL } from '../../lib/relationship/relationship-drawer-field-labels'
import { RelationshipDrawerSubjectField } from '../../lib/relationship/relationship-drawer-subject-field.client'
import {
  RELATIONSHIP_ALTERNATIVES_EMPTY_MESSAGES,
  resolveRelationshipAlternatives,
  type RelationshipCandidateSet,
} from '../../lib/relationship/relationship-alternatives'
import { resolveRelationshipCandidateSet } from '../../lib/relationship/relationship-candidate-set'

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
  buildOrganizationLocationChangeKindOptions,
  resolveActiveConnectionKind,
  type LocationConnectionKindOption,
} from '../../lib/location-connection-kind-options'
import { organizationLocationConnectionHasAvailableKind } from '../../lib/location-connection-duplicate-keys'
import type { OrganizationForwardDrawerMode } from '../../lib/relationship/relationship-mutation-mode'
import {
  DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION,
  resolveOrganizationForwardAddDrawerInstruction,
  resolveOrganizationForwardAddDrawerTitle,
  resolveOrganizationForwardAddSubmitLabel,
  resolveOrganizationForwardChangeTargetDrawerTitle,
  resolveOrganizationForwardFamilyAddDrawerHelper,
  resolveOrganizationForwardTargetPresentation,
} from '../lib/organization-location-connection-surface-copy'
import {
  filterLocationsByTargetBrowseScope,
  ORGANIZATION_LOCATION_TARGET_BROWSE_SCOPE_LABEL,
  resolveTargetBrowseScopeOptions,
  type OrganizationLocationTargetBrowseScope,
} from '../lib/organization-location-target-browse-scope'
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
  locationCandidates?: RelationshipCandidateSet<Location>
  existingConnections: readonly ExistingConnection[]
  edgesByLocationId?: Readonly<
    Record<string, readonly OrganizationLocationConnectionEdgeAtLocation[]>
  >
  occupancyLoaded?: boolean
  initialConnection?: ExistingConnection
  currentEndpoint?: EntityReplacementCurrentSnapshot
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
  locationCandidates: locationCandidatesInput,
  existingConnections,
  edgesByLocationId,
  occupancyLoaded = true,
  initialConnection,
  currentEndpoint,
  drawerAlternatives,
  isSubmitting = false,
  onSubmit,
}: OrganizationLocationConnectionLinkDrawerProps) {
  const locationCandidates = resolveRelationshipCandidateSet(
    locationCandidatesInput ?? {
      items: locations,
      isAuthoritativeDomainSet: false,
    },
  )
  const candidateLocations = locationCandidates.items

  const resolvedAddKind = mode === 'add' && addKind != null ? addKind : undefined
  const defaultAddKind = mode === 'add' ? resolveDefaultAddKind(intent) : null

  const [selectedLocationId, setSelectedLocationId] = React.useState<string | null>(
    mode === 'changeTarget' ? null : (initialConnection?.locationId ?? null),
  )
  const [selectedKind, setSelectedKind] = React.useState<OrganizationLocationConnectionKind | null>(
    resolvedAddKind ?? defaultAddKind ?? initialConnection?.kind ?? null,
  )
  const [locationBrowseScope, setLocationBrowseScope] =
    React.useState<OrganizationLocationTargetBrowseScope>('all')

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
        locationCandidates,
        connections: existingConnections,
        edgesByLocationId,
      }).alternatives
    }
    return undefined
  }, [
    candidateLocations,
    drawerAlternatives,
    edgesByLocationId,
    existingConnections,
    initialConnection,
    locationCandidates,
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

  const changeKindGatingAlternates = mutationAlternatives?.changeKind ?? []
  const changeTargetLocations = mutationAlternatives?.changeTarget ?? []

  const lockedLocation = React.useMemo(
    () =>
      mode === 'changeKind'
        ? (locations.find((location) => location.id === initialConnection?.locationId) ?? null)
        : null,
    [initialConnection?.locationId, locations, mode],
  )

  const changeKindPickerOptions = React.useMemo(() => {
    if (mode !== 'changeKind' || !lockedLocation || !initialConnection) {
      return []
    }

    return buildOrganizationLocationChangeKindOptions({
      location: lockedLocation,
      intent,
      currentKind: initialConnection.kind,
      subjectOrganizationId: organizationId,
      connections: existingConnections,
      edgesAtLocation: resolveEdgesAtLocation(lockedLocation.id, edgesByLocationId),
      excludeConnectionId,
    })
  }, [
    edgesByLocationId,
    excludeConnectionId,
    existingConnections,
    initialConnection,
    intent,
    lockedLocation,
    mode,
    organizationId,
  ])

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

  const changeTargetScanLocations = React.useMemo(() => {
    if (mode !== 'changeTarget' || !initialConnection) {
      return []
    }

    if (changeTargetLocations.length > 0) {
      return changeTargetLocations
    }

    return filterLocationsForOrganizationKind(
      candidateLocations,
      initialConnection.kind,
      organizationId,
      existingConnections,
      edgesByLocationId,
      excludeConnectionId,
    ).filter((location) => location.id !== initialConnection.locationId)
  }, [
    candidateLocations,
    changeTargetLocations,
    edgesByLocationId,
    excludeConnectionId,
    existingConnections,
    initialConnection,
    mode,
    organizationId,
  ])

  const eligibleLocations = React.useMemo(() => {
    if (mode === 'changeTarget') {
      return changeTargetScanLocations
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
    changeTargetScanLocations,
    edgesByLocationId,
    existingConnections,
    excludeConnectionId,
    locations,
    mode,
    organizationId,
  ])

  const showLocationPicker =
    ((mode === 'add' && Boolean(activeKind)) || mode === 'changeTarget') &&
    !currentEndpoint?.unavailable
  const hasTargetChange =
    mode === 'changeTarget'
      ? selectedLocationId != null && selectedLocationId !== initialConnection?.locationId
      : true
  const hasChange =
    (mode !== 'changeKind' || activeKind !== initialConnection?.kind) && hasTargetChange
  const canSubmit = Boolean(selectedLocationId && activeKind) && hasChange && !isSubmitting

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

  const targetPresentation = activeKind
    ? resolveOrganizationForwardTargetPresentation(activeKind)
    : DEFAULT_ORGANIZATION_FORWARD_TARGET_PRESENTATION

  const targetFieldLabel = targetPresentation.targetLabel

  const title = (() => {
    if (mode === 'changeTarget' && activeKind) {
      return resolveOrganizationForwardChangeTargetDrawerTitle(activeKind)
    }
    if (mode === 'changeTarget') return ORGANIZATION_DRAWER_CHANGE_TARGET_TITLE
    if (mode === 'add' && resolvedAddKind) {
      return resolveOrganizationForwardAddDrawerTitle(resolvedAddKind)
    }
    if (mode === 'add') return ORGANIZATION_DRAWER_ADD_TITLES[intent]
    return ORGANIZATION_DRAWER_CHANGE_KIND_TITLE
  })()

  const instructionCopy =
    mode === 'add' && resolvedAddKind && !targetPresentation.targetHelp
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
    (mode === 'changeKind' && changeKindGatingAlternates.length === 0) ||
    (mode === 'changeTarget' &&
      locationCandidates.isAuthoritativeDomainSet &&
      changeTargetScanLocations.length === 0)

  const browseScopeOptions = React.useMemo(() => {
    if (!targetPresentation.browseScopes?.length) {
      return []
    }
    return resolveTargetBrowseScopeOptions(targetPresentation.browseScopes, eligibleLocations)
  }, [eligibleLocations, targetPresentation.browseScopes])

  const showTargetBrowseScopeControl =
    browseScopeOptions.length > 0 && showLocationPicker && !showMutationEmptyState

  const effectiveLocationBrowseScope = React.useMemo(() => {
    if (!showTargetBrowseScopeControl) {
      return locationBrowseScope
    }

    const activeScope = browseScopeOptions.find((option) => option.value === locationBrowseScope)
    if (activeScope?.disabled && locationBrowseScope !== 'all') {
      return 'all'
    }

    return locationBrowseScope
  }, [browseScopeOptions, locationBrowseScope, showTargetBrowseScopeControl])

  const pickerLocations = React.useMemo(() => {
    if (!showTargetBrowseScopeControl) {
      return eligibleLocations
    }
    return filterLocationsByTargetBrowseScope(eligibleLocations, effectiveLocationBrowseScope)
  }, [effectiveLocationBrowseScope, eligibleLocations, showTargetBrowseScopeControl])

  return (
    <CatalogPickerSheet
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      {...catalogPickerShellProps()}
      rowLayout="entity-card"
      pickerEnabled={showLocationPicker && !showMutationEmptyState}
      searchPlaceholder={targetPresentation.searchPlaceholder}
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
          {mode === 'changeTarget' && activeKind ? (
            <RelationshipDrawerSubjectField
              label={ORGANIZATION_DRAWER_KIND_FIELD_LABELS[intent]}
              value={getOrganizationLocationConnectionLabel(activeKind)}
            />
          ) : null}
          {mode === 'changeTarget' &&
          (currentEndpoint || (showLocationPicker && !showMutationEmptyState)) ? (
            <EntityReplacementSection
              entityLabel={RELATIONSHIP_DRAWER_LOCATION_FIELD_LABEL}
              current={currentEndpoint}
              showNewSection={showLocationPicker && !showMutationEmptyState}
              newHelper={targetPresentation.targetHelp}
            >
              {showTargetBrowseScopeControl ? (
                <SegmentedControl
                  aria-label={ORGANIZATION_LOCATION_TARGET_BROWSE_SCOPE_LABEL}
                  value={locationBrowseScope}
                  options={browseScopeOptions}
                  onValueChange={setLocationBrowseScope}
                  fullWidth
                />
              ) : null}
            </EntityReplacementSection>
          ) : null}
          {mode === 'changeKind' && lockedLocation && changeKindPickerOptions.length > 0 ? (
            <LocationConnectionKindStep
              id="organization-location-connection-edit-kind"
              label={ORGANIZATION_DRAWER_KIND_FIELD_LABELS[intent]}
              options={changeKindPickerOptions}
              value={activeKind}
              onValueChange={(value) =>
                setSelectedKind(value as OrganizationLocationConnectionKind)
              }
              changeLabel={ORGANIZATION_DRAWER_KIND_CHANGE_LABEL}
              defaultExpanded
            />
          ) : null}
          {showLocationPicker && !showMutationEmptyState && mode !== 'changeTarget' ? (
            <div className="space-y-2">
              <Heading variant="label" as="p">
                {targetFieldLabel}
              </Heading>
              {targetPresentation.targetHelp ? (
                <Text variant="muted" className="text-sm">
                  {targetPresentation.targetHelp}
                </Text>
              ) : null}
              {showTargetBrowseScopeControl ? (
                <SegmentedControl
                  aria-label={ORGANIZATION_LOCATION_TARGET_BROWSE_SCOPE_LABEL}
                  value={locationBrowseScope}
                  options={browseScopeOptions}
                  onValueChange={setLocationBrowseScope}
                  fullWidth
                />
              ) : null}
            </div>
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
      hasStructuredFilters={showTargetBrowseScopeControl && effectiveLocationBrowseScope !== 'all'}
      items={showLocationPicker && !showMutationEmptyState ? pickerLocations : []}
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
